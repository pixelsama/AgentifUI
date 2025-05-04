import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatInputStore } from '@lib/stores/chat-input-store';
import { useChatStore, selectIsProcessing, ChatMessage } from '@lib/stores/chat-store';
import { streamDifyChat, stopDifyStreamingTask } from '@lib/services/dify/chat-service';
import type { DifyChatRequestPayload, DifyStopTaskResponse } from '@lib/services/dify/types';

// --- BEGIN COMMENT ---
// TODO: 将 Dify App ID 移到环境变量或配置文件中
// --- END COMMENT ---

// --- BEGIN COMMENT ---
// 定义前端使用的 Dify 应用标识符。
// 这个标识符将传递给后端代理 (/api/dify/[identifier]/...)，
// 后端代理再用这个标识符查找对应的 Dify API Key 和 URL。
// 推荐使用环境变量配置，例如 NEXT_PUBLIC_DIFY_APP_IDENTIFIER=default
// --- END COMMENT ---
// --- BEGIN COMMENT ---
// TODO (数据库/配置集成): 当前实现使用硬编码回退值 'default' 或单个环境变量作为应用标识符。
// 未来版本中，此标识符应根据用户选择或上下文动态确定。
// 例如：
// 1. 用户在 UI (如下拉菜单或侧边栏) 中选择了一个 Dify 应用。
// 2. 该选择更新了一个全局状态 (如 Zustand store)，存储当前激活的应用标识符 (如 '客服机器人')。
// 3. 此 Hook 从全局状态读取该标识符: `const appIdentifier = useAppStore(state => state.currentAppIdentifier);`
// 4. 或者，如果聊天会话已与特定应用关联，则基于 `currentConversationId` 从数据库查询关联的应用标识符。
// 最终，动态获取到的 `appIdentifier` 将传递给 `streamDifyChat` 函数。
// 届时，当前这种基于单一环境变量或硬编码值的逻辑将被移除。
// 后端代理 (`route.ts` 中的 `getDifyAppConfig`) 也将相应修改，根据标识符从数据库查询应用的 API Key 和 URL。
// --- END COMMENT ---
const DIFY_APP_IDENTIFIER = process.env.NEXT_PUBLIC_DIFY_APP_IDENTIFIER || "default";

// --- BEGIN COMMENT ---
// 定义 API 响应流的接口结构 (占位符)
// 真实的实现需要根据后端 API (如 Dify 或其他) 的流格式来解析
// --- END COMMENT ---
// interface ChatApiResponse { ... }

// --- BEGIN COMMENT ---
// 恢复模拟 API 函数，使其返回 ChatApiResponse 结构
// --- END COMMENT ---
// async function simulateStreamApiResponse(...) { ... }

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
  // --- BEGIN COMMENT --- 获取设置 Task ID 的 action --- END COMMENT ---
  const setCurrentTaskId = useChatStore(state => state.setCurrentTaskId); 

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
    // --- BEGIN COMMENT --- 清除之前的 Task ID --- END COMMENT ---
    setCurrentTaskId(null);

    try {
      // --- BEGIN COMMENT ---
      // 构造符合 Dify API 的请求体
      // 确保 'inputs' 字段总是存在，即使为空对象，因为 Dify API 要求它。
      // --- END COMMENT ---
      const payload: DifyChatRequestPayload = {
        query: message,
        user: currentUserIdentifier,
        response_mode: 'streaming',
        conversation_id: currentConversationId, // Store 中的 ID，可能为 null
        inputs: {}, // --- BEGIN MODIFICATION --- 取消注释，确保 inputs 字段存在 --- END MODIFICATION ---
        // files: [], // 如果需要传递文件
      };
      console.log("[handleSubmit] Calling Dify API proxy with identifier:", DIFY_APP_IDENTIFIER, " Payload:", payload);

      // --- BEGIN COMMENT ---
      // 调用 API 服务函数，传入 payload 和应用标识符
      // --- END COMMENT ---
      const response = await streamDifyChat(payload, DIFY_APP_IDENTIFIER); 

      // --- BEGIN COMMENT ---
      // 使用 getConversationId() 方法获取 ID
      // 注意：此时调用 getConversationId() 可能返回 null，
      // 因为流可能还没开始处理或还没收到包含 ID 的事件。
      // 真实的 ID 需要在流处理过程中或结束后获取。
      // --- END COMMENT ---
      let finalConversationId: string | null = null;
      let finalTaskId: string | null = null;

      // --- BEGIN COMMENT ---
      // 处理从 Service 返回的 answerStream (纯文本块流)
      // --- END COMMENT ---
      console.log("[handleSubmit] Starting to process answer stream...");
      for await (const answerChunk of response.answerStream) { // 迭代 answerStream
        // --- BEGIN COMMENT ---
        // 在处理第一个 chunk 时，尝试获取 conversationId 和 taskId
        // 因为服务层的 get 方法会在流处理过程中更新其内部变量
        // --- END COMMENT ---
        if (assistantMessageId === null) {
          // --- BEGIN COMMENT ---
          // 首次收到文本块时创建消息
          // --- END COMMENT ---
          const assistantMessage = addMessage({
            text: '', 
            isUser: false,
            isStreaming: true, 
          });
          assistantMessageId = assistantMessage.id;
          useChatStore.setState({ isWaitingForResponse: false, streamingMessageId: assistantMessageId });
          console.log("[handleSubmit] First answer chunk processed, assistant message created:", assistantMessageId);

          // --- BEGIN COMMENT ---
          // 尝试在第一个 chunk 后获取 ID (可能已经有了)
          // --- END COMMENT ---
          finalConversationId = response.getConversationId();
          finalTaskId = response.getTaskId();
          console.log(`[handleSubmit] IDs after first chunk: ConvID=${finalConversationId}, TaskID=${finalTaskId}`);
          
          // --- BEGIN COMMENT --- 将获取到的 Task ID 存储到 Zustand --- END COMMENT ---
          if (finalTaskId) { 
            setCurrentTaskId(finalTaskId); 
          }

          // --- BEGIN COMMENT ---
          // 处理新对话的 ID 更新和 URL 跳转逻辑
          // --- END COMMENT ---
          if (currentConversationId === null && finalConversationId) {
            console.log("[handleSubmit] New conversation, updating store with ID:", finalConversationId);
            setCurrentConversationId(finalConversationId);
            console.log(`[handleSubmit] Replacing URL with /chat/${finalConversationId}`);
            router.replace(`/chat/${finalConversationId}`, { scroll: false });
          } else if (currentConversationId !== finalConversationId && finalConversationId) {
              console.warn(`[handleSubmit] Mismatch or unexpected ConvID: Sent ${currentConversationId}, received ${finalConversationId}`);
          }
        }

        if (assistantMessageId) {
          if (useChatStore.getState().streamingMessageId === assistantMessageId) {
            // --- BEGIN COMMENT ---
            // 追加 answerChunk
            // --- END COMMENT ---
            appendMessageChunk(assistantMessageId, answerChunk); 
          } else {
            console.log("[handleSubmit] Stream processing stopped externally by user.");
            break; 
          }
        }
      }
      console.log("[handleSubmit] Finished processing answer stream.");

      // --- BEGIN COMMENT --- 流结束后再次确认 Task ID (如果之前没获取到) --- END COMMENT ---
      finalTaskId = response.getTaskId(); 
      console.log(`[handleSubmit] IDs after stream finished: ConvID=${response.getConversationId()}, TaskID=${finalTaskId}`);
      if (finalTaskId && useChatStore.getState().currentTaskId !== finalTaskId) {
        setCurrentTaskId(finalTaskId); 
      }

      // --- BEGIN COMMENT ---
      // 确认对话 ID 是否按预期更新 (如果之前是 null)
      // --- END COMMENT ---
      if (useChatStore.getState().currentConversationId === null && response.getConversationId()) {
        console.log("[handleSubmit] Updating store with final ConvID post-stream:", response.getConversationId());
        setCurrentConversationId(response.getConversationId());
      }

      // --- BEGIN COMMENT ---
      // TODO: 可以选择性地处理 completionPromise 来获取最终的 usage/metadata
      // if (response.completionPromise) {
      //   const finalData = await response.completionPromise;
      //   console.log("[handleSubmit] Stream completed with final data:", finalData);
      //   // 可以在这里更新消息的 metadata 或执行其他操作
      // }
      // --- END COMMENT ---

      // --- BEGIN COMMENT ---
      // 流处理结束逻辑 (需要确保 finalize 在 completionPromise 之后，如果使用的话)
      // --- END COMMENT ---
      if (assistantMessageId && useChatStore.getState().streamingMessageId === assistantMessageId) {
        console.log("[handleSubmit] Stream ended successfully, finalizing message:", assistantMessageId);
        // --- BEGIN COMMENT --- 流正常结束后，清除 Task ID? (可选，取决于业务逻辑) --- END COMMENT ---
        // finalizeStreamingMessage(assistantMessageId); // finalize 会清除 streamingMessageId
        // setCurrentTaskId(null); // 可以在这里清除，或保留直到下次开始
        finalizeStreamingMessage(assistantMessageId); 
      } else if (!assistantMessageId) {
        console.log("[handleSubmit] Stream ended but no answer chunks received. Resetting waiting state.");
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
      // --- BEGIN COMMENT --- 出错时也清除 Task ID --- END COMMENT ---
      setCurrentTaskId(null); 
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
    setCurrentTaskId, // --- BEGIN COMMENT --- 添加 setCurrentTaskId 到依赖 --- END COMMENT ---
    router // 添加 router 依赖
  ]);

  // --- 停止处理 --- 
  const handleStopProcessing = useCallback(async () => { // --- BEGIN COMMENT --- 改为 async --- END COMMENT ---
    const state = useChatStore.getState();
    const currentStreamingId = state.streamingMessageId;
    const currentTaskId = state.currentTaskId; // --- BEGIN COMMENT --- 从 store 获取 Task ID --- END COMMENT ---
    
    if (currentStreamingId) {
      console.log(`[handleStopProcessing] Stopping stream for message ID: ${currentStreamingId}, Task ID: ${currentTaskId}`);
      
      // --- BEGIN COMMENT --- 1. 立即停止前端流 --- END COMMENT ---
      finalizeStreamingMessage(currentStreamingId); 

      // --- BEGIN COMMENT --- 2. 如果有 Task ID，尝试调用后端停止 API --- END COMMENT ---
      if (currentTaskId) {
        try {
          console.log(`[handleStopProcessing] Calling stopDifyStreamingTask for Task ID: ${currentTaskId}`);
          const stopResponse: DifyStopTaskResponse = await stopDifyStreamingTask(
            DIFY_APP_IDENTIFIER,
            currentTaskId,
            currentUserIdentifier
          );
          console.log("[handleStopProcessing] Stop request successful:", stopResponse);
          // --- BEGIN COMMENT --- 停止成功后，清除 Task ID --- END COMMENT ---
          setCurrentTaskId(null); 
        } catch (error) {
          // --- BEGIN COMMENT --- 处理停止 API 调用失败的情况 --- END COMMENT ---
          console.error(`[handleStopProcessing] Error calling stopDifyStreamingTask for Task ID ${currentTaskId}:`, error);
          // 这里可以选择是否向用户显示错误，或者只是记录日志
          // 注意：即使停止 API 失败，前端流也已经停止了
        }
      } else {
        console.warn("[handleStopProcessing] Cannot send stop request: Task ID not found in store.");
      }
    } else {
      console.log("[handleStopProcessing] No active stream to stop.");
    }
  }, [finalizeStreamingMessage, currentUserIdentifier, setCurrentTaskId]); // --- BEGIN COMMENT --- 更新依赖项 --- END COMMENT ---

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