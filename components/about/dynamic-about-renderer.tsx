'use client';

import { Button } from '@components/ui/button';
import { createClient } from '@lib/supabase/client';
import type {
  AboutTranslationData,
  ComponentInstance,
  PageContent,
  PageSection,
} from '@lib/types/about-page-components';
import {
  isDynamicFormat,
  migrateAboutTranslationData,
} from '@lib/types/about-page-components';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';

import React, { lazy, memo, useMemo, Suspense } from 'react';

import { useRouter } from 'next/navigation';

interface DynamicAboutRendererProps {
  /**
   * Translation data for the about page (legacy or dynamic format)
   */
  translationData: AboutTranslationData;
  /**
   * Theme colors object
   */
  colors: {
    titleGradient: string;
    textColor: string;
    headingColor: string;
    paragraphColor: string;
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    cardHeadingColor: string;
    cardTextColor: string;
    buttonClass: string;
  };
  /**
   * Handle button click action
   */
  onButtonClick?: (url?: string) => void;
}

/**
 * Dynamic About Page Renderer
 *
 * Renders about page content using dynamic component structure
 * Falls back to legacy structure if dynamic data is not available
 */
export function DynamicAboutRenderer({
  translationData,
  colors,
  onButtonClick,
}: DynamicAboutRendererProps) {
  const router = useRouter();

  // Ensure we have dynamic format data
  const dynamicData = React.useMemo(() => {
    if (!isDynamicFormat(translationData)) {
      return migrateAboutTranslationData(translationData);
    }
    return translationData;
  }, [translationData]);

  // Create page content from translation data
  const pageContent: PageContent = React.useMemo(() => {
    return {
      sections: dynamicData.sections || [],
      metadata: dynamicData.metadata || {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        author: 'frontend',
      },
    };
  }, [dynamicData]);

  /**
   * Handle button component clicks
   */
  const handleButtonClick = (component: ComponentInstance) => {
    const { action, url } = component.props;

    if (onButtonClick) {
      onButtonClick(url as string);
      return;
    }

    // Default button behavior based on action type
    if (action === 'external' && url) {
      window.open(url as string, '_blank', 'noopener,noreferrer');
    } else if (action === 'link' && url) {
      router.push(url as string);
    } else {
      // Default "Start Exploring" behavior - call the provided handler or navigate to chat
      handleExploreClick();
    }
  };

  // Default explore click handler
  const handleExploreClick = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/chat');
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('check login status failed:', error);
      router.push('/login');
    }
  };

  /**
   * Memoized component loader for better performance
   */
  const ComponentLoader = memo<{ component: ComponentInstance; index: number }>(
    ({ component, index }) => {
      return renderComponentInternal(component, index, colors);
    }
  );

  ComponentLoader.displayName = 'ComponentLoader';

  /**
   * Render individual component based on type
   */
  const renderComponentInternal = (component: ComponentInstance, index: number, colors: any) => {
    const { type, props } = component;

    const baseAnimation = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: index * 0.1 },
    };

    switch (type) {
      case 'heading':
        const level = (props.level as number) || 1;
        const HeadingTag = `h${level}` as
          | 'h1'
          | 'h2'
          | 'h3'
          | 'h4'
          | 'h5'
          | 'h6';
        const headingSize = {
          1: 'text-3xl sm:text-4xl md:text-5xl font-bold',
          2: 'text-xl sm:text-2xl font-bold',
          3: 'text-lg sm:text-xl font-semibold',
          4: 'text-base sm:text-lg font-semibold',
          5: 'text-sm sm:text-base font-medium',
          6: 'text-xs sm:text-sm font-medium',
        };

        return (
          <motion.div key={component.id} {...baseAnimation}>
            <HeadingTag
              className={cn(
                headingSize[level as keyof typeof headingSize] ||
                  headingSize[2],
                level === 1 &&
                  `bg-gradient-to-r bg-clip-text text-transparent ${colors.titleGradient}`,
                level > 1 && colors.headingColor,
                `text-${props.textAlign || 'left'}`,
                level === 1 ? 'mb-4 sm:mb-6' : 'mb-4'
              )}
            >
              {props.content as string}
            </HeadingTag>
          </motion.div>
        );

      case 'paragraph':
        return (
          <motion.p
            key={component.id}
            {...baseAnimation}
            className={cn(
              'text-sm leading-relaxed sm:text-base lg:text-lg',
              colors.paragraphColor,
              `text-${props.textAlign || 'left'}`
            )}
          >
            {props.content as string}
          </motion.p>
        );

      case 'cards':
        const items =
          (props.items as Array<{ title: string; description: string }>) || [];
        return (
          <motion.div
            key={component.id}
            {...baseAnimation}
            className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2"
          >
            {items.map((item, cardIndex) => (
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + cardIndex * 0.1 }}
                className={cn(
                  'rounded-xl border p-4 sm:p-6',
                  colors.cardBg,
                  colors.cardShadow,
                  colors.cardBorder
                )}
              >
                <h3
                  className={cn(
                    'mb-2 text-base font-semibold sm:text-lg',
                    colors.cardHeadingColor
                  )}
                >
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'text-sm leading-relaxed sm:text-base',
                    colors.cardTextColor
                  )}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'button':
        return (
          <motion.div
            key={component.id}
            {...baseAnimation}
            className={cn(
              props.textAlign === 'center' && 'text-center',
              props.textAlign === 'right' && 'text-right'
            )}
          >
            <Button
              size="lg"
              className={cn(
                'h-auto rounded-lg font-medium transition-all duration-200',
                'px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-base',
                colors.buttonClass
              )}
              onClick={() => handleButtonClick(component)}
            >
              {props.text as string}
            </Button>
          </motion.div>
        );

      case 'image':
        return (
          <motion.div
            key={component.id}
            {...baseAnimation}
            className={cn(
              'flex flex-col',
              props.alignment === 'center' && 'items-center',
              props.alignment === 'right' && 'items-end'
            )}
          >
            <img
              src={props.src as string}
              alt={props.alt as string}
              className="rounded-lg shadow-lg"
              style={{
                width:
                  props.width !== 'auto'
                    ? (props.width as string | number)
                    : undefined,
                height:
                  props.height !== 'auto'
                    ? (props.height as string | number)
                    : undefined,
              }}
            />
            {typeof props.caption === 'string' && props.caption && (
              <p className={cn('mt-2 text-sm', colors.paragraphColor)}>
                {props.caption}
              </p>
            )}
          </motion.div>
        );

      case 'divider':
        return (
          <motion.hr
            key={component.id}
            {...baseAnimation}
            className={cn(
              'my-6 border-0',
              props.thickness === 'thin' && 'h-px',
              props.thickness === 'medium' && 'h-0.5',
              props.thickness === 'thick' && 'h-1',
              props.style === 'dashed' && 'border-t border-dashed',
              props.style === 'dotted' && 'border-t border-dotted',
              props.color === 'gray' && 'bg-gray-300 dark:bg-gray-600',
              !props.color && 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        );

      default:
        return (
          <motion.div
            key={component.id}
            {...baseAnimation}
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            <p>Unknown component type: {type}</p>
          </motion.div>
        );
    }
  };

  /**
   * Render section with responsive layout
   */
  const renderSection = (section: PageSection, sectionIndex: number) => {
    return (
      <motion.section
        key={section.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
        className="mb-6 sm:mb-8 lg:mb-10"
      >
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
              {column.map((component, componentIndex) =>
                <ComponentLoader
                  key={component.id}
                  component={component}
                  index={sectionIndex + componentIndex}
                />
              )}
            </div>
          ))}
        </div>
      </motion.section>
    );
  };

  // Render all sections
  if (!pageContent.sections || pageContent.sections.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className={cn('text-lg', colors.textColor)}>No content available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {pageContent.sections.map((section, index) =>
        renderSection(section, index)
      )}
    </div>
  );
}
