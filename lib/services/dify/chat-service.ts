/**
 * Dify 聊天服务
 * @description 实现与 Dify 聊天相关 API 的交互逻辑
 * @module lib/services/dify/chat-service
 */
import { parseSseStream } from '@lib/utils/sse-parser';

import {
  DifyChatRequestPayload,
  DifySseEvent,
  DifySseIterationCompletedEvent,
  DifySseIterationNextEvent,
  DifySseIterationStartedEvent,
  DifySseLoopCompletedEvent,
  DifySseLoopNextEvent,
  DifySseLoopStartedEvent,
  DifySseNodeFinishedEvent,
  DifySseNodeStartedEvent,
  DifySseParallelBranchFinishedEvent,
  DifySseParallelBranchStartedEvent,
  DifyStreamResponse,
} from './types';
/**
 * 停止 Dify 流式任务的相关类型定义
 * @description 调用后端代理以安全地与 Dify API 交互
 * @see Dify 文档: POST /chat-messages/:task_id/stop
 */
import { DifyStopTaskRequestPayload, DifyStopTaskResponse } from './types';

/** Dify API 基础 URL (指向我们的后端代理) */
const DIFY_API_BASE_URL = '/api/dify';

/**
 * 调用 Dify 的 chat-messages 接口并处理流式响应
 *
 * @param payload - 发送给 Dify API 的请求体
 * @param appId - Dify 应用的 ID
 * @param onConversationIdReceived - 可选的回调函数，当 conversationId 首次被提取时调用
 * @param onNodeEvent - 可选的回调函数，当节点事件发生时调用
 * @returns 一个包含异步生成器 (answerStream)、conversationId 和 taskId 的 Promise
 * @throws 如果 fetch 请求失败或 API 返回错误状态，则抛出错误
 */
export async function streamDifyChat(
  payload: DifyChatRequestPayload,
  appId: string,
  onConversationIdReceived?: (id: string) => void,
  onNodeEvent?: (
    event:
      | DifySseNodeStartedEvent
      | DifySseNodeFinishedEvent
      | DifySseIterationStartedEvent
      | DifySseIterationNextEvent
      | DifySseIterationCompletedEvent
      | DifySseParallelBranchStartedEvent
      | DifySseParallelBranchFinishedEvent
      | DifySseLoopStartedEvent
      | DifySseLoopNextEvent
      | DifySseLoopCompletedEvent
  ) => void
): Promise<DifyStreamResponse> {
  console.log('[Dify Service] Sending request to proxy:', payload);

  const apiUrl = `${DIFY_API_BASE_URL}/${appId}/chat-messages`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[Dify Service] Received response status:', response.status);

    // 检查响应状态，如果不是 2xx，则抛出错误
    if (!response.ok) {
      let errorBody = 'Unknown error';
      try {
        errorBody = await response.text();
      } catch {
        // 忽略读取错误体时的错误
      }
      throw new Error(
        `Dify API request failed with status ${response.status}: ${response.statusText}. Body: ${errorBody}`
      );
    }

    // 检查响应体是否存在
    if (!response.body) {
      throw new Error('Dify API response body is null.');
    }

    const stream = response.body;
    let conversationId: string | null = null;
    let taskId: string | null = null;
    let conversationIdCallbackCalled = false;

    // 创建completionPromise来捕获message_end事件的metadata
    let completionResolve: (value: {
      usage?: any;
      metadata?: Record<string, any>;
      retrieverResources?: any[];
    }) => void;
    let completionReject: (reason?: any) => void;
    let completionResolved = false;

    const completionPromise = new Promise<{
      usage?: any;
      metadata?: Record<string, any>;
      retrieverResources?: any[];
    }>((resolve, reject) => {
      completionResolve = resolve;
      completionReject = reject;
    });

    /**
     * 处理流式响应的内部异步生成器
     * @description 解析 SSE 事件并提取所需信息
     */
    async function* processStream(): AsyncGenerator<string, void, undefined> {
      try {
        // 使用 sse-parser 解析流
        for await (const result of parseSseStream(stream)) {
          if (result.type === 'error') {
            // 如果 SSE 解析器报告错误，则向上抛出
            console.error('[Dify Service] SSE Parser Error:', result.error);
            completionReject(new Error('Error parsing SSE stream.'));
            throw new Error('Error parsing SSE stream.');
          }

          // 处理成功解析的事件
          const event = result.event as DifySseEvent;

          // 过滤message事件，只显示关键事件
          if (event.event !== 'message') {
            console.log(
              `[Dify Service] 🎯 收到关键SSE事件: ${event.event}${event.event === 'message_end' ? ' (关键事件!)' : ''}`
            );
          }

          // 提取 conversation_id 和 task_id (通常在 message_end 事件中)
          if (event.conversation_id) {
            if (!conversationId) {
              conversationId = event.conversation_id;
              if (onConversationIdReceived && !conversationIdCallbackCalled) {
                try {
                  onConversationIdReceived(conversationId);
                  conversationIdCallbackCalled = true;
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onConversationIdReceived callback:',
                    callbackError
                  );
                }
              } else if (conversationId !== event.conversation_id) {
                console.warn(
                  '[Dify Service] 警告：事件中的对话ID与已保存的不同！',
                  {
                    saved: conversationId,
                    fromEvent: event.conversation_id,
                  }
                );
              }
            }
          }
          if ('task_id' in event && event.task_id && !taskId) {
            taskId = event.task_id;
            console.log('[Dify Service] Extracted taskId:', taskId);
          }

          // 根据事件类型处理
          switch (event.event) {
            case 'agent_thought':
              // agent_thought 事件包含 Agent 的思考过程，但通常 thought 字段为空
              // 这个事件主要用于标记思考阶段的开始，不需要 yield 内容
              console.log('[Dify Service] Agent thought event received');
              break;
            case 'agent_message':
              if (event.answer) {
                // 🎯 关键修复：agent_message 事件包含 Agent 应用的实际回答内容
                // 应该像 message 事件一样 yield 出来，供前端显示
                yield event.answer;
              }
              break;
            case 'node_started':
              console.log('[Dify Service] Node started:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as DifySseNodeStartedEvent);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (node_started):',
                    callbackError
                  );
                }
              }
              break;
            case 'node_finished':
              console.log('[Dify Service] Node finished:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as DifySseNodeFinishedEvent);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (node_finished):',
                    callbackError
                  );
                }
              }
              break;
            case 'iteration_started':
              console.log('[Dify Service] Iteration started:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (iteration_started):',
                    callbackError
                  );
                }
              }
              break;
            case 'iteration_next':
              console.log('[Dify Service] Iteration next:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (iteration_next):',
                    callbackError
                  );
                }
              }
              break;
            case 'iteration_completed':
              console.log('[Dify Service] Iteration completed:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (iteration_completed):',
                    callbackError
                  );
                }
              }
              break;
            case 'parallel_branch_started':
              console.log(
                '[Dify Service] Parallel branch started:',
                event.data
              );
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (parallel_branch_started):',
                    callbackError
                  );
                }
              }
              break;
            case 'parallel_branch_finished':
              console.log(
                '[Dify Service] Parallel branch finished:',
                event.data
              );
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (parallel_branch_finished):',
                    callbackError
                  );
                }
              }
              break;
            case 'loop_started':
              console.log('[Dify Service] Loop started:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (loop_started):',
                    callbackError
                  );
                }
              }
              break;
            case 'loop_next':
              console.log('[Dify Service] Loop next:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (loop_next):',
                    callbackError
                  );
                }
              }
              break;
            case 'loop_completed':
              console.log('[Dify Service] Loop completed:', event.data);
              if (onNodeEvent) {
                try {
                  onNodeEvent(event as any);
                } catch (callbackError) {
                  console.error(
                    '[Dify Service] Error in onNodeEvent callback (loop_completed):',
                    callbackError
                  );
                }
              }
              break;
            case 'message':
              if (event.answer) {
                yield event.answer;
              }
              break;
            case 'message_end':
              console.log(
                '[Dify Service] Received message_end event with metadata:',
                {
                  metadata: event.metadata,
                  usage: event.metadata?.usage || event.usage,
                  retrieverResources: event.metadata?.retriever_resources,
                }
              );

              if (event.conversation_id && !conversationId) {
                conversationId = event.conversation_id;
                console.log(
                  '[Dify Service] Extracted conversationId from message_end:',
                  conversationId
                );
                if (onConversationIdReceived && !conversationIdCallbackCalled) {
                  try {
                    onConversationIdReceived(conversationId);
                    conversationIdCallbackCalled = true;
                  } catch (callbackError) {
                    console.error(
                      '[Dify Service] Error in onConversationIdReceived callback (message_end):',
                      callbackError
                    );
                  }
                }
              }
              if (event.task_id && !taskId) {
                taskId = event.task_id;
                console.log(
                  '[Dify Service] Extracted taskId from message_end:',
                  taskId
                );
              }

              const completionData = {
                usage: event.metadata?.usage || event.usage,
                metadata: event.metadata || {},
                retrieverResources: event.metadata?.retriever_resources || [],
              };

              console.log(
                '[Dify Service] Resolving completionPromise with data:',
                completionData
              );
              if (!completionResolved) {
                completionResolve(completionData);
                completionResolved = true;
              }

              console.log('[Dify Service] Message stream ended.');
              break;
            case 'error':
              console.error('[Dify Service] Dify API Error Event:', event);
              const errorInfo = new Error(
                `Dify API error: ${event.code} - ${event.message}`
              );
              completionReject(errorInfo);
              throw errorInfo;
            default:
              break;
          }
        }
        console.log('[Dify Service] Finished processing stream.');

        if (completionResolve && !completionResolved) {
          console.log(
            '[Dify Service] Stream ended without message_end, resolving with empty data'
          );
          completionResolve({
            usage: undefined,
            metadata: {},
            retrieverResources: [],
          });
          completionResolved = true;
        }
      } catch (error) {
        console.error('[Dify Service] Error in processStream:', error);
        if (completionReject) {
          completionReject(error);
        }
        throw error;
      }
    }

    const responsePayload: DifyStreamResponse = {
      answerStream: processStream(),
      getConversationId: () => conversationId,
      getTaskId: () => taskId,
      completionPromise,
    };

    return responsePayload;
  } catch (error) {
    console.error('[Dify Service] Error in streamDifyChat:', error);
    throw error;
  }
}

/**
 * 请求停止 Dify 的流式聊天任务。
 *
 * @param appId - Dify 应用的 ID。
 * @param taskId - 需要停止的任务 ID (从流式响应中获取)。
 * @param user - 发起请求的用户标识符，必须与启动任务时相同。
 * @returns 一个解析为 DifyStopTaskResponse 的 Promise (包含 { result: 'success' })。
 * @throws 如果请求失败或 API 返回错误状态，则抛出错误。
 */
export async function stopDifyStreamingTask(
  appId: string,
  taskId: string,
  user: string
): Promise<DifyStopTaskResponse> {
  console.log(
    `[Dify Service] Requesting to stop task ${taskId} for app ${appId} and user ${user}`
  );

  const slug = `chat-messages/${taskId}/stop`;
  const apiUrl = `${DIFY_API_BASE_URL}/${appId}/${slug}`;

  const payload: DifyStopTaskRequestPayload = {
    user: user,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(
      `[Dify Service] Stop task response status for ${taskId}:`,
      response.status
    );

    if (!response.ok) {
      let errorBody = 'Unknown error';
      try {
        errorBody = await response.text();
      } catch {
        // 忽略读取错误
      }
      throw new Error(
        `Failed to stop Dify task ${taskId}. Status: ${response.status} ${response.statusText}. Body: ${errorBody}`
      );
    }

    const result: DifyStopTaskResponse = await response.json();

    if (result.result !== 'success') {
      console.warn(
        `[Dify Service] Stop task for ${taskId} returned success status but unexpected body:`,
        result
      );
    }

    console.log(`[Dify Service] Task ${taskId} stopped successfully.`);
    return result;
  } catch (error) {
    console.error(`[Dify Service] Error stopping task ${taskId}:`, error);
    throw error;
  }
}
