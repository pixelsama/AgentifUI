'use client';

import { useAvatarUpload } from '@lib/hooks/use-avatar-upload';
import { useProfile } from '@lib/hooks/use-profile';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { cn } from '@lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Camera,
  Check,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import React, { useCallback, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

// --- BEGIN COMMENT ---
// 头像模态框组件接口定义
// --- END COMMENT ---
interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarUpdate?: (avatarUrl: string | null) => void;
}

// --- BEGIN COMMENT ---
// 上传状态接口
// --- END COMMENT ---
interface UploadState {
  isUploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  error: string | null;
}

// --- BEGIN COMMENT ---
// 生成用户头像的首字母
// --- END COMMENT ---
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// --- BEGIN COMMENT ---
// 根据用户名生成一致的石色系背景颜色
// --- END COMMENT ---
const getAvatarBgColor = (name: string) => {
  const colors = [
    '#78716c', // stone-500
    '#57534e', // stone-600
    '#44403c', // stone-700
    '#64748b', // slate-500
    '#475569', // slate-600
    '#6b7280', // gray-500
    '#4b5563', // gray-600
    '#737373', // neutral-500
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    status: 'idle',
    error: null,
  });

  // --- BEGIN COMMENT ---
  // 重置状态
  // --- END COMMENT ---
  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      status: 'idle',
      error: null,
    });
    setPreviewUrl(null);
    setShowDeleteConfirm(false);
  }, []);

  // --- BEGIN COMMENT ---
  // 处理模态框关闭
  // --- END COMMENT ---
  const handleClose = useCallback(() => {
    if (!uploadState.isUploading) {
      resetState();
      onClose();
    }
  }, [uploadState.isUploading, resetState, onClose]);

  // --- BEGIN COMMENT ---
  // 文件验证
  // --- END COMMENT ---
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

  // --- BEGIN COMMENT ---
  // 处理文件上传（真实实现）
  // --- END COMMENT ---
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!profile?.id) {
        setUploadState(prev => ({
          ...prev,
          error: t('errors.userNotLoggedIn'),
        }));
        return;
      }

      // 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadState(prev => ({
          ...prev,
          error: validation.error || t('errors.uploadFailed'),
        }));
        return;
      }

      // 创建预览URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // 开始上传
      setUploadState({
        isUploading: true,
        progress: 0,
        status: 'uploading',
        error: null,
      });

      try {
        // 调用真实的上传API
        const result = await avatarUpload.uploadAvatar(file, profile.id);

        setUploadState({
          isUploading: false,
          progress: 100,
          status: 'complete',
          error: null,
        });

        // 通知父组件更新
        onAvatarUpdate?.(result.url);

        // 1.5秒后自动关闭
        setTimeout(() => {
          handleClose();
        }, 1500);
      } catch (error) {
        setUploadState({
          isUploading: false,
          progress: 0,
          status: 'error',
          error:
            error instanceof Error ? error.message : t('errors.uploadFailed'),
        });
      } finally {
        // 清理预览URL
        URL.revokeObjectURL(preview);
        setPreviewUrl(null);
      }
    },
    [profile?.id, validateFile, onAvatarUpdate, handleClose, t, avatarUpload]
  );

  // --- BEGIN COMMENT ---
  // 处理文件选择
  // --- END COMMENT ---
  const handleFileSelect = useCallback(
    (file: File) => {
      handleFileUpload(file);
    },
    [handleFileUpload]
  );

  // --- BEGIN COMMENT ---
  // 处理文件输入变化
  // --- END COMMENT ---
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

  // --- BEGIN COMMENT ---
  // 处理拖拽事件
  // --- END COMMENT ---
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

  // --- BEGIN COMMENT ---
  // 处理删除头像（真实实现）
  // --- END COMMENT ---
  const handleDeleteAvatar = useCallback(async () => {
    if (!profile?.id || !currentAvatarUrl) return;

    setUploadState({
      isUploading: true,
      progress: 0,
      status: 'uploading',
      error: null,
    });

    try {
      // 从URL中提取文件路径
      const url = new URL(currentAvatarUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('avatars');
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        // 调用真实的删除API，传递userId
        await avatarUpload.deleteAvatar(filePath, profile.id);
      }

      setUploadState({
        isUploading: false,
        progress: 100,
        status: 'complete',
        error: null,
      });

      // 通知父组件更新
      onAvatarUpdate?.(null);

      // 关闭确认对话框
      setShowDeleteConfirm(false);

      // 1秒后自动关闭
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        status: 'error',
        error:
          error instanceof Error ? error.message : t('errors.deleteFailed'),
      });
    }
  }, [
    profile?.id,
    currentAvatarUrl,
    onAvatarUpdate,
    handleClose,
    t,
    avatarUpload,
  ]);

  // --- BEGIN COMMENT ---
  // 点击上传区域
  // --- END COMMENT ---
  const handleUploadClick = useCallback(() => {
    if (!uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  }, [uploadState.isUploading]);

  // 当前显示的头像URL
  const displayAvatarUrl = previewUrl || currentAvatarUrl;

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
                  'flex h-10 w-10 items-center justify-center rounded-full',
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
              disabled={uploadState.isUploading}
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
            {/* 当前头像显示 */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                {displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt={t('currentAvatar')}
                    className={cn(
                      'h-20 w-20 rounded-full object-cover ring-2',
                      isDark ? 'ring-stone-700' : 'ring-stone-200',
                      uploadState.isUploading && 'opacity-75'
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-20 w-20 items-center justify-center rounded-full text-xl font-medium text-white ring-2',
                      isDark ? 'ring-stone-700' : 'ring-stone-200'
                    )}
                    style={{
                      backgroundColor: getAvatarBgColor(userName),
                    }}
                  >
                    {getInitials(userName)}
                  </div>
                )}

                {/* 上传进度覆盖层 */}
                {(uploadState.isUploading ||
                  avatarUpload.state.isUploading ||
                  avatarUpload.state.isDeleting) && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-white" />
                      <div className="mt-1 text-xs text-white">
                        {avatarUpload.state.progress || uploadState.progress}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3
                  className={cn(
                    'font-serif text-sm font-medium',
                    colors.textColor.tailwind
                  )}
                >
                  {userName}
                </h3>
                <p
                  className={cn(
                    'font-serif text-xs',
                    colors.secondaryTextColor.tailwind
                  )}
                >
                  {t('supportedFormats')}
                </p>
              </div>
            </div>

            {/* 状态消息 */}
            <AnimatePresence>
              {(uploadState.error || avatarUpload.state.error) && (
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
                  <span className="font-serif text-sm">
                    {avatarUpload.state.error || uploadState.error}
                  </span>
                </motion.div>
              )}

              {(uploadState.status === 'complete' ||
                avatarUpload.state.status === 'success') &&
                !uploadState.error &&
                !avatarUpload.state.error && (
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
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleUploadClick}
              className={cn(
                'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-150',
                isDragOver
                  ? isDark
                    ? 'border-stone-400 bg-stone-800/50'
                    : 'border-stone-400 bg-stone-50'
                  : colors.borderColor.tailwind,
                (uploadState.isUploading ||
                  avatarUpload.state.isUploading ||
                  avatarUpload.state.isDeleting) &&
                  'cursor-not-allowed opacity-75',
                colors.cardBackground.tailwind
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                disabled={
                  uploadState.isUploading ||
                  avatarUpload.state.isUploading ||
                  avatarUpload.state.isDeleting
                }
              />

              <div className="space-y-3">
                {/* 上传图标 */}
                <div
                  className={cn(
                    'inline-flex h-12 w-12 items-center justify-center rounded-full',
                    isDark ? 'bg-stone-700' : 'bg-stone-100'
                  )}
                >
                  {uploadState.isUploading ||
                  avatarUpload.state.isUploading ||
                  avatarUpload.state.isDeleting ? (
                    <Loader2
                      className={cn(
                        'h-6 w-6 animate-spin',
                        colors.secondaryTextColor.tailwind
                      )}
                    />
                  ) : (
                    <Upload
                      className={cn(
                        'h-6 w-6',
                        colors.secondaryTextColor.tailwind
                      )}
                    />
                  )}
                </div>

                {/* 上传文本 */}
                <div className="space-y-1">
                  <p
                    className={cn(
                      'font-serif text-sm font-medium',
                      colors.textColor.tailwind
                    )}
                  >
                    {uploadState.isUploading ||
                    avatarUpload.state.isUploading ||
                    avatarUpload.state.isDeleting
                      ? t('uploadArea.uploading')
                      : currentAvatarUrl
                        ? t('uploadArea.changeAvatar')
                        : t('uploadArea.uploadAvatar')}
                  </p>
                  <p
                    className={cn(
                      'font-serif text-xs',
                      colors.secondaryTextColor.tailwind
                    )}
                  >
                    {uploadState.isUploading ||
                    avatarUpload.state.isUploading ||
                    avatarUpload.state.isDeleting
                      ? t('uploadArea.uploadProgress', {
                          progress:
                            avatarUpload.state.progress || uploadState.progress,
                        })
                      : t('uploadArea.dragHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {currentAvatarUrl && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={
                    uploadState.isUploading ||
                    avatarUpload.state.isUploading ||
                    avatarUpload.state.isDeleting
                  }
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
                disabled={
                  uploadState.isUploading ||
                  avatarUpload.state.isUploading ||
                  avatarUpload.state.isDeleting
                }
                className={cn(
                  'flex-1 rounded-lg px-4 py-2.5 font-serif text-sm transition-colors duration-150',
                  colors.buttonBackground.tailwind,
                  colors.buttonBorder.tailwind,
                  colors.buttonText.tailwind,
                  colors.buttonHover.tailwind,
                  'border disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {uploadState.isUploading ||
                avatarUpload.state.isUploading ||
                avatarUpload.state.isDeleting
                  ? t('buttons.uploading')
                  : t('buttons.complete')}
              </button>
            </div>
          </div>

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
                        disabled={
                          uploadState.isUploading ||
                          avatarUpload.state.isUploading ||
                          avatarUpload.state.isDeleting
                        }
                        className={cn(
                          'flex-1 rounded-lg px-4 py-2 font-serif text-sm transition-colors duration-150',
                          'border disabled:cursor-not-allowed disabled:opacity-50',
                          isDark
                            ? 'border-red-800 bg-red-900/20 text-red-300 hover:bg-red-900/30'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        )}
                      >
                        {uploadState.isUploading ||
                        avatarUpload.state.isUploading ||
                        avatarUpload.state.isDeleting
                          ? t('buttons.deleting')
                          : t('buttons.confirmDelete')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
