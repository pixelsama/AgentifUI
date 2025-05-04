import { useRef, useEffect, useCallback, useState } from 'react';
import { useChatScrollStore } from '@lib/stores/chat-scroll-store';

// --- BEGIN COMMENT ---
// useChatScroll Hook
// 负责管理聊天容器的自动滚动行为。
// 返回一个 ref，应将其附加到 *主* 可滚动聊天容器元素上 (通常是页面级或布局级的容器)。
//
// 功能：
// 1. 当依赖项 (dep) 改变时 (通常是消息列表长度)，如果用户未手动向上滚动，则自动滚动到底部。
// 2. 监听滚动事件，检测用户是否手动滚动。
// 3. 如果用户向上滚动，则禁用自动滚动。
// 4. 如果用户滚动回底部，则重新启用自动滚动。
// 5. 尝试区分程序化滚动和用户滚动，以避免错误地禁用自动滚动。
// --- END COMMENT ---
export function useChatScroll<T extends HTMLElement>(
  dep: unknown // 依赖项，其变化会触发滚动检查 (例如 messages.length)
) {
  const scrollRef = useRef<T>(null); // Ref 附加到主滚动容器
  const { userScrolledUp, setUserScrolledUp } = useChatScrollStore();
  // --- BEGIN COMMENT ---
  // 内部状态，标记是否正在进行由代码触发的自动滚动。
  // --- END COMMENT ---
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // 用于管理 isAutoScrolling 的超时

  // --- BEGIN COMMENT ---
  // 滚动到底部的函数
  // --- END COMMENT ---
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    if (scrollRef.current) {
      // --- BEGIN COMMENT ---
      // 在触发滚动前，标记为自动滚动。
      // --- END COMMENT ---
      setIsAutoScrolling(true);
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior,
      });
      // --- BEGIN COMMENT ---
      // 短暂延迟后，清除自动滚动标记。
      // 这个延迟是为了让滚动事件监听器有时间忽略这次程序化滚动。
      // --- END COMMENT ---
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsAutoScrolling(false);
        // console.log('[useChatScroll] Auto-scroll finished, flag reset.');
      }, 100); // 延迟时间可以根据需要调整，通常很短即可
    }
  }, []);

  // --- BEGIN COMMENT ---
  // 效果1: 当依赖项 (如消息) 更新时，如果允许自动滚动，则滚动到底部。
  // --- END COMMENT ---
  useEffect(() => {
    if (!userScrolledUp && scrollRef.current) {
      // console.log('[useChatScroll] Dependency changed, auto-scrolling.');
      scrollToBottom('smooth'); // 消息更新时可以使用平滑滚动
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, userScrolledUp, scrollToBottom]); // 依赖项

  // --- BEGIN COMMENT ---
  // 效果2: 监听滚动事件，更新 userScrolledUp 状态。
  // --- END COMMENT ---
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout | null = null;

    // 滚动事件处理函数
    const handleScroll = () => {
      // --- BEGIN COMMENT ---
      // 如果 isAutoScrolling 标记为 true，说明这次滚动是由 scrollToBottom 触发的，
      // 我们应该忽略它，避免错误地将用户标记为手动滚动。
      // --- END COMMENT ---
      if (isAutoScrolling) {
        // console.log("[useChatScroll] Ignoring scroll event during auto-scroll.");
        return;
      }
        
      // 使用 debounce 防止过于频繁的计算
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = element;
          // 计算是否接近底部，留有一定容差 (例如 10px)
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

          // console.log(`[useChatScroll] Scroll check: isAtBottom=${isAtBottom}, userScrolledUp=${userScrolledUp}`);

          // 条件：如果当前不在底部，并且之前自动滚动是激活的 (userScrolledUp 为 false)
          // 则认为是用户手动向上滚动了。
          if (!isAtBottom && !userScrolledUp) {
              // console.log('[useChatScroll] User scrolled up, disabling auto-scroll.');
              setUserScrolledUp(true);
          } 
          // 条件：如果当前滚动到了底部，并且之前是用户手动滚动状态 (userScrolledUp 为 true)
          // 则认为是用户滚动回了底部，重新激活自动滚动。
          else if (isAtBottom && userScrolledUp) {
              // console.log('[useChatScroll] User scrolled back to bottom, enabling auto-scroll.');
              setUserScrolledUp(false);
          }
      }, 150); // 滚动事件的 debounce 延迟
    };
    
    // 添加滚动事件监听器
    element.addEventListener('scroll', handleScroll, { passive: true });
    // console.log('[useChatScroll] Scroll listener added.');

    // 清理函数：移除监听器和可能的超时
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // 清理 isAutoScrolling 的超时
      element.removeEventListener('scroll', handleScroll);
      // console.log('[useChatScroll] Scroll listener removed.');
    };
  }, [scrollRef, userScrolledUp, setUserScrolledUp, isAutoScrolling]); // 依赖项现在包括 isAutoScrolling

  return scrollRef; // 返回 ref
} 