'use client';

import { cn } from '@lib/utils';
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
