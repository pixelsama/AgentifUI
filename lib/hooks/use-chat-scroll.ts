import { useRef, useEffect, useCallback } from 'react';
import { useChatScrollStore } from '@lib/stores/chat-scroll-store';
import throttle from 'lodash/throttle';

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

// --- BEGIN COMMENT ---
// 定义滚动判断的阈值（像素）
// 当滚动位置距离底部小于此值时，我们认为用户在底部
// --- END COMMENT ---
const SCROLL_THRESHOLD = 50;

export function useChatScroll<T extends HTMLElement>(dependency: any) {
  const scrollRef = useRef<T>(null); // Ref 附加到主滚动容器
  const { 
    userScrolledUp, 
    setUserScrolledUp, 
    setIsAtBottom, // 获取更新 isAtBottom 的 action
    setScrollRef, // 获取设置 ref 的 action
    scrollToBottom // 获取滚动到底部的方法，以便在初始加载时使用
  } = useChatScrollStore();

  // --- BEGIN COMMENT ---
  // 注册 scrollRef 到 store
  // --- END COMMENT ---
  useEffect(() => {
    if (scrollRef.current) {
      setScrollRef(scrollRef as React.RefObject<HTMLElement>)
    }
    // 确保在组件卸载时清除引用，虽然在这个场景下可能不是严格必需
    return () => {
      // 注意：这里直接 setScrollRef(null) 可能会在快速导航时出问题
      // 如果 store 的实例持续存在，但 ref 已失效。视情况决定是否需要清理。
    }
  }, [setScrollRef])

  // --- BEGIN COMMENT ---
  // 使用 useCallback 和 throttle 优化滚动事件处理函数
  // --- END COMMENT ---
  const handleScroll = useCallback(throttle(() => {
    const element = scrollRef.current
    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const atBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD
      const scrolledUp = !atBottom
      
      // --- BEGIN COMMENT ---
      // 添加详细滚动日志
      // --- END COMMENT ---
      // console.log(`[ScrollHandler] scrollTop: ${scrollTop.toFixed(1)}, scrollHeight: ${scrollHeight.toFixed(1)}, clientHeight: ${clientHeight.toFixed(1)}, calculated_atBottom: ${atBottom}, calculated_scrolledUp: ${scrolledUp}`);

      // --- BEGIN COMMENT ---
      // 更新 isAtBottom 状态
      // 更新 userScrolledUp 状态，只有在状态实际变化时才更新 store
      // --- END COMMENT ---
      setIsAtBottom(atBottom)
      if (scrolledUp !== useChatScrollStore.getState().userScrolledUp) {
          setUserScrolledUp(scrolledUp)
      }
    }
  }, 100), [setUserScrolledUp, setIsAtBottom]) // 依赖项包含 setIsAtBottom

  useEffect(() => {
    const element = scrollRef.current
    if (element) {
      // --- BEGIN COMMENT ---
      // 组件挂载和依赖项变化时，添加滚动事件监听器
      // --- END COMMENT ---
      element.addEventListener('scroll', handleScroll)
      
      // --- BEGIN COMMENT ---
      // 初始状态检查：如果不在底部，则标记用户已滚动
      // 并确保初始时 isAtBottom 状态正确
      // --- END COMMENT ---
      const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < SCROLL_THRESHOLD;
      setIsAtBottom(atBottom);
      if (!atBottom) {
        setUserScrolledUp(true);
      }

      // --- BEGIN COMMENT ---
      // 组件卸载时，移除监听器
      // --- END COMMENT ---
      return () => {
        element.removeEventListener('scroll', handleScroll)
        handleScroll.cancel() // 取消可能在等待执行的 throttle 调用
      }
    }
  }, [handleScroll, setIsAtBottom, setUserScrolledUp]) // 依赖项包含 setIsAtBottom 和 setUserScrolledUp

  useEffect(() => {
    // --- BEGIN COMMENT ---
    // 当依赖项（如消息列表长度）变化时触发
    // 如果用户没有手动向上滚动，则自动滚动到底部
    // 使用 requestAnimationFrame 确保滚动发生在 DOM 更新之后
    // --- END COMMENT ---
    if (!userScrolledUp && scrollRef.current) {
      requestAnimationFrame(() => {
        const element = scrollRef.current
        if (element) {
          const isCurrentlyAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < SCROLL_THRESHOLD;
          // 只有当实际不在底部时才执行滚动，防止不必要的重绘
          if(!isCurrentlyAtBottom) {
            element.scrollTo({
              top: element.scrollHeight,
              behavior: 'auto' // 自动滚动通常不需要平滑效果
            })
            // 自动滚动后，我们确定在底部
            setIsAtBottom(true)
          }
        }
      })
    }
  }, [dependency, userScrolledUp, setIsAtBottom]) // 依赖项包含 setIsAtBottom

  return scrollRef; // 返回 ref
} 