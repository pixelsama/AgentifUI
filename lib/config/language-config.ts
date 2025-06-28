// --- BEGIN COMMENT ---
// 语言配置文件
// 统一管理支持的语言列表，避免多处硬编码
// --- END COMMENT ---

export interface LanguageInfo {
  name: string;
  nativeName: string;
  code: string;
}

// --- BEGIN COMMENT ---
// 支持的语言配置
// 与 i18n/request.ts 中的 supportedLocales 保持一致
// --- END COMMENT ---
export const SUPPORTED_LANGUAGES = {
  'zh-CN': {
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    code: 'zh-CN',
  },
  'zh-TW': {
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    code: 'zh-TW',
  },
  'en-US': {
    name: 'English (US)',
    nativeName: 'English',
    code: 'en-US',
  },
  'ja-JP': {
    name: 'Japanese',
    nativeName: '日本語',
    code: 'ja-JP',
  },
  'es-ES': {
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    code: 'es-ES',
  },
} as const;

export type SupportedLocale = keyof typeof SUPPORTED_LANGUAGES;

// --- BEGIN COMMENT ---
// 默认语言
// --- END COMMENT ---
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';

// --- BEGIN COMMENT ---
// 获取所有支持的语言代码数组
// --- END COMMENT ---
export const getSupportedLocales = (): SupportedLocale[] => {
  return Object.keys(SUPPORTED_LANGUAGES) as SupportedLocale[];
};

// --- BEGIN COMMENT ---
// 验证语言代码是否支持
// --- END COMMENT ---
export const isValidLocale = (locale: string): locale is SupportedLocale => {
  return locale in SUPPORTED_LANGUAGES;
};

// --- BEGIN COMMENT ---
// 获取语言信息
// --- END COMMENT ---
export const getLanguageInfo = (locale: SupportedLocale): LanguageInfo => {
  return SUPPORTED_LANGUAGES[locale];
};

// --- BEGIN COMMENT ---
// 设置语言Cookie
// --- END COMMENT ---
export const setLanguageCookie = (locale: SupportedLocale): void => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
};

// --- BEGIN COMMENT ---
// 从Cookie获取当前语言
// --- END COMMENT ---
export const getCurrentLocaleFromCookie = (): SupportedLocale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie =>
    cookie.trim().startsWith('NEXT_LOCALE=')
  );

  if (localeCookie) {
    const locale = localeCookie.split('=')[1];
    return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  }

  return DEFAULT_LOCALE;
};
