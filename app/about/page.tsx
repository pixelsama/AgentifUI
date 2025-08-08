'use client';

import { DynamicAboutRenderer } from '@components/about/dynamic-about-renderer';
import { PageLoader } from '@components/ui/page-loader';
import { useDynamicTranslations } from '@lib/hooks/use-dynamic-translations';
import { useTheme } from '@lib/hooks/use-theme';
import { createClient } from '@lib/supabase/client';
import type { AboutTranslationData } from '@lib/types/about-page-components';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const staticT = useTranslations('pages.about');
  const { t: dynamicT, isLoading } = useDynamicTranslations({
    sections: ['pages.about'],
  });
  const [mounted, setMounted] = useState(false);

  // enhanced translation function that tries dynamic first, then static fallback
  const t = (key: string, params?: Record<string, string | number>) => {
    const dynamicValue = dynamicT(key, 'pages.about', params);
    return dynamicValue || staticT(key, params);
  };

  // ensure client-side rendering consistency
  useEffect(() => {
    setMounted(true);
  }, []);

  // get colors based on theme
  const getColors = () => {
    if (isDark) {
      return {
        titleGradient: 'from-stone-300 to-stone-500',
        textColor: 'text-gray-300',
        headingColor: 'text-gray-100',
        paragraphColor: 'text-gray-400',
        cardBg: 'bg-stone-700',
        cardBorder: 'border-stone-600',
        cardShadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
        cardHeadingColor: 'text-stone-300',
        cardTextColor: 'text-gray-400',
        buttonClass:
          'bg-stone-600 hover:bg-stone-500 text-gray-100 cursor-pointer hover:scale-105',
      };
    } else {
      return {
        titleGradient: 'from-stone-700 to-stone-900',
        textColor: 'text-stone-700',
        headingColor: 'text-stone-800',
        paragraphColor: 'text-stone-600',
        cardBg: 'bg-stone-100',
        cardBorder: 'border-stone-200',
        cardShadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.1)]',
        cardHeadingColor: 'text-stone-700',
        cardTextColor: 'text-stone-600',
        buttonClass:
          'bg-stone-800 hover:bg-stone-700 text-gray-100 cursor-pointer hover:scale-105',
      };
    }
  };

  const colors = mounted
    ? getColors()
    : {
        titleGradient: '',
        textColor: '',
        headingColor: '',
        paragraphColor: '',
        cardBg: '',
        cardBorder: '',
        cardShadow: '',
        cardHeadingColor: '',
        cardTextColor: '',
        buttonClass: '',
      };

  // handle "start exploring" button click
  const handleExploreClick = async () => {
    try {
      // check if user is logged in
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // user is logged in, redirect to chat page
        router.push('/chat');
      } else {
        // user is not logged in, redirect to login page
        router.push('/login');
      }
    } catch (error) {
      console.error('check login status failed:', error);
      // if error, redirect to login page
      router.push('/login');
    }
  };

  // Show loading state while mounting or dynamic translations load
  if (!mounted || isLoading) {
    return <PageLoader />;
  }

  // Create translation data object for the dynamic renderer
  const translationData: AboutTranslationData = {
    // Try to get dynamic sections first
    sections: dynamicT('sections', 'pages.about') || undefined,

    // Fallback to legacy format for backward compatibility
    title: t('title'),
    subtitle: t('subtitle'),
    mission: {
      description: t('mission.description'),
    },
    values: {
      items: staticT.raw('values.items') as Array<{
        title: string;
        description: string;
      }>,
    },
    buttonText: t('buttonText'),
    copyright: {
      prefix: t('copyright.prefix', { year: new Date().getFullYear() }),
      linkText: t('copyright.linkText'),
      suffix: t('copyright.suffix'),
    },
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <DynamicAboutRenderer
        translationData={translationData}
        colors={colors}
        onButtonClick={handleExploreClick}
      />
    </main>
  );
}
