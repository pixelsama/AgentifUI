'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { ArrowUpIcon, MoreHorizontal, Paperclip } from 'lucide-react';

import { useTranslations } from 'next-intl';

// 主题卡片组件 - 高颜值版本
// 模拟真实的聊天界面预览，包含输入框、消息气泡、按钮等元素
// 使用项目中的实际设计风格和配色方案
interface ThemeCardProps {
  title: string;
  theme: 'light' | 'dark' | 'system';
  currentTheme: string;
  onClick: () => void;
}

export function ThemeCard({
  title,
  theme,
  currentTheme,
  onClick,
}: ThemeCardProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.settings.appearanceSettings.preview');
  const isActive = currentTheme === theme;

  // 根据主题类型获取预览样式配置
  // 完全基于项目中的真实颜色设计
  const getPreviewStyles = () => {
    switch (theme) {
      case 'light':
        return {
          // 主背景 - 对应 stone-100
          mainBg: 'bg-stone-100',
          // 侧边栏背景 - 对应展开状态的 stone-200
          sidebarBg: 'bg-stone-200',
          // 用户消息背景 - 对应 stone-200
          userMessageBg: 'bg-stone-200',
          // 助手消息背景 - 透明
          assistantMessageBg: 'bg-transparent',
          // 输入框背景 - 白色
          inputBg: 'bg-white',
          // 边框颜色
          borderColor: 'border-stone-300',
          // 文本颜色
          textColor: 'text-stone-900',
          secondaryTextColor: 'text-stone-600',
          // 按钮样式
          buttonBg: 'bg-black',
          buttonText: 'text-white',
          functionButtonBg: 'bg-transparent',
          functionButtonBorder: 'border-stone-300',
          functionButtonText: 'text-stone-600',
        };
      case 'dark':
        return {
          // 主背景 - 对应 stone-800
          mainBg: 'bg-stone-800',
          // 侧边栏背景 - 对应展开状态的 stone-700
          sidebarBg: 'bg-stone-700',
          // 用户消息背景 - 对应 stone-700
          userMessageBg: 'bg-stone-700/90',
          // 助手消息背景 - 透明
          assistantMessageBg: 'bg-transparent',
          // 输入框背景 - stone-800
          inputBg: 'bg-stone-800',
          // 边框颜色
          borderColor: 'border-stone-600',
          // 文本颜色
          textColor: 'text-stone-100',
          secondaryTextColor: 'text-stone-400',
          // 按钮样式
          buttonBg: 'bg-stone-900',
          buttonText: 'text-white',
          functionButtonBg: 'bg-stone-600/30',
          functionButtonBorder: 'border-stone-600',
          functionButtonText: 'text-stone-300',
        };
      case 'system':
        // 系统主题使用渐变效果展示两种模式
        return {
          mainBg: 'bg-gradient-to-r from-stone-100 to-stone-800',
          sidebarBg: 'bg-gradient-to-r from-stone-200 to-stone-700',
          userMessageBg: 'bg-gradient-to-r from-stone-200 to-stone-700/90',
          assistantMessageBg: 'bg-transparent',
          inputBg: 'bg-gradient-to-r from-white to-stone-800',
          borderColor: 'border-stone-400',
          textColor: 'text-stone-800',
          secondaryTextColor: 'text-stone-600',
          buttonBg: 'bg-gradient-to-r from-black to-stone-900',
          buttonText: 'text-white',
          functionButtonBg: 'bg-transparent',
          functionButtonBorder: 'border-stone-400',
          functionButtonText: 'text-stone-600',
        };
    }
  };

  const styles = getPreviewStyles();

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg',
        isActive
          ? // 使用深蓝色选中状态，线条更细
            'border-blue-800 shadow-md ring-1 ring-blue-800/20'
          : isDark
            ? 'border-stone-700 hover:border-stone-600'
            : 'border-stone-200 hover:border-stone-300'
      )}
    >
      {/* --- BEGIN COMMENT ---
      模拟聊天界面预览
      包含侧边栏、主内容区、消息气泡、输入框等真实元素
      --- END COMMENT --- */}
      <div className={cn('h-32 w-full', styles.mainBg)}>
        <div className="flex h-full">
          {/* 模拟侧边栏 */}
          <div className={cn('flex h-full w-8 flex-col', styles.sidebarBg)}>
            <div className="flex-1 space-y-1 p-1.5">
              {/* 模拟新对话按钮 */}
              <div
                className={cn(
                  'h-3 w-5 rounded-sm',
                  styles.functionButtonBg,
                  styles.functionButtonBorder,
                  'border'
                )}
              />
              {/* 模拟聊天列表项 */}
              <div className="space-y-0.5">
                <div className="h-1 w-4 rounded-full bg-current opacity-30" />
                <div className="h-1 w-3 rounded-full bg-current opacity-20" />
                <div className="h-1 w-4 rounded-full bg-current opacity-25" />
              </div>
            </div>
          </div>

          {/* 模拟主聊天区域 */}
          <div className="flex h-full flex-1 flex-col">
            {/* 模拟消息区域 */}
            <div className="flex-1 px-3 py-2">
              {/* 消息区域 - 更加居中布局，Hello消息在顶部 */}
              <div className="mx-auto max-w-[70%]">
                {/* 模拟用户消息 - 在顶部 */}
                <div className="flex justify-end">
                  <div
                    className={cn(
                      'max-w-[60%] rounded-lg px-2 py-1 text-[6px] leading-tight',
                      styles.userMessageBg,
                      theme === 'dark' ? 'text-stone-100' : 'text-stone-800'
                    )}
                  >
                    Hello
                  </div>
                </div>
              </div>
            </div>

            {/* 模拟输入框区域 - 更加居中布局 */}
            <div className="px-3 pb-1.5">
              <div className="mx-auto max-w-[70%]">
                <div
                  className={cn(
                    'flex flex-col rounded-lg border',
                    styles.inputBg,
                    styles.borderColor
                  )}
                >
                  {/* 输入文本区域 */}
                  <div className="px-2 pt-1.5 pb-2">
                    <div className="space-y-0.5">
                      <div
                        className={cn(
                          'h-0.5 w-10 rounded-full opacity-30',
                          styles.secondaryTextColor
                        )}
                      />
                      <div
                        className={cn(
                          'h-0.5 w-6 rounded-full opacity-20',
                          styles.secondaryTextColor
                        )}
                      />
                    </div>
                  </div>

                  {/* 按钮区域 */}
                  <div className="relative px-1.5 pb-1.5">
                    {/* 左下角附件按钮 */}
                    <div
                      className={cn(
                        'absolute bottom-1.5 left-1.5 flex h-2.5 w-2.5 items-center justify-center rounded border',
                        styles.functionButtonBg,
                        styles.functionButtonBorder
                      )}
                    >
                      <Paperclip
                        className={cn('h-1 w-1', styles.functionButtonText)}
                      />
                    </div>

                    {/* 右下角发送按钮 */}
                    <div
                      className={cn(
                        'absolute right-1.5 bottom-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full',
                        styles.buttonBg
                      )}
                    >
                      <ArrowUpIcon
                        className={cn('h-1 w-1', styles.buttonText)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主题标题 */}
      <div className="p-3">
        <p
          className={cn(
            'text-center text-sm font-medium',
            isActive
              ? isDark
                ? 'text-stone-300'
                : 'text-stone-700'
              : isDark
                ? 'text-stone-200'
                : 'text-stone-900'
          )}
        >
          {title}
        </p>
      </div>
    </div>
  );
}
