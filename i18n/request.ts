import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getSupportedLocales, DEFAULT_LOCALE, isValidLocale } from '@lib/config/language-config';

export default getRequestConfig(async () => {
  // --- BEGIN COMMENT ---
  // 动态语言配置：优先从 Cookie 读取，否则使用默认语言
  // --- END COMMENT ---
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE;

  // --- BEGIN COMMENT ---
  // 验证语言代码是否支持
  // --- END COMMENT ---
  const supportedLocales = getSupportedLocales();
  const finalLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default,
    // --- BEGIN COMMENT ---
    // 提供统一的当前时间，避免服务端客户端不一致的hydration问题
    // 这是next-intl推荐的做法，确保日期格式化的一致性
    // --- END COMMENT ---
    now: new Date()
    // --- BEGIN COMMENT ---
    // 时区处理：不在这里硬编码时区，让format.dateTime使用用户的本地时区
    // 如果需要特定时区，可以在组件中通过timeZone参数指定
    // --- END COMMENT ---
  };
}); 