import { useRef, useEffect, useCallback } from 'react';
import { useChatScrollStore } from '@lib/stores/chat-scroll-store';
import { useChatStore, selectIsProcessing, ChatMessage } from '@lib/stores/chat-store';
import { debounce } from 'lodash';

// --- BEGIN COMMENT ---
// 滚动阈值，单位像素，距离底部多少像素被认为是"在底部"
// --- END COMMENT ---
const SCROLL_THRESHOLD = 50; 

export function useChatScroll(messages: ChatMessage[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    setScrollRef,
    handleUserScroll,
    scrollToBottom,
    forceScrollToBottom,
    reset
  } = useChatScrollStore();

  const isGenerating = useChatStore(selectIsProcessing);
  
  // --- BEGIN COMMENT ---
  // 跟踪上一次消息数量，用于检测新消息
  // --- END COMMENT ---
  const prevMessageCountRef = useRef(0);
  
  // --- BEGIN COMMENT ---
  // 防抖的用户滚动处理
  // --- END COMMENT ---
  const debouncedHandleUserScroll = useCallback(
    debounce(() => {
      handleUserScroll();
    }, 100), // 增加防抖时间，减少频繁更新
    [handleUserScroll]
  );

  // --- BEGIN COMMENT ---
  // 设置滚动容器和事件监听
  // --- END COMMENT ---
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // --- BEGIN COMMENT ---
    // 设置滚动容器引用
    // --- END COMMENT ---
    setScrollRef(scrollRef as React.RefObject<HTMLElement>);

    // --- BEGIN COMMENT ---
    // 添加滚动事件监听
    // --- END COMMENT ---
    const handleScroll = () => {
      debouncedHandleUserScroll();
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    // --- BEGIN COMMENT ---
    // 初始化滚动状态
    // --- END COMMENT ---
    handleUserScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
      debouncedHandleUserScroll.cancel();
    };
  }, [setScrollRef, debouncedHandleUserScroll, handleUserScroll]);

  // --- BEGIN COMMENT ---
  // 新消息时自动滚动
  // --- END COMMENT ---
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length, scrollToBottom]);

  // --- BEGIN COMMENT ---
  // 新对话时重置状态
  // --- END COMMENT ---
  useEffect(() => {
    if (messages.length === 0) {
      reset();
    }
  }, [messages.length, reset]);

  // --- BEGIN COMMENT ---
  // 生成完成后确保滚动到底部
  // --- END COMMENT ---
  useEffect(() => {
    if (!isGenerating && messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [isGenerating, messages.length, scrollToBottom]);

  return scrollRef;
}
