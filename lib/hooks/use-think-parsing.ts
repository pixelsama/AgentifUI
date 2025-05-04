import { useMemo, useEffect } from 'react';
import { useThinkStore } from '@lib/stores/think-store';

/**
 * 解析消息内容，提取 <think> 块和主内容
 * @param rawContent 原始消息字符串
 * @returns 解析结果对象，包含是否存在 think 块、think 内容和主内容
 */
const extractThinkContent = (rawContent: string): {
  hasThinkBlock: boolean;
  thinkContent: string;
  mainContent: string;
} => {
  const thinkStartTag = '<think>';
  const thinkEndTag = '</think>';

  // 检查是否以 <think> 开头
  if (rawContent.startsWith(thinkStartTag)) {
    const endTagIndex = rawContent.indexOf(thinkEndTag);
    
    // 找到了结束标签
    if (endTagIndex !== -1) {
      const thinkContent = rawContent.substring(thinkStartTag.length, endTagIndex);
      const mainContent = rawContent.substring(endTagIndex + thinkEndTag.length);
      return { hasThinkBlock: true, thinkContent, mainContent };
    }
    
    // 没找到结束标签（可能还在流式传输中）
    const thinkContent = rawContent.substring(thinkStartTag.length);
    return { hasThinkBlock: true, thinkContent, mainContent: '' };
  }

  // 没有 <think> 标签
  return { hasThinkBlock: false, thinkContent: '', mainContent: rawContent };
};

/**
 * 自定义 Hook，用于处理消息中的 <think> 逻辑
 * @param fullContent 完整的消息内容
 * @param isStreaming 消息是否仍在流式传输中
 * @returns 解析后的内容、状态及操作函数
 */
export function useThinkParsing(fullContent: string, isStreaming: boolean) {
  // 从 Store 获取状态和操作
  const { isThinking, isOpen, setIsThinking, toggleOpen, reset } = useThinkStore();

  // 使用 useMemo 缓存解析结果，避免不必要的重计算
  const { hasThinkBlock, thinkContent, mainContent } = useMemo(() => 
    extractThinkContent(fullContent),
    [fullContent]
  );

  // 根据解析结果和流状态更新 Store
  useEffect(() => {
    // 1. 如果检测到 <think> 块
    if (hasThinkBlock) {
      // 检查流式状态：
      // - 如果仍在流式传输，或者流式刚结束但主内容为空 (意味着</think>刚到)
      //   则我们认为它仍在"思考"中
      const stillProcessingThink = isStreaming || (!isStreaming && mainContent === '');
      
      // 如果当前状态不是正在思考，则更新为正在思考
      if (!isThinking && stillProcessingThink) {
        setIsThinking(true);
      } 
      // 如果当前状态是正在思考，但流已结束且有主内容，则更新为思考结束
      else if (isThinking && !isStreaming && mainContent !== '') {
        setIsThinking(false);
      }
    } 
    // 2. 如果没有 <think> 块
    else {
      // 如果之前是思考状态，则重置
      if (isThinking) {
        reset();
      }
    }

    // 当组件卸载或 fullContent/isStreaming 变化导致 hook 重运行前，确保重置
    // (注意：这可能过于频繁，更优的重置时机可能是在消息 ID 变化时)
    // return () => {
    //   reset(); 
    // };
    
  }, [hasThinkBlock, isStreaming, mainContent, isThinking, setIsThinking, reset]);

  // 提供给组件使用的状态和函数
  return {
    hasThinkBlock,  // 是否包含 <think> 块
    thinkContent,   // <think> 块内的内容
    mainContent,    // <think> 块之后的主内容
    isThinking,     // 当前是否处于"思考中"状态 (用于控制按钮 Spinner 等)
    isOpen,         // ThinkBlock 内容区域是否展开
    toggleOpen,     // 切换展开/折叠的函数
  };
} 