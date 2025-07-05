/**
 * 头像相关工具函数
 * 用于生成用户头像的首字母和背景颜色
 */

// 生成用户头像的首字母
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') {
    return 'U'; // 默认返回 U (User)
  }

  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// 根据用户名生成一致的石色系背景颜色
export const getAvatarBgColor = (name: string): string => {
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

  if (!name || name.trim() === '') {
    return colors[0]; // 默认返回第一个颜色
  }

  let hash = 0;
  const trimmedName = name.trim();

  for (let i = 0; i < trimmedName.length; i++) {
    hash = trimmedName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
