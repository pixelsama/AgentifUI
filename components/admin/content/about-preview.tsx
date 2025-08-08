'use client';

import {
  AboutTranslationData,
  PageContent,
  isDynamicFormat,
  migrateAboutTranslationData,
} from '@lib/types/about-page-components';
import { cn } from '@lib/utils';

import React from 'react';

import ComponentRenderer from './component-renderer';

interface AboutPreviewProps {
  /**
   * Translation data for the about page
   * Can be either legacy or dynamic format
   */
  translation: AboutTranslationData;
  /**
   * Preview device type for responsive preview
   */
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

/**
 * About Page Preview Component
 *
 * Displays a preview of the about page with responsive device frames
 * Supports both legacy and dynamic component formats
 */
export function AboutPreview({
  translation,
  previewDevice,
}: AboutPreviewProps) {
  // Ensure translation is in dynamic format
  const dynamicTranslation = React.useMemo(() => {
    if (!isDynamicFormat(translation)) {
      return migrateAboutTranslationData(translation);
    }
    return translation;
  }, [translation]);

  // Create page content from translation
  const pageContent: PageContent = React.useMemo(() => {
    return {
      sections: dynamicTranslation.sections || [],
      metadata: dynamicTranslation.metadata || {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        author: 'preview',
      },
    };
  }, [dynamicTranslation]);

  /**
   * Get device-specific container styles
   */
  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return {
          container: 'mx-auto bg-black rounded-[2rem] p-2 shadow-2xl',
          screen:
            'w-[375px] h-[667px] bg-white dark:bg-gray-900 rounded-[1.75rem] overflow-hidden relative',
          content: 'h-full overflow-y-auto',
          mainClass: 'min-h-full w-full py-4 px-4',
          innerContainer: 'w-full',
          maxWidth: 'max-w-none',
        };
      case 'tablet':
        return {
          container: 'mx-auto bg-black rounded-xl p-3 shadow-2xl',
          screen:
            'w-[768px] h-[1024px] bg-white dark:bg-gray-900 rounded-lg overflow-hidden relative',
          content: 'h-full overflow-y-auto',
          mainClass: 'min-h-full w-full py-6 px-6',
          innerContainer: 'max-w-2xl mx-auto',
          maxWidth: 'max-w-2xl',
        };
      case 'desktop':
      default:
        return {
          container: 'w-full h-full',
          screen: 'w-full h-full overflow-hidden relative bg-background',
          content: 'h-full overflow-y-auto',
          mainClass:
            'min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden',
          innerContainer: 'max-w-5xl mx-auto',
          maxWidth: 'max-w-5xl',
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  /**
   * Render page sections with responsive layout
   */
  const renderSections = () => {
    if (!pageContent.sections || pageContent.sections.length === 0) {
      return (
        <div className="text-muted-foreground flex h-64 items-center justify-center">
          <p>No content to preview</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 md:space-y-12">
        {pageContent.sections.map(section => (
          <section key={section.id} className="w-full">
            <div
              className={cn(
                'grid gap-4 md:gap-6',
                section.layout === 'single-column' && 'grid-cols-1',
                section.layout === 'two-column' && 'grid-cols-1 md:grid-cols-2',
                section.layout === 'three-column' &&
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}
            >
              {section.columns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-4">
                  {column.map(component => (
                    <div key={component.id}>
                      <ComponentRenderer component={component} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center',
        previewDevice !== 'desktop' && 'p-4'
      )}
    >
      <div className={deviceStyles.container}>
        <div className={deviceStyles.screen}>
          <div className={deviceStyles.content}>
            <main className={deviceStyles.mainClass}>
              <div className={deviceStyles.innerContainer}>
                {renderSections()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Legacy interface for backward compatibility
 * This is for existing components that still use the old preview format
 */
export interface ValueCard {
  id: string;
  title: string;
  description: string;
}

export interface AboutPageConfig {
  title: string;
  subtitle: string;
  mission: string;
  valueCards: ValueCard[];
  buttonText: string;
  copyrightText: string;
}

/**
 * Legacy preview component for backward compatibility
 * @deprecated Use AboutPreview with dynamic translation data instead
 */
export function LegacyAboutPreview({
  config,
  previewDevice,
}: {
  config: AboutPageConfig;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}) {
  // Convert legacy config to new format
  const legacyTranslation: AboutTranslationData = {
    title: config.title,
    subtitle: config.subtitle,
    mission: { description: config.mission },
    values: {
      items: config.valueCards.map(card => ({
        title: card.title,
        description: card.description,
      })),
    },
    buttonText: config.buttonText,
    copyright: {
      prefix: config.copyrightText,
      linkText: '',
      suffix: '',
    },
  };

  return (
    <AboutPreview
      translation={legacyTranslation}
      previewDevice={previewDevice}
    />
  );
}
