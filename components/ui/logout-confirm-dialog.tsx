'use client';

import { useLogout } from '@lib/hooks/use-logout';
import { useMobile } from '@lib/hooks/use-mobile';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { LogOut, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import React, { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 退出登录确认对话框组件 - Stone风格设计
 * 桌面端：居中模态框，圆润石头风格
 * 移动端：底部弹出样式，更大的触摸区域
 * 支持国际化和响应式设计
 */
export function LogoutConfirmDialog({
  isOpen,
  onClose,
}: LogoutConfirmDialogProps) {
  const { isDark } = useTheme();
  const isMobile = useMobile();
  const { logout } = useLogout();
  const t = useTranslations('common.ui.logoutDialog');
  const tCommon = useTranslations('common.ui');
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 客户端挂载后才能使用Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理ESC键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isLoggingOut]);

  // 处理点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        !isLoggingOut
      ) {
        onClose();
      }
    };

    // 添加延迟，避免打开时立即关闭
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isLoggingOut]);

  // 处理移动端滑动关闭
  useEffect(() => {
    if (!isOpen || !isMobile || !dialogRef.current || isLoggingOut) return;

    let startY = 0;
    let currentY = 0;
    const dialog = dialogRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        dialog.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleTouchEnd = () => {
      const deltaY = currentY - startY;

      if (deltaY > 100) {
        // 向下滑动超过阈值，关闭弹窗
        onClose();
      } else {
        // 恢复原位
        dialog.style.transform = '';
      }
    };

    dialog.addEventListener('touchstart', handleTouchStart);
    dialog.addEventListener('touchmove', handleTouchMove);
    dialog.addEventListener('touchend', handleTouchEnd);

    return () => {
      dialog.removeEventListener('touchstart', handleTouchStart);
      dialog.removeEventListener('touchmove', handleTouchMove);
      dialog.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, isMobile, onClose, isLoggingOut]);

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoggingOut) {
      onClose();
    }
  };

  // 处理退出登录确认
  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!mounted) return null;

  // 桌面端模态框样式 - Stone风格设计
  const desktopDialog = (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-md',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        'transition-all duration-300 ease-out'
      )}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className={cn(
          'mx-auto w-full max-w-lg rounded-2xl shadow-2xl',
          'transform transition-all duration-300 ease-out',
          isDark
            ? 'border border-stone-700/50 bg-stone-900/95 shadow-black/40'
            : 'border border-stone-200/50 bg-white/95 shadow-stone-900/20',
          'backdrop-blur-sm',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {/* --- BEGIN COMMENT ---
        桌面端图标区域 - 居中设计
        --- END COMMENT --- */}
        <div className="flex flex-col items-center px-8 pt-8 pb-6">
          <div
            className={cn(
              'mb-6 flex h-16 w-16 items-center justify-center rounded-full',
              'ring-1 ring-inset',
              isDark
                ? 'bg-red-900/20 text-red-400 ring-stone-700/50'
                : 'bg-red-50 text-red-500 ring-stone-200/50'
            )}
          >
            <LogOut className="h-6 w-6" />
          </div>

          <h3
            className={cn(
              'mb-3 text-center font-serif text-xl font-semibold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            {t('title')}
          </h3>

          <p
            className={cn(
              'max-w-sm text-center font-serif text-sm leading-relaxed',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            {t('message')}
          </p>
        </div>

        {/* --- BEGIN COMMENT ---
        桌面端按钮区域 - 水平布局
        --- END COMMENT --- */}
        <div className="flex items-center gap-3 p-6 pt-0 pb-8">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className={cn(
              'flex-1 rounded-xl px-6 py-3 font-serif text-sm',
              'border transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-offset-2 focus:outline-none',
              isDark
                ? 'border-stone-600 text-stone-300 hover:bg-stone-700/50 focus:ring-stone-500/30 focus:ring-offset-stone-900'
                : 'border-stone-300 text-stone-700 hover:bg-stone-50 focus:ring-stone-500/30 focus:ring-offset-white'
            )}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className={cn(
              'flex-1 rounded-xl px-6 py-3 font-serif text-sm',
              'transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-offset-2 focus:outline-none',
              'bg-red-600 text-white shadow-lg shadow-red-900/20 hover:bg-red-700 focus:ring-red-500/30',
              isDark ? 'focus:ring-offset-stone-900' : 'focus:ring-offset-white'
            )}
          >
            {isLoggingOut ? t('loggingOut') : t('confirm')}
          </button>
        </div>

        {/* --- BEGIN COMMENT ---
        关闭按钮 - 右上角
        --- END COMMENT --- */}
        <button
          onClick={onClose}
          disabled={isLoggingOut}
          className={cn(
            'absolute top-4 right-4 rounded-full p-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
            isDark
              ? 'text-stone-500 hover:bg-stone-800/50 hover:text-stone-300'
              : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  // 移动端底部弹出样式 - Stone风格设计
  const mobileDialog = (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-end justify-center',
        'bg-black/50 backdrop-blur-md',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        'transition-opacity duration-300 ease-out'
      )}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className={cn(
          'w-full max-w-lg rounded-t-3xl',
          'transform transition-transform duration-300 ease-out',
          isDark
            ? 'border-t border-stone-700/50 bg-stone-900/95 shadow-black/40'
            : 'border-t border-stone-200/50 bg-white/95 shadow-stone-900/20',
          'shadow-2xl backdrop-blur-sm',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* --- BEGIN COMMENT ---
        移动端顶部拖动条 - 更粗更明显
        --- END COMMENT --- */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <div
            className={cn(
              'h-1.5 w-16 rounded-full',
              isDark ? 'bg-stone-600' : 'bg-stone-300'
            )}
          ></div>
        </div>

        {/* --- BEGIN COMMENT ---
        移动端图标和内容区域
        --- END COMMENT --- */}
        <div className="flex flex-col items-center px-6 pt-4 pb-8">
          <div
            className={cn(
              'mb-6 flex h-20 w-20 items-center justify-center rounded-full',
              'ring-1 ring-inset',
              isDark
                ? 'bg-red-900/20 text-red-400 ring-stone-700/50'
                : 'bg-red-50 text-red-500 ring-stone-200/50'
            )}
          >
            <LogOut className="h-8 w-8" />
          </div>

          <h3
            className={cn(
              'mb-4 text-center font-serif text-xl font-semibold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            {t('title')}
          </h3>

          <p
            className={cn(
              'mb-8 max-w-sm text-center font-serif text-base leading-relaxed',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            {t('message')}
          </p>

          {/* --- BEGIN COMMENT ---
          移动端按钮区域 - 垂直排列，更大的触摸区域
          --- END COMMENT --- */}
          <div className="w-full space-y-3">
            <button
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className={cn(
                'w-full rounded-2xl py-4 font-serif text-base',
                'transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'bg-red-600 text-white shadow-lg shadow-red-900/20 hover:bg-red-700 focus:ring-red-500/30',
                isDark
                  ? 'focus:ring-offset-stone-900'
                  : 'focus:ring-offset-white'
              )}
            >
              {isLoggingOut ? t('loggingOut') : t('confirm')}
            </button>
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className={cn(
                'w-full rounded-2xl py-4 font-serif text-base',
                'border transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                isDark
                  ? 'border-stone-600 text-stone-300 hover:bg-stone-700/50 focus:ring-stone-500/30 focus:ring-offset-stone-900'
                  : 'border-stone-300 text-stone-700 hover:bg-stone-50 focus:ring-stone-500/30 focus:ring-offset-white'
              )}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 根据设备类型返回相应的对话框
  return createPortal(isMobile ? mobileDialog : desktopDialog, document.body);
}
