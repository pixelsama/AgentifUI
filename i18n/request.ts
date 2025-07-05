import {
  DEFAULT_LOCALE,
  getSupportedLocales,
  isValidLocale,
} from '@lib/config/language-config';

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // 动态语言配置：优先从 Cookie 读取，否则使用默认语言
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE;

  // 验证语言代码是否支持
  const supportedLocales = getSupportedLocales();
  const finalLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default,
    // 提供统一的当前时间，避免服务端客户端不一致的hydration问题
    now: new Date(),
    // 时区处理：不在这里硬编码时区，让format.dateTime使用用户的本地时区
  };
});
