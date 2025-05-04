import { ArrowDown } from 'lucide-react'
import { useChatScrollStore } from '@lib/stores/chat-scroll-store'
import { useChatLayoutStore } from '@lib/stores/chat-layout-store'
import { useChatInputStore } from '@lib/stores/chat-input-store'
import { useWelcomeScreen } from '@lib/hooks'
import { cn } from '@lib/utils'

// --- BEGIN COMMENT ---
// ScrollToBottomButton 组件
// 当用户向上滚动离开聊天底部时显示，点击可平滑滚动回底部。
// 样式已简化：白色背景，仅向下箭头，尺寸减小。
// --- END COMMENT ---
export const ScrollToBottomButton = () => {
  const { isAtBottom } = useChatScrollStore();
  const { isDark } = useChatInputStore();
  const scrollToBottom = useChatScrollStore((state) => state.scrollToBottom);
  const { isWelcomeScreen: isOnWelcomeScreen } = useWelcomeScreen();

  const shouldRender = !isOnWelcomeScreen && !isAtBottom;
  const bottomOffset = '120px';

  const handleClick = () => {
    scrollToBottom('smooth');
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        // 定位与层级
        'absolute bottom-0 left-1/2 -translate-x-1/2 z-10 mb-4',
        
        // 基础样式 (圆形, 减小 padding)
        'rounded-full p-1.5 shadow-md transition-all duration-300 ease-in-out',
        
        // 颜色主题
        isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-600',
        
        // 交互效果
        'hover:scale-110 active:scale-95'
      )}
      style={{
        bottom: bottomOffset,
      }}
      aria-label="滚动到底部"
    >
      {/* 使用 ArrowDown 图标并减小尺寸 */}
      <ArrowDown className="h-4 w-4" />
    </button>
  );
};
