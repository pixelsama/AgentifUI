import { create } from 'zustand';

// --- 消息定义 ---
export interface ChatMessage {
  id: string; // 唯一消息 ID
  text: string; // 消息内容
  isUser: boolean; // 是否为用户消息
  isStreaming?: boolean; // 标记助手消息是否仍在流式传输中
  wasManuallyStopped?: boolean; // 标记是否被用户手动停止
  error?: string | null; // 消息相关的错误信息
  // 可以添加时间戳等其他元数据
  // timestamp?: number;
}

// --- Store 状态接口 ---
interface ChatState {
  messages: ChatMessage[]; // 完整的消息列表
  streamingMessageId: string | null; // 当前正在流式传输的助手消息ID，null表示没有进行中的流
  isWaitingForResponse: boolean; // 是否正在等待API响应（流开始之前或非流式响应）
  // --- BEGIN COMMENT ---
  // 当前活跃对话的唯一标识符。
  // null 表示当前是一个全新的对话，尚未从后端获取到 ID。
  // --- END COMMENT ---
  currentConversationId: string | null;

  // --- BEGIN COMMENT ---
  // 当前流式任务的 Task ID。
  // 从 Dify 流式响应中获取，用于后续可能的操作（如停止任务）。
  // null 表示当前没有活动的或已知的流式任务 ID。
  // --- END COMMENT ---
  currentTaskId: string | null;

  // --- 操作 Actions ---
  /**
   * 添加一条新消息到列表
   * @param messageData 消息数据 (除ID外)
   * @returns 添加的消息对象 (包含生成的ID)
   */
  addMessage: (messageData: Omit<ChatMessage, 'id'>) => ChatMessage;

  /**
   * 向指定ID的消息追加文本块 (用于流式输出)
   * @param id 消息ID
   * @param chunk 要追加的文本块
   */
  appendMessageChunk: (id: string, chunk: string) => void;

  /**
   * 标记指定ID的消息流式传输完成
   * @param id 消息ID
   */
  finalizeStreamingMessage: (id: string) => void;

  /**
   * 标记消息为手动停止
   * @param id 消息ID
   */
  markAsManuallyStopped: (id: string) => void;

  /**
   * 设置指定ID消息的错误状态
   * @param id 消息ID
   * @param error 错误信息，null表示清除错误
   */
  setMessageError: (id: string, error: string | null) => void;

  /**
   * 清除所有消息
   */
  clearMessages: () => void;

  /**
   * 设置是否正在等待API响应的状态
   * @param status 等待状态
   */
  setIsWaitingForResponse: (status: boolean) => void;

  /**
   * 设置当前活跃的对话 ID。
   * 通常在开始新对话（设为 null）或从后端获取到 ID 后调用。
   * @param id 对话 ID，或 null 表示新对话
   */
  setCurrentConversationId: (id: string | null) => void;

  // --- BEGIN COMMENT ---
  // 设置当前流式任务的 Task ID。
  // --- END COMMENT ---
  setCurrentTaskId: (taskId: string | null) => void;
}

// --- Store 实现 ---
export const useChatStore = create<ChatState>((set, get) => ({
  // --- 初始状态 ---
  messages: [],
  streamingMessageId: null,
  isWaitingForResponse: false,
  currentConversationId: null, // 初始为 null
  currentTaskId: null, // --- BEGIN COMMENT --- 初始化 Task ID 为 null --- END COMMENT ---

  // --- Action 实现 ---
  addMessage: (messageData) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: crypto.randomUUID(), // 使用内置 crypto 生成唯一 ID
      isStreaming: messageData.isStreaming ?? false, // 默认非流式
      wasManuallyStopped: false,
      error: null,
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    // --- BEGIN COMMENT ---
    // 返回创建的消息对象，方便后续操作（如设置流式ID）
    // --- END COMMENT ---
    return newMessage;
  },

  appendMessageChunk: (id, chunk) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, text: msg.text + chunk } : msg
      ),
    }));
  },

  finalizeStreamingMessage: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: false, wasManuallyStopped: false } : msg
      ),
      streamingMessageId: state.streamingMessageId === id ? null : state.streamingMessageId,
      isWaitingForResponse: state.streamingMessageId === id ? false : state.isWaitingForResponse,
      currentTaskId: state.streamingMessageId === id ? null : state.currentTaskId,
    }));
    console.log(`finalizeStreamingMessage (natural end) called for ${id}. State updated.`);
  },

  markAsManuallyStopped: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: false, wasManuallyStopped: true } : msg
      ),
      streamingMessageId: state.streamingMessageId === id ? null : state.streamingMessageId,
      isWaitingForResponse: state.streamingMessageId === id ? false : state.isWaitingForResponse,
    }));
    console.log(`markAsManuallyStopped called for ${id}. State updated.`);
  },

  setMessageError: (id, error) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, error: error, isStreaming: false, wasManuallyStopped: false } : msg
      ),
      streamingMessageId: state.streamingMessageId === id ? null : state.streamingMessageId,
      isWaitingForResponse: state.streamingMessageId === id ? false : state.isWaitingForResponse,
      currentTaskId: state.streamingMessageId === id ? null : state.currentTaskId,
    }));
  },

  clearMessages: () => set({ messages: [], streamingMessageId: null, isWaitingForResponse: false }),

  setIsWaitingForResponse: (status) => set({ isWaitingForResponse: status }),

  setCurrentConversationId: (id) => {
    // --- BEGIN COMMENT ---
    // 设置对话 ID。这里可以根据需求决定是否在切换对话时清空消息列表。
    // 暂时只设置 ID。
    // --- END COMMENT ---
    set({ currentConversationId: id });
    console.log("Current conversation ID set to:", id);
  },

  // --- BEGIN COMMENT ---
  // 实现设置 Task ID 的 Action
  // --- END COMMENT ---
  setCurrentTaskId: (taskId) => { 
    set({ currentTaskId: taskId });
    console.log("Current Task ID set to:", taskId);
  },

}));

// --- 导出常量 (如果需要) ---
// export const MAX_MESSAGES = 100;

// --- 辅助 Selector (可选) ---
/**
 * 获取当前是否正在处理消息（等待响应或正在流式传输）
 */
export const selectIsProcessing = (state: ChatState): boolean =>
  state.isWaitingForResponse || state.streamingMessageId !== null; 