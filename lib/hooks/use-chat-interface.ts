import { useState } from 'react';
import { useChatInputStore } from '@lib/stores/chat-input-store';

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

export function useChatInterface() {
  const { isWelcomeScreen, setIsWelcomeScreen } = useChatInputStore();
  const [messages, setMessages] = useState<Message[]>([]);

  // 处理消息提交
  const handleSubmit = (message: string) => {
    // 添加用户消息
    setMessages((prev) => [...prev, { text: message, isUser: true }]);

    // 如果是欢迎界面，切换到聊天界面
    if (isWelcomeScreen) {
      setIsWelcomeScreen(false);
    }

    // 模拟AI回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: mockLongResponse,
          isUser: false,
        },
      ]);
    }, 1000);
  };

  // 判断当前是否为欢迎界面
  const shouldShowWelcome = isWelcomeScreen && messages.length === 0;
  
  // 判断当前是否应该显示聊天加载器
  const shouldShowLoader = messages.length > 0;

  return {
    messages,
    handleSubmit,
    shouldShowWelcome,
    shouldShowLoader,
    isWelcomeScreen
  };
} 