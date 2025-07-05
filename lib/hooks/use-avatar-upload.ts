'use client';

import { createClient } from '@lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

// 头像上传状态类型定义
export interface AvatarUploadState {
  isUploading: boolean;
  isDeleting: boolean;
  progress: number;
  error: string | null;
  status: 'idle' | 'uploading' | 'success' | 'error' | 'deleting';
}

// 头像上传结果类型
export interface AvatarUploadResult {
  url: string;
  path: string;
}

// 从头像URL中提取文件路径的辅助函数
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

// 头像上传Hook
// 提供完整的头像上传、删除、URL生成功能
export function useAvatarUpload() {
  const [state, setState] = useState<AvatarUploadState>({
    isUploading: false,
    isDeleting: false,
    progress: 0,
    error: null,
    status: 'idle',
  });

  const supabase = createClient();
  const t = useTranslations('pages.settings.avatarUpload');

  // 文件验证函数
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
          error: t('errors.unsupportedFileType', {
            types: allowedTypes.join(', '),
          }),
        };
      }

      if (file.size > maxSize) {
        return {
          valid: false,
          error: t('errors.fileTooLarge', {
            maxSize: Math.round(maxSize / 1024 / 1024),
          }),
        };
      }

      return { valid: true };
    },
    [t]
  );

  // 生成安全的文件路径
  // 使用 user-{userId}/{uuid}-{filename} 格式
  const generateFilePath = useCallback(
    (userId: string, fileName: string): string => {
      const uuid = uuidv4();
      const timestamp = Date.now();
      const extension = fileName.split('.').pop();
      const safeFileName = `${timestamp}-${uuid}.${extension}`;
      return `user-${userId}/${safeFileName}`;
    },
    []
  );

  // 上传头像函数（包含自动清理旧文件）
  const uploadAvatar = useCallback(
    async (file: File, userId: string): Promise<AvatarUploadResult> => {
      // 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setState(prev => ({
        ...prev,
        isUploading: true,
        status: 'uploading',
        progress: 0,
        error: null,
      }));

      try {
        // 1. 获取当前头像URL（用于后续删除旧文件）
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        // 2. 生成新文件路径
        const filePath = generateFilePath(userId, file.name);

        // 3. 上传新头像到 Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false, // 不覆盖，确保唯一性
          });

        if (uploadError) {
          throw new Error(
            t('errors.uploadFailed', { message: uploadError.message })
          );
        }

        // 4. 获取公共 URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error(t('errors.getUrlFailed'));
        }

        // 5. 更新数据库中的头像URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: urlData.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          throw new Error(
            t('errors.updateDatabaseFailed', { message: updateError.message })
          );
        }

        // 6. 删除旧头像文件（如果存在）
        // 使用静默删除，不影响主流程
        if (currentProfile?.avatar_url) {
          const oldFilePath = extractFilePathFromUrl(currentProfile.avatar_url);
          if (oldFilePath) {
            // 静默删除，即使失败也不影响新头像上传成功
            supabase.storage
              .from('avatars')
              .remove([oldFilePath])
              .catch(error => {
                console.warn('删除旧头像文件失败（不影响主流程）:', error);
              });
          }
        }

        setState(prev => ({
          ...prev,
          isUploading: false,
          status: 'success',
          progress: 100,
        }));

        return {
          url: urlData.publicUrl,
          path: filePath,
        };
      } catch (error) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : t('errors.uploadFailedGeneric'),
        }));
        throw error;
      }
    },
    [validateFile, generateFilePath, supabase, t]
  );

  // 删除头像函数
  const deleteAvatar = useCallback(
    async (filePath: string, userId: string): Promise<void> => {
      setState(prev => ({
        ...prev,
        isDeleting: true,
        status: 'deleting',
        error: null,
      }));

      try {
        // 从存储中删除文件
        const { error } = await supabase.storage
          .from('avatars')
          .remove([filePath]);

        if (error) {
          throw new Error(t('errors.deleteFailed', { message: error.message }));
        }

        // 更新数据库，将头像URL设为null
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          throw new Error(
            t('errors.updateDatabaseFailed', { message: updateError.message })
          );
        }

        setState(prev => ({
          ...prev,
          isDeleting: false,
          status: 'success',
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isDeleting: false,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : t('errors.deleteFailedGeneric'),
        }));
        throw error;
      }
    },
    [supabase, t]
  );

  // 重置状态函数
  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      isDeleting: false,
      progress: 0,
      error: null,
      status: 'idle',
    });
  }, []);

  return {
    state,
    uploadAvatar,
    deleteAvatar,
    validateFile,
    resetState,
  };
}
