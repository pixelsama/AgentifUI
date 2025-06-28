'use client';

import { useMobile } from '@lib/hooks';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Pen, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import React, { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
  maxLength?: number;
}

/**
 * 响应式输入对话框组件 - Stone风格设计
 * 桌面端：居中模态框，圆润石头风格
 * 移动端：底部弹出样式，键盘友好设计
 * 用于重命名等需要用户输入的操作
 */
export function InputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder,
  defaultValue = '',
  confirmText,
  cancelText,
  isLoading = false,
  maxLength = 100,
}: InputDialogProps) {
  const { isDark } = useTheme();
  const isMobile = useMobile();
  const t = useTranslations('common.ui');
  const finalCancelText = cancelText || t('cancel');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);

  // --- BEGIN COMMENT ---
  // 客户端挂载后才能使用Portal
  // --- END COMMENT ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- BEGIN COMMENT ---
  // 当对话框打开时，重置输入值并聚焦
  // --- END COMMENT ---
  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      // 延迟聚焦，确保组件已渲染
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 150);
    }
  }, [isOpen, defaultValue]);

  // --- BEGIN COMMENT ---
  // 处理ESC键关闭
  // --- END COMMENT ---
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isLoading]);

  // --- BEGIN COMMENT ---
  // 处理点击外部关闭
  // --- END COMMENT ---
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        !isLoading
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
  }, [isOpen, onClose, isLoading]);

  // --- BEGIN COMMENT ---
  // 处理移动端滑动关闭
  // --- END COMMENT ---
  useEffect(() => {
    if (!isOpen || !isMobile || !dialogRef.current || isLoading) return;

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
  }, [isOpen, isMobile, onClose, isLoading]);

  // --- BEGIN COMMENT ---
  // 点击背景关闭
  // --- END COMMENT ---
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // --- BEGIN COMMENT ---
  // 处理表单提交
  // --- END COMMENT ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isLoading) {
      onConfirm(trimmedValue);
    }
  };

  // --- BEGIN COMMENT ---
  // 检查输入是否有效
  // --- END COMMENT ---
  const isInputValid = inputValue.trim().length > 0;

  if (!mounted) return null;

  // --- BEGIN COMMENT ---
  // 桌面端模态框样式 - Stone风格设计
  // --- END COMMENT ---
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
        <form onSubmit={handleSubmit}>
          {/* --- BEGIN COMMENT ---
          桌面端图标和标题区域 - 居中设计
          --- END COMMENT --- */}
          <div className="flex flex-col items-center px-8 pt-8 pb-6">
            <div
              className={cn(
                'mb-6 flex h-16 w-16 items-center justify-center rounded-full',
                'ring-1 ring-inset',
                isDark
                  ? 'bg-stone-700/50 text-stone-400 ring-stone-700/50'
                  : 'bg-stone-100 text-stone-500 ring-stone-200/50'
              )}
            >
              <Pen className="h-6 w-6" />
            </div>

            <h3
              className={cn(
                'mb-2 text-center font-serif text-xl font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              {title}
            </h3>
          </div>

          {/* --- BEGIN COMMENT ---
          桌面端输入区域
          --- END COMMENT --- */}
          <div className="px-8 pb-6">
            <label
              className={cn(
                'mb-3 block font-serif text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              {label}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={isLoading}
                className={cn(
                  'w-full rounded-xl px-4 py-3 font-serif text-base',
                  'border-2 transition-all duration-200',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                  isDark
                    ? 'border-stone-600 bg-stone-800/50 text-white placeholder-stone-500 focus:border-stone-500 focus:ring-stone-500/30 focus:ring-offset-stone-900'
                    : 'border-stone-300 bg-stone-50/50 text-stone-900 placeholder-stone-500 focus:border-stone-600 focus:ring-stone-500/30 focus:ring-offset-white'
                )}
              />
              {maxLength && (
                <div
                  className={cn(
                    'absolute right-0 -bottom-6 text-xs',
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  )}
                >
                  {inputValue.length}/{maxLength}
                </div>
              )}
            </div>
          </div>

          {/* --- BEGIN COMMENT ---
          桌面端按钮区域 - 水平布局
          --- END COMMENT --- */}
          <div className="flex items-center gap-3 p-8 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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
              {finalCancelText}
            </button>
            <button
              type="submit"
              disabled={isLoading || !isInputValid}
              className={cn(
                'flex-1 rounded-xl px-6 py-3 font-serif text-sm',
                'transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                isDark
                  ? 'bg-stone-600 text-white shadow-lg shadow-stone-900/20 hover:bg-stone-700 focus:ring-stone-500/30 focus:ring-offset-stone-900'
                  : 'bg-stone-600 text-white shadow-lg shadow-stone-900/10 hover:bg-stone-700 focus:ring-stone-500/30 focus:ring-offset-white'
              )}
            >
              {isLoading ? t('loading') : confirmText}
            </button>
          </div>

          {/* --- BEGIN COMMENT ---
          关闭按钮 - 右上角
          --- END COMMENT --- */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
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
        </form>
      </div>
    </div>
  );

  // --- BEGIN COMMENT ---
  // 移动端底部弹出样式 - Stone风格设计，键盘友好
  // --- END COMMENT ---
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
        <form onSubmit={handleSubmit}>
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
          移动端图标和标题区域
          --- END COMMENT --- */}
          <div className="flex flex-col items-center px-6 pt-4 pb-6">
            <div
              className={cn(
                'mb-6 flex h-20 w-20 items-center justify-center rounded-full',
                'ring-1 ring-inset',
                isDark
                  ? 'bg-stone-700/50 text-stone-400 ring-stone-700/50'
                  : 'bg-stone-100 text-stone-500 ring-stone-200/50'
              )}
            >
              <Pen className="h-8 w-8" />
            </div>

            <h3
              className={cn(
                'mb-6 text-center font-serif text-xl font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              {title}
            </h3>

            {/* --- BEGIN COMMENT ---
            移动端输入区域 - 更大的触摸区域
            --- END COMMENT --- */}
            <div className="w-full">
              <label
                className={cn(
                  'mb-3 block font-serif text-base font-medium',
                  isDark ? 'text-stone-300' : 'text-stone-700'
                )}
              >
                {label}
              </label>
              <div className="relative mb-8">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  disabled={isLoading}
                  className={cn(
                    'w-full rounded-2xl px-4 py-4 font-serif text-base',
                    'border-2 transition-all duration-200',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                    isDark
                      ? 'border-stone-600 bg-stone-800/50 text-white placeholder-stone-500 focus:border-stone-500 focus:ring-stone-500/30 focus:ring-offset-stone-900'
                      : 'border-stone-300 bg-stone-50/50 text-stone-900 placeholder-stone-500 focus:border-stone-600 focus:ring-stone-500/30 focus:ring-offset-white'
                  )}
                />
                {maxLength && (
                  <div
                    className={cn(
                      'absolute right-0 -bottom-6 text-sm',
                      isDark ? 'text-stone-500' : 'text-stone-400'
                    )}
                  >
                    {inputValue.length}/{maxLength}
                  </div>
                )}
              </div>

              {/* --- BEGIN COMMENT ---
              移动端按钮区域 - 垂直排列，更大的触摸区域
              --- END COMMENT --- */}
              <div className="w-full space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || !isInputValid}
                  className={cn(
                    'w-full rounded-2xl py-4 font-serif text-base',
                    'transition-all duration-200',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                    isDark
                      ? 'bg-stone-600 text-white shadow-lg shadow-stone-900/20 hover:bg-stone-700 focus:ring-stone-500/30 focus:ring-offset-stone-900'
                      : 'bg-stone-600 text-white shadow-lg shadow-stone-900/10 hover:bg-stone-700 focus:ring-stone-500/30 focus:ring-offset-white'
                  )}
                >
                  {isLoading ? t('loading') : confirmText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
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
                  {finalCancelText}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // --- BEGIN COMMENT ---
  // 根据设备类型返回相应的对话框
  // --- END COMMENT ---
  return createPortal(isMobile ? mobileDialog : desktopDialog, document.body);
}
