import { useEffect, useRef, useCallback } from 'react';
import { useChatInputStore } from '@lib/stores/chat-input-store';
import { useChatStore, selectIsProcessing } from '@lib/stores/chat-store';

interface Message {
  text: string;
  isUser: boolean;
}

// 模拟助手的长消息回复
const mockLongResponse = `
我已经分析了你的请求，以下是相关信息：

## Markdown文本示例

这是正常的Markdown文本，支持**粗体**、*斜体*和***粗斜体***格式。
还可以使用[链接](https://example.com)和~~删除线~~等样式。

> 这是一个Markdown引用块示例。
> 引用块可以包含多行文本，通常用于引用他人的话语。
> 它在视觉上会有特殊的样式，使引用内容更加突出。

### Python代码块示例

\`\`\`python
def fibonacci(n):
    """
    计算斐波那契数列的第n个数
    """
    if n <= 0:
        return "输入必须是正整数"
    elif n == 1:
        return 0
    elif n == 2:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# 测试函数
for i in range(1, 10):
    print(f"斐波那契数列第{i}个数是：{fibonacci(i)}")
\`\`\`

### Markdown表格示例

| 功能 | 描述 | 支持状态 |
|------|------|----------|
| 文本格式 | 支持基本的文本格式化 | ✅ 已实现 |
| 代码块 | 支持多种语言的代码高亮 | ✅ 已实现 |
| 表格 | 支持创建格式化表格 | ✅ 已实现 |
| 数学公式 | 支持LaTeX数学公式 | ✅ 已实现 |
| 图片 | 支持插入和显示图片 | ⏳ 开发中 |

### LaTeX公式示例

行内公式示例：当 $E=mc^2$ 时，能量与质量成正比。

块级公式示例：

$$
\\begin{align}
\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
\\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\\\
\\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\\\
\\nabla \\cdot \\vec{\\mathbf{B}} & = 0
\\end{align}
$$

最后，这是一些普通文本内容，没有特殊格式，仅作为示例。希望这个演示对你有所帮助！
`;

// 模拟API调用函数 (将来替换为真实API)
async function* simulateStreamApiResponse(inputText: string): AsyncGenerator<string, void, undefined> {
  console.log("Simulating API call for:", inputText);
  await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟

  // 模拟流式输出
  let index = 0;
  // --- BEGIN COMMENT ---
  // 使用更可靠的方式来确保清理，而不是依赖未使用的 setInterval ID
  // 异步生成器本身的 finally 块是处理清理的好地方
  // --- END COMMENT ---
  try {
    while (index < mockLongResponse.length) {
      const chunkSize = Math.floor(Math.random() * 10) + 1; // 每次输出1-10个字符
      const nextIndex = Math.min(index + chunkSize, mockLongResponse.length);
      const chunk = mockLongResponse.substring(index, nextIndex);
      yield chunk; // 使用 yield 输出块
      index = nextIndex;
      await new Promise(resolve => setTimeout(resolve, 50)); // 模拟块之间的延迟
    }
  } finally {
    console.log("Simulated stream finished.");
  }
}

export function useChatInterface() {
  const { isWelcomeScreen, setIsWelcomeScreen } = useChatInputStore();

  // --- BEGIN COMMENT ---
  // 分别从 Store 获取状态和 Actions，避免创建新对象导致不必要的重渲染
  // --- END COMMENT ---
  const messages = useChatStore(state => state.messages);
  const addMessage = useChatStore(state => state.addMessage);
  const appendMessageChunk = useChatStore(state => state.appendMessageChunk);
  const finalizeStreamingMessage = useChatStore(state => state.finalizeStreamingMessage);
  const setMessageError = useChatStore(state => state.setMessageError);
  const setIsWaitingForResponse = useChatStore(state => state.setIsWaitingForResponse);
  // --- 使用 Selector 获取组合状态 ---
  const isProcessing = useChatStore(selectIsProcessing);

  // --- 处理消息提交 ---
  const handleSubmit = useCallback(async (message: string) => {
    // --- BEGIN COMMENT ---
    // 使用 selectIsProcessing selector 来检查是否正在处理消息
    // --- END COMMENT ---
    // --- BEGIN COMMENT ---
    // 这里直接使用从 Hook 中获取的 isProcessing 状态，
    // 因为 useChatStore 会确保它是最新的。
    // --- END COMMENT ---
    if (isProcessing) {
      console.log("Blocking submission: Already processing a message.");
      return;
    }

    // 1. 设置等待状态，添加用户消息
    setIsWaitingForResponse(true);
    addMessage({ text: message, isUser: true });

    // 2. 处理欢迎界面切换 (如果需要)
    if (isWelcomeScreen) {
      setIsWelcomeScreen(false);
    }

    let assistantMessageId: string | null = null;

    try {
      // --- BEGIN COMMENT ---
      // 3. 调用模拟API (将来替换为真实API)
      // 使用 for await...of 处理异步生成器
      // --- END COMMENT ---
      const stream = simulateStreamApiResponse(message);

      for await (const chunk of stream) {
        // --- BEGIN COMMENT ---
        // 在收到第一个 chunk 时，创建助手消息并更新流状态
        // --- END COMMENT ---
        if (assistantMessageId === null) {
          // --- BEGIN COMMENT ---
          // 创建助手消息，立即标记为流式
          // --- END COMMENT ---
          const assistantMessage = addMessage({
            text: '', // 初始为空
            isUser: false,
            isStreaming: true, // 标记为正在流式传输
          });
          assistantMessageId = assistantMessage.id;
          // --- BEGIN COMMENT ---
          // 关键：收到第一个块后，我们不再是"等待响应"状态，而是"正在流式传输"
          // 需要在 Store 中原子地更新这两个状态
          // --- END COMMENT ---
          useChatStore.setState({ isWaitingForResponse: false, streamingMessageId: assistantMessageId });
          console.log("First chunk received, assistant message created:", assistantMessageId);
        }

        // --- BEGIN COMMENT ---
        // 追加后续的 chunk 到已创建的助手消息
        // --- END COMMENT ---
        if (assistantMessageId) {
           // --- BEGIN COMMENT ---
           // 确保只对存在的 assistantMessageId 追加
           // --- END COMMENT ---
          appendMessageChunk(assistantMessageId, chunk);
        }
      }

      // --- BEGIN COMMENT ---
      // 4. 流正常结束，最终确定消息状态
      // --- END COMMENT ---
      if (assistantMessageId) {
        console.log("Stream ended successfully, finalizing message:", assistantMessageId);
        // --- BEGIN COMMENT ---
        // finalizeStreamingMessage 会处理 isStreaming=false 和 streamingMessageId=null
        // --- END COMMENT ---
        finalizeStreamingMessage(assistantMessageId);
      } else {
        // --- BEGIN COMMENT ---
        // 如果流结束了但从未收到任何 chunk（即 assistantMessageId 仍为 null）
        // 可能是API返回空流，此时只需清除等待状态
        // --- END COMMENT ---
        console.log("Stream ended but no chunks received. Resetting waiting state.");
        setIsWaitingForResponse(false);
      }

    } catch (error) {
      console.error("Error processing stream:", error);
      // 5. 处理错误
      if (assistantMessageId) {
        // --- BEGIN COMMENT ---
        // 如果流进行中出错，标记对应消息错误并最终化
        // setMessageError 内部会处理 isStreaming 和 streamingMessageId
        // --- END COMMENT ---
        setMessageError(assistantMessageId, "处理消息时发生错误");
      } else {
        // --- BEGIN COMMENT ---
        // 如果在流开始前或获取流时出错（例如 simulateStreamApiResponse 抛错）
        // 清除等待状态，并添加错误提示消息
        // --- END COMMENT ---
        setIsWaitingForResponse(false);
        addMessage({ text: "抱歉，无法获取响应。", isUser: false, error: "API 请求失败" });
      }
    }

  }, [isProcessing, addMessage, setIsWaitingForResponse, isWelcomeScreen, setIsWelcomeScreen, appendMessageChunk, finalizeStreamingMessage, setMessageError]); // useCallback 依赖项


  // --- 判断 UI 状态 ---
  const shouldShowWelcome = isWelcomeScreen && messages.length === 0;
  const shouldShowLoader = messages.length > 0;

  // --- 返回 Hook 接口 ---
  return {
    messages, // 从 store 获取
    handleSubmit,
    shouldShowWelcome,
    shouldShowLoader,
    isWelcomeScreen,
    isProcessing, // 提供组合状态给 UI (isWaiting || isStreaming)
  };
} 