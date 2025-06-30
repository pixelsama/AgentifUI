'use client';

import { cn } from '@lib/utils';
import { getAvatarBgColor, getInitials } from '@lib/utils/avatar';
import { Loader2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

// --- BEGIN COMMENT ---
// 头像预览组件接口
// --- END COMMENT ---
interface AvatarPreviewProps {
  avatarUrl?: string | null;
  userName: string;
  isUploading?: boolean;
  progress?: number;
  isDark?: boolean;
  colors: any;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarPreview({
  avatarUrl,
  userName,
  isUploading = false,
  progress = 0,
  isDark = false,
  colors,
  size = 'md',
}: AvatarPreviewProps) {
  const t = useTranslations('pages.settings.avatarModal');

  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-20 w-20 text-xl',
    lg: 'h-32 w-32 text-3xl',
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={t('currentAvatar')}
            className={cn(
              sizeClasses[size],
              'rounded-full object-cover ring-2',
              isDark ? 'ring-stone-700' : 'ring-stone-200',
              isUploading && 'opacity-75'
            )}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center rounded-full font-medium text-white ring-2',
              sizeClasses[size],
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
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <div className="text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-white" />
              <div className="mt-1 text-xs text-white">{progress}%</div>
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
  );
}
