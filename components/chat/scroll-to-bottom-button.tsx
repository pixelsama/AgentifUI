import { ArrowDown } from 'lucide-react'
import { useChatScrollStore } from '@lib/stores/chat-scroll-store'
import { useWelcomeScreen } from '@lib/hooks'
import { useThemeColors } from '@lib/hooks/use-theme-colors'
import { cn } from '@lib/utils'

// --- BEGIN COMMENT ---
// ScrollToBottomButton 组件 - 使用新的滚动管理API
// 当用户向上滚动离开聊天底部时显示，点击可强制滚动回底部
// --- END COMMENT ---
export const ScrollToBottomButton = () => {
  const { isAtBottom, forceScrollToBottom } = useChatScrollStore();
  const { colors, isDark } = useThemeColors();
  const { isWelcomeScreen: isOnWelcomeScreen } = useWelcomeScreen();

  // --- BEGIN COMMENT ---
  // 按钮显示条件：不在欢迎屏幕且不在底部
  // --- END COMMENT ---
  const shouldRender = !isOnWelcomeScreen && !isAtBottom;
  
  // --- BEGIN COMMENT ---
  // 动态计算bottom偏移量，基于输入框高度
  // --- END COMMENT ---
  const bottomOffset = `calc(var(--chat-input-height, 80px) + 5.5rem)`;

  const handleClick = () => {
    // --- BEGIN COMMENT ---
    // 使用强制滚动，确保一定会滚动到底部
    // --- END COMMENT ---
    forceScrollToBottom('smooth');
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        // --- 定位与层级 ---
        'absolute bottom-0 left-1/2 -translate-x-1/2 z-10 mb-4',
        
        // --- 基础样式 ---
        'rounded-full p-1.5 shadow-md transition-transform duration-150 ease-in-out cursor-pointer',
        
        // --- 颜色主题 ---
        colors.userMessageBackground.tailwind,
        colors.buttonHover.tailwind,
        isDark ? 'text-stone-300' : 'text-stone-700',
        
        // --- 交互效果 ---
        'hover:scale-110 active:scale-95'
      )}
      style={{
        bottom: bottomOffset,
      }}
      aria-label="滚动到底部"
    >
      <ArrowDown className="h-4 w-4" />
    </button>
  );
};
