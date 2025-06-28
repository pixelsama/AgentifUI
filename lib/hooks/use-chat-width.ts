import { useMobile } from './use-mobile';

/**
 * 提供统一的聊天组件宽度配置
 * 用于确保ChatInput、ChatLoader和ChatInputBackdrop保持相同宽度
 */
export function useChatWidth() {
  const isMobile = useMobile();

  // 桌面设备使用max-w-3xl (768px)，移动设备使用max-w-full
  const widthClass = isMobile ? 'max-w-full' : 'max-w-3xl';

  // 内边距配置
  const paddingClass = isMobile ? 'px-2' : 'px-4';

  return {
    widthClass,
    paddingClass,
    isMobile,
  };
}
