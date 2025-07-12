import { create } from 'zustand';

/**
 * 消息附件数据结构
 */
export interface MessageAttachment {
  /** 附件ID */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** MIME类型 */
  type: string;
  /** 上传后的文件ID */
  upload_file_id: string;
}

/**
 * 聊天消息数据结构
 * @description 包含消息基本信息和持久化相关字段
 */
export interface ChatMessage {
  /** 唯一消息ID（前端生成） */
  id: string;
  /** 消息内容 */
  text: string;
  /** 是否为用户消息 */
  isUser: boolean;
  /** 标记助手消息是否仍在流式传输中 */
  isStreaming?: boolean;
  /** 标记是否被用户手动停止 */
  wasManuallyStopped?: boolean;
  /** 消息相关的错误信息 */
  error?: string | null;
  /** 消息附带的文件附件 */
  attachments?: MessageAttachment[];
  /** 消息顺序索引，0=用户消息，1=助手消息，2=系统消息等 */
  sequence_index?: number;

  /** 数据库中的消息ID，保存成功后才有值 */
  db_id?: string;
  /** 消息持久化状态，用于UI展示 */
  persistenceStatus?: 'pending' | 'saving' | 'saved' | 'error';
  /** 消息角色，与数据库保持一致 */
  role?: 'user' | 'assistant' | 'system';
  /** Dify消息ID，用于关联外部消息 */
  dify_message_id?: string;
  /** Token计数，可用于计费或统计 */
  token_count?: number;
  /** 元数据，存储附加信息 */
  metadata?: Record<string, any>;
}

/**
 * 聊天状态管理接口
 */
interface ChatState {
  /** 完整的消息列表 */
  messages: ChatMessage[];
  /** 当前正在流式传输的助手消息ID，null表示没有进行中的流 */
  streamingMessageId: string | null;
  /** 是否正在等待API响应（流开始之前或非流式响应） */
  isWaitingForResponse: boolean;
  /** 当前活跃对话的唯一标识符，null表示当前是一个全新的对话 */
  currentConversationId: string | null;
  /** 当前流式任务的Task ID，从Dify流式响应中获取 */
  currentTaskId: string | null;

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
   * 设置/更新当前对话ID
   * @param conversationId 对话ID，null表示新对话
   */
  setCurrentConversationId: (conversationId: string | null) => void;

  /**
   * 设置/更新当前流式任务ID
   * @param taskId 任务ID，null表示无进行中任务
   */
  setCurrentTaskId: (taskId: string | null) => void;

  /**
   * 更新消息的特定属性
   * @param id 消息ID
   * @param updates 要更新的属性
   */
  updateMessage: (
    id: string,
    updates: Partial<Omit<ChatMessage, 'id' | 'isUser'>>
  ) => void;
}

/**
 * 聊天状态管理Store
 * @description 使用Zustand管理聊天相关的状态和操作
 */
export const useChatStore = create<ChatState>((set, get) => ({
  // 初始状态
  messages: [],
  streamingMessageId: null,
  isWaitingForResponse: false,
  currentConversationId: null,
  currentTaskId: null,

  // Action 实现
  addMessage: messageData => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newMessage = { id, ...messageData };

    set(state => ({
      messages: [...state.messages, newMessage],
      streamingMessageId: messageData.isStreaming
        ? id
        : state.streamingMessageId,
    }));

    return newMessage;
  },

  appendMessageChunk: (id, chunk) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, text: message.text + chunk } : message
      ),
    }));
  },

  finalizeStreamingMessage: id => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, isStreaming: false } : message
      ),
      streamingMessageId:
        state.streamingMessageId === id ? null : state.streamingMessageId,
    }));
  },

  markAsManuallyStopped: id => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id
          ? { ...message, wasManuallyStopped: true, isStreaming: false }
          : message
      ),
      streamingMessageId:
        state.streamingMessageId === id ? null : state.streamingMessageId,
    }));
  },

  setMessageError: (id, error) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, error } : message
      ),
    }));
  },

  clearMessages: () => {
    set(() => ({
      messages: [],
      streamingMessageId: null,
    }));
  },

  setIsWaitingForResponse: status => {
    set(() => ({
      isWaitingForResponse: status,
    }));
  },

  setCurrentConversationId: conversationId => {
    set(() => ({
      currentConversationId: conversationId,
    }));
  },

  setCurrentTaskId: taskId => {
    set(() => ({
      currentTaskId: taskId,
    }));
  },

  updateMessage: (id, updates) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, ...updates } : message
      ),
    }));
  },
}));

/**
 * 获取当前是否正在处理消息（等待响应或正在流式传输）
 */
export const selectIsProcessing = (state: ChatState): boolean =>
  state.isWaitingForResponse || state.streamingMessageId !== null;
