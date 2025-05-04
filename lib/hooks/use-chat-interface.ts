import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatInputStore } from '@lib/stores/chat-input-store';
import { useChatStore, selectIsProcessing, ChatMessage } from '@lib/stores/chat-store';

// --- BEGIN COMMENT ---
// 定义 API 响应流的接口结构 (占位符)
// 真实的实现需要根据后端 API (如 Dify 或其他) 的流格式来解析
// --- END COMMENT ---
interface ChatApiResponse {
  stream: AsyncGenerator<string, void, undefined>; // 文本块流
  conversationId: string; // 从响应中提取的对话 ID (模拟中总是返回)
  taskId?: string; // 模拟中可以省略或给个假值
  // 可能还有其他元数据
}

// --- BEGIN COMMENT ---
// 恢复模拟 API 函数，使其返回 ChatApiResponse 结构
// --- END COMMENT ---
async function simulateStreamApiResponse(
  prompt: string,
  currentConversationId: string | null,
  options: { user: string /* ...其他选项 */ }
): Promise<ChatApiResponse> {
  console.log("--- simulateStreamApiResponse Called ---", { prompt, currentConversationId, options });
  await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟

  // --- BEGIN COMMENT ---
  // 模拟 ID 生成：如果是 null (新对话)，生成一个新 ID；否则使用传入的 ID。
  // 真实 API 可能在响应的特定事件/头中返回新 ID。
  // --- END COMMENT ---
  const conversationIdToReturn = currentConversationId ?? `sim-conv-${crypto.randomUUID().substring(0, 8)}`;
  console.log(`[Simulate] Using/Returning Conversation ID: ${conversationIdToReturn}`);

  // --- BEGIN COMMENT ---
  // 创建一个立即 resolve 的 Promise 来模拟获取 ID (因为模拟中我们立即就知道ID了)
  // 真实的场景下，这个 Promise 可能在解析流的早期才 resolve。
  // --- END COMMENT ---
  // const conversationIdPromise = Promise.resolve(conversationIdToReturn);

  // --- BEGIN COMMENT ---
  // 创建模拟文本流
  // --- END COMMENT ---
  async function* generateStream(): AsyncGenerator<string, void, undefined> {
    const mockLongResponse = `[对话ID: ${conversationIdToReturn}] 这是模拟回复。

Markdown: **加粗** *斜体*。

\`\`\`python
def hello():
  print("Hello from stream!")
\`\`\`
`;
    let index = 0;
    try {
      while (index < mockLongResponse.length) {
        const chunkSize = Math.floor(Math.random() * 10) + 5; // 每次输出 5-14 字符
        const nextIndex = Math.min(index + chunkSize, mockLongResponse.length);
        const chunk = mockLongResponse.substring(index, nextIndex);
        yield chunk;
        index = nextIndex;
        await new Promise(resolve => setTimeout(resolve, 50)); // 模拟块之间的延迟
      }
    } finally {
      console.log(`[Simulate] Stream generation finished for ${conversationIdToReturn}.`);
    }
  }

  return {
    stream: generateStream(),
    conversationId: conversationIdToReturn,
    // taskId: `sim-task-${crypto.randomUUID().substring(0, 8)}` // 可以模拟 taskId
  };
}

export function useChatInterface() {
  const router = useRouter();
  const { isWelcomeScreen, setIsWelcomeScreen } = useChatInputStore();

  // --- 从 Store 获取状态和 Actions ---
  const messages = useChatStore(state => state.messages);
  const addMessage = useChatStore(state => state.addMessage);
  const appendMessageChunk = useChatStore(state => state.appendMessageChunk);
  const finalizeStreamingMessage = useChatStore(state => state.finalizeStreamingMessage);
  const setMessageError = useChatStore(state => state.setMessageError);
  const setIsWaitingForResponse = useChatStore(state => state.setIsWaitingForResponse);
  const isWaitingForResponse = useChatStore(state => state.isWaitingForResponse);
  // --- BEGIN COMMENT ---
  // 获取当前对话 ID 和设置函数
  // --- END COMMENT ---
  const currentConversationId = useChatStore(state => state.currentConversationId);
  const setCurrentConversationId = useChatStore(state => state.setCurrentConversationId);
  const isProcessing = useChatStore(selectIsProcessing);

  // --- BEGIN COMMENT ---
  // TODO: 获取真实的用户标识符，这里使用占位符
  // --- END COMMENT ---
  const currentUserIdentifier = "user-placeholder-123"; 

  // --- 处理消息提交 ---
  const handleSubmit = useCallback(async (message: string) => {
    if (isProcessing) {
      console.log("Blocking submission: Already processing a message.");
      return;
    }

    setIsWaitingForResponse(true);
    addMessage({ text: message, isUser: true });

    if (isWelcomeScreen) {
      setIsWelcomeScreen(false);
    }

    let assistantMessageId: string | null = null;
    // --- BEGIN COMMENT ---
    // TODO: 需要追踪 taskId 以便实现真实的停止功能
    // let taskId: string | null = null;
    // --- END COMMENT ---

    try {
      // --- BEGIN COMMENT ---
      // 调用恢复后的模拟 API 函数，传递当前对话 ID
      // --- END COMMENT ---
      console.log(`[handleSubmit] Calling API with currentConversationId: ${currentConversationId}`);
      const response = await simulateStreamApiResponse(
        message, 
        currentConversationId, 
        { user: currentUserIdentifier }
      );

      // --- BEGIN COMMENT ---
      // 处理模拟 API 返回的 conversationId
      // 仅当 Store 中的 ID 为 null (新对话) 时更新
      // --- END COMMENT ---
      const returnedConvId = response.conversationId;
      console.log("[handleSubmit] Received simulated conversationId from API response:", returnedConvId);
      if (currentConversationId === null && returnedConvId) {
        console.log("[handleSubmit] Current conversation ID is null, updating store with received ID:", returnedConvId);
        setCurrentConversationId(returnedConvId);
        // --- BEGIN COMMENT ---
        // 关键：在设置了新的对话 ID 到 Store 后，
        // 使用 router.replace 更新浏览器 URL。
        // 使用 replace 而不是 push 可以避免 "/chat/new" 出现在历史记录中。
        // 这也确保了如果用户刷新页面，会加载到这个新的对话 ID。
        // --- END COMMENT ---
        console.log(`[handleSubmit] Replacing URL with /chat/${returnedConvId}`);
        router.replace(`/chat/${returnedConvId}`, { scroll: false }); // scroll: false 避免页面滚动
      } else if (currentConversationId !== returnedConvId) {
          // --- BEGIN COMMENT ---
          // 添加一个日志，用于检测模拟/API 是否返回了预期的 ID
          // 正常情况下，对于已有对话，返回的 ID 应与发送的 ID 一致。
          // --- END COMMENT ---
          console.warn(`[handleSubmit] Mismatch: Sent ${currentConversationId}, but received ${returnedConvId}`);
      }

      // --- BEGIN COMMENT ---
      // 开始处理模拟文本流
      // --- END COMMENT ---
      console.log("[handleSubmit] Starting to process stream...");
      for await (const chunk of response.stream) {
        if (assistantMessageId === null) {
          const assistantMessage = addMessage({
            text: '', 
            isUser: false,
            isStreaming: true, 
          });
          assistantMessageId = assistantMessage.id;
          useChatStore.setState({ isWaitingForResponse: false, streamingMessageId: assistantMessageId });
          console.log("[handleSubmit] First chunk processed, assistant message created:", assistantMessageId);
        }

        if (assistantMessageId) {
          if (useChatStore.getState().streamingMessageId === assistantMessageId) {
            appendMessageChunk(assistantMessageId, chunk);
          } else {
            console.log("[handleSubmit] Stream processing stopped externally by user.");
            break; 
          }
        }
      }
      console.log("[handleSubmit] Finished processing stream.");

      // --- BEGIN COMMENT ---
      // 流处理结束逻辑 (保持不变)
      // --- END COMMENT ---
      if (assistantMessageId && useChatStore.getState().streamingMessageId === assistantMessageId) {
        console.log("[handleSubmit] Stream ended successfully, finalizing message:", assistantMessageId);
        finalizeStreamingMessage(assistantMessageId);
      } else if (!assistantMessageId) {
        console.log("[handleSubmit] Stream ended but no chunks received. Resetting waiting state.");
        setIsWaitingForResponse(false); 
      } else {
          console.log("[handleSubmit] Stream finalization skipped as it was stopped externally.");
      }

    } catch (error) {
      console.error("[handleSubmit] Error processing stream:", error);
      if (assistantMessageId) {
        setMessageError(assistantMessageId, `处理消息时发生错误: ${(error as Error).message}`);
      } else {
        setIsWaitingForResponse(false);
        // --- BEGIN COMMENT ---
        // 可以在这里添加一条对用户可见的错误消息
        // --- END COMMENT ---
        addMessage({ text: `抱歉，请求失败: ${(error as Error).message}`, isUser: false, error: "API 请求失败" });
      }
    }

  }, [
    // --- BEGIN COMMENT ---
    // 添加 router 到依赖项数组
    // --- END COMMENT ---
    isProcessing, 
    currentConversationId, 
    currentUserIdentifier, 
    addMessage, 
    setIsWaitingForResponse, 
    isWelcomeScreen, 
    setIsWelcomeScreen, 
    appendMessageChunk, 
    finalizeStreamingMessage, 
    setMessageError, 
    setCurrentConversationId, 
    router // 添加 router 依赖
  ]);

  // --- 停止处理 --- 
  const handleStopProcessing = useCallback(() => {
    const currentStreamingId = useChatStore.getState().streamingMessageId;
    if (currentStreamingId) {
      console.log("[handleStopProcessing] Stopping stream for ID:", currentStreamingId);
      // TODO: 调用真实停止 API (需要 taskId)
      finalizeStreamingMessage(currentStreamingId); // 立即更新前端状态
    } else {
      console.log("[handleStopProcessing] No active stream to stop.");
    }
  }, [finalizeStreamingMessage]);

  // --- 判断 UI 状态 ---
  const shouldShowWelcome = isWelcomeScreen && messages.length === 0;
  const shouldShowLoader = messages.length > 0;

  // --- 返回 Hook 接口 ---
  return {
    messages, 
    handleSubmit,
    handleStopProcessing, 
    shouldShowWelcome,
    shouldShowLoader,
    isWelcomeScreen,
    isProcessing, 
    isWaitingForResponse, 
    // --- BEGIN COMMENT ---
    // 可以选择性返回 currentConversationId 供调试或 UI 显示
    // currentConversationId,
    // --- END COMMENT ---
  };
} 