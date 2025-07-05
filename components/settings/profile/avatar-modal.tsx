'use client';

import { useAvatarUpload } from '@lib/hooks/use-avatar-upload';
import { useProfile } from '@lib/hooks/use-profile';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { cn } from '@lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Camera, Check, Trash2, X } from 'lucide-react';

import React, { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { AvatarCropper } from './avatar-cropper';
import { AvatarPreview } from './avatar-preview';
import { AvatarUploadArea } from './avatar-upload-area';

// 头像模态框组件接口定义
interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarUpdate?: (avatarUrl: string | null) => void;
}

/**
 * 现代化头像模态框组件
 *
 * 功能特点：
 * - 现代化的长方形模态框设计
 * - 支持拖拽和点击上传
 * - 实时进度显示和状态反馈
 * - 图片预览功能
 * - 头像删除功能
 * - 响应式设计
 * - 符合项目主题样式
 * - 优化性能和流畅度
 */
export function AvatarModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName,
  onAvatarUpdate,
}: AvatarModalProps) {
  const { colors, isDark } = useSettingsColors();
  const { profile } = useProfile();
  const tProfile = useTranslations('pages.settings.profileSettings');
  const t = useTranslations('pages.settings.avatarModal');
  const avatarUpload = useAvatarUpload();

  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // 简化状态管理：主要使用useAvatarUpload的状态，只保留UI相关状态
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 重置状态
  const resetState = useCallback(() => {
    avatarUpload.resetState();
    setPreviewUrl(null);
    setShowDeleteConfirm(false);
    setShowCropper(false);
    setSelectedFile(null);
  }, [avatarUpload]);

  // 处理模态框关闭
  const handleClose = useCallback(() => {
    if (!avatarUpload.state.isUploading && !avatarUpload.state.isDeleting) {
      resetState();
      onClose();
    }
  }, [
    avatarUpload.state.isUploading,
    avatarUpload.state.isDeleting,
    resetState,
    onClose,
  ]);

  // 文件验证
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: t('errors.unsupportedType'),
        };
      }

      if (file.size > maxSize) {
        return {
          valid: false,
          error: t('errors.fileTooLarge'),
        };
      }

      return { valid: true };
    },
    [t]
  );

  // 处理文件选择 - 进入裁切模式
  const handleFileSelect = useCallback(
    (file: File) => {
      // 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        console.error('File validation failed:', validation.error);
        return;
      }

      // 设置选中的文件并进入裁切模式
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setShowCropper(true);
    },
    [validateFile]
  );

  // 处理文件输入变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      e.target.value = '';
    },
    [handleFileSelect]
  );

  // 处理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // 确认裁切并上传
  const handleCropConfirm = useCallback(
    async (croppedFile: File) => {
      if (!profile?.id) return;

      try {
        // 上传裁切后的图片
        const result = await avatarUpload.uploadAvatar(croppedFile, profile.id);

        // 通知父组件更新
        onAvatarUpdate?.(result.url);

        // 1.5秒后自动关闭
        setTimeout(() => {
          handleClose();
        }, 1500);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [profile?.id, avatarUpload, onAvatarUpdate, handleClose]
  );

  // 取消裁切，返回上传界面
  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // 处理删除头像（真实实现）
  const handleDeleteAvatar = useCallback(async () => {
    if (!profile?.id || !currentAvatarUrl) return;

    try {
      // 使用useAvatarUpload中的extractFilePathFromUrl函数
      const extractFilePathFromUrl = (url: string): string | null => {
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/');
          const bucketIndex = pathParts.indexOf('avatars');
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            return pathParts.slice(bucketIndex + 1).join('/');
          }
          return null;
        } catch {
          return null;
        }
      };

      const filePath = extractFilePathFromUrl(currentAvatarUrl);
      if (filePath) {
        // 调用真实的删除API，传递userId
        await avatarUpload.deleteAvatar(filePath, profile.id);
      }

      // 通知父组件更新
      onAvatarUpdate?.(null);

      // 关闭确认对话框
      setShowDeleteConfirm(false);

      // 1秒后自动关闭
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [
    profile?.id,
    currentAvatarUrl,
    onAvatarUpdate,
    handleClose,
    avatarUpload,
  ]);

  // 当前显示的头像URL
  const displayAvatarUrl = previewUrl || currentAvatarUrl;

  // 获取当前的上传/删除状态
  const isProcessing =
    avatarUpload.state.isUploading || avatarUpload.state.isDeleting;
  const currentProgress = avatarUpload.state.progress;
  const currentError = avatarUpload.state.error;

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -5 }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
          onClick={e => e.stopPropagation()}
          className={cn(
            'w-full max-w-md rounded-xl shadow-xl',
            colors.cardBackground.tailwind,
            colors.borderColor.tailwind,
            'overflow-hidden border',
            isDark ? 'bg-stone-900/98' : 'bg-white/98'
          )}
        >
          {/* 模态框头部 */}
          <div
            className={cn(
              'flex items-center justify-between border-b px-5 py-4',
              colors.borderColor.tailwind,
              isDark ? 'bg-stone-800/30' : 'bg-stone-50/50'
            )}
          >
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                  isDark ? 'bg-stone-700' : 'bg-stone-100'
                )}
              >
                <Camera
                  className={cn('h-5 w-5', colors.secondaryTextColor.tailwind)}
                />
              </div>
              <div>
                <h2
                  className={cn(
                    'font-serif text-lg font-semibold',
                    colors.textColor.tailwind
                  )}
                >
                  {t('title')}
                </h2>
                <p
                  className={cn(
                    'font-serif text-sm',
                    colors.secondaryTextColor.tailwind
                  )}
                >
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className={cn(
                'rounded-lg p-2 transition-colors duration-150',
                isDark
                  ? 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 模态框内容 */}
          <div className="space-y-5 p-5">
            {/* 裁切界面 */}
            {showCropper && previewUrl && (
              <AvatarCropper
                imageUrl={previewUrl}
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
                isUploading={isProcessing}
                isDark={isDark}
                colors={colors}
              />
            )}

            {/* 原有的上传界面 - 只在非裁切模式下显示 */}
            {!showCropper && (
              <>
                {/* 当前头像显示 */}
                <AvatarPreview
                  avatarUrl={displayAvatarUrl}
                  userName={userName}
                  isUploading={isProcessing}
                  progress={currentProgress}
                  isDark={isDark}
                  colors={colors}
                />

                {/* 状态消息 */}
                <AnimatePresence>
                  {currentError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'flex items-center rounded-lg p-3',
                        isDark
                          ? 'border border-red-800 bg-red-900/20 text-red-300'
                          : 'border border-red-200 bg-red-50 text-red-700'
                      )}
                    >
                      <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="font-serif text-sm">{currentError}</span>
                    </motion.div>
                  )}

                  {avatarUpload.state.status === 'success' && !currentError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'flex items-center rounded-lg p-3',
                        isDark
                          ? 'border border-green-800 bg-green-900/20 text-green-300'
                          : 'border border-green-200 bg-green-50 text-green-700'
                      )}
                    >
                      <Check className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="font-serif text-sm">
                        {t('status.success')}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 上传区域 */}
                <AvatarUploadArea
                  onFileSelect={handleFileSelect}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  isDragOver={isDragOver}
                  isUploading={isProcessing}
                  hasCurrentAvatar={!!currentAvatarUrl}
                  progress={currentProgress}
                  isDark={isDark}
                  colors={colors}
                />

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  {currentAvatarUrl && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isProcessing}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-serif text-sm transition-colors duration-150',
                        'border disabled:cursor-not-allowed disabled:opacity-50',
                        isDark
                          ? 'border-red-800 bg-red-900/20 text-red-300 hover:bg-red-900/30'
                          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('buttons.deleteAvatar')}
                    </button>
                  )}

                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className={cn(
                      'flex-1 rounded-lg px-4 py-2.5 font-serif text-sm transition-colors duration-150',
                      colors.buttonBackground.tailwind,
                      colors.buttonBorder.tailwind,
                      colors.buttonText.tailwind,
                      colors.buttonHover.tailwind,
                      'border disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    {isProcessing
                      ? t('buttons.uploading')
                      : t('buttons.complete')}
                  </button>
                </div>
              </>
            )}

            {/* 删除确认对话框 */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={e => e.stopPropagation()}
                    className={cn(
                      'mx-4 w-full max-w-sm rounded-lg p-5 shadow-xl',
                      colors.cardBackground.tailwind,
                      colors.borderColor.tailwind,
                      'border'
                    )}
                  >
                    <div className="space-y-4">
                      <div className="text-center">
                        <div
                          className={cn(
                            'inline-flex h-10 w-10 items-center justify-center rounded-full',
                            isDark ? 'bg-red-900/20' : 'bg-red-100'
                          )}
                        >
                          <Trash2
                            className={cn(
                              'h-5 w-5',
                              isDark ? 'text-red-400' : 'text-red-600'
                            )}
                          />
                        </div>
                        <h3
                          className={cn(
                            'mt-3 font-serif text-base font-medium',
                            colors.textColor.tailwind
                          )}
                        >
                          {t('deleteConfirm.title')}
                        </h3>
                        <p
                          className={cn(
                            'mt-2 font-serif text-sm',
                            colors.secondaryTextColor.tailwind
                          )}
                        >
                          {t('deleteConfirm.message')}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className={cn(
                            'flex-1 rounded-lg px-4 py-2 font-serif text-sm transition-colors duration-150',
                            colors.buttonBackground.tailwind,
                            colors.buttonBorder.tailwind,
                            colors.buttonText.tailwind,
                            colors.buttonHover.tailwind,
                            'border'
                          )}
                        >
                          {t('buttons.cancel')}
                        </button>
                        <button
                          onClick={handleDeleteAvatar}
                          disabled={isProcessing}
                          className={cn(
                            'flex-1 rounded-lg px-4 py-2 font-serif text-sm transition-colors duration-150',
                            'border disabled:cursor-not-allowed disabled:opacity-50',
                            isDark
                              ? 'border-red-800 bg-red-900/20 text-red-300 hover:bg-red-900/30'
                              : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          )}
                        >
                          {isProcessing
                            ? t('buttons.deleting')
                            : t('buttons.confirmDelete')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
