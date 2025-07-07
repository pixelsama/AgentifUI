/**
 * Dynamic Translation Hook
 * @description Provides real-time translation loading with intelligent caching for admin-managed content
 * @module lib/hooks/use-dynamic-translations
 */
import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

/**
 * Cache entry for translation data
 * @description Contains translation data with timestamp for TTL validation
 */
interface CacheEntry {
  /** Translation data object */
  data: any;
  /** Cache creation timestamp in milliseconds */
  timestamp: number;
}

/**
 * Dynamic translation hook configuration
 * @description Defines which sections to load dynamically and cache settings
 */
interface UseDynamicTranslationsConfig {
  /** Translation sections to load (e.g., ['pages.about', 'pages.home']) */
  sections: string[];
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
}

// In-memory cache for translation data to avoid redundant API calls
const translationCache = new Map<string, CacheEntry>();

/**
 * Clear translation cache for specific locale or all locales
 * @description Used by admin interface to force refresh after translation updates
 *
 * @param locale - Specific locale to clear, or undefined to clear all
 */
export function clearTranslationCache(locale?: string): void {
  if (locale) {
    // Clear specific locale entries
    for (const key of translationCache.keys()) {
      if (key.startsWith(`${locale}_`)) {
        translationCache.delete(key);
      }
    }
  } else {
    // Clear all cache entries
    translationCache.clear();
  }
}

/**
 * Hook for loading dynamic translations with caching
 * @description Loads real-time translations from API with fallback to static translations
 *
 * @param config - Configuration object specifying sections and cache settings
 * @returns Object containing translation function and loading state
 */
export function useDynamicTranslations(config: UseDynamicTranslationsConfig) {
  const { sections, cacheTTL = 5 * 60 * 1000 } = config;
  const [dynamicData, setDynamicData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const staticT = useTranslations(); // Fallback to static translations

  // Load dynamic translations with caching
  useEffect(() => {
    let isCurrent = true;

    const loadDynamicTranslations = async () => {
      try {
        const locale = document.documentElement.lang || 'en-US';
        const cacheKey = `${locale}_${sections.join(',')}`;

        // Check memory cache first for fastest response
        const cached = translationCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTTL) {
          if (isCurrent) {
            setDynamicData(cached.data);
            setIsLoading(false);
          }
          return;
        }

        // Fetch fresh data from API
        const response = await fetch(
          `/api/translations/dynamic/${locale}?sections=${sections.join(',')}`
        );

        if (response.ok) {
          const data = await response.json();

          // Update cache with fresh data
          translationCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });

          if (isCurrent) {
            setDynamicData(data);
            setIsLoading(false);
          }
        } else {
          // API failed, use static translations as fallback
          console.warn('Dynamic translation API failed, using static fallback');
          if (isCurrent) {
            setDynamicData(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to load dynamic translations:', error);
        if (isCurrent) {
          setDynamicData(null);
          setIsLoading(false);
        }
      }
    };

    loadDynamicTranslations();

    // Cleanup flag to prevent state updates on unmounted component
    return () => {
      isCurrent = false;
    };
  }, [sections.join(','), cacheTTL]);

  /**
   * Translation function with dynamic/static fallback
   * @description Returns dynamic translation if available, otherwise falls back to static
   *
   * @param key - Translation key (e.g., 'title', 'subtitle')
   * @param section - Section prefix (e.g., 'pages.about')
   * @param params - Optional parameters for translation interpolation
   * @returns Translated string
   */
  const t = useCallback(
    (key: string, section: string, params?: any) => {
      // Try dynamic translation first
      if (dynamicData) {
        const dynamicValue = getNestedValue(dynamicData, `${section}.${key}`);
        if (dynamicValue) {
          // Handle parameter substitution for dynamic translations
          if (params && typeof dynamicValue === 'string') {
            return interpolateString(dynamicValue, params);
          }
          return dynamicValue;
        }
      }

      // Fallback to static translation with parameters
      return staticT(`${section}.${key}`, params);
    },
    [dynamicData, staticT]
  );

  return { t, isLoading };
}

/**
 * Extract nested value from object using dot notation
 * @description Safely navigates object structure to retrieve nested values
 *
 * @param obj - Source object
 * @param path - Dot-separated path (e.g., 'pages.about.title')
 * @returns Value at path or undefined if not found
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Interpolate parameters into a string template
 * @description Replaces {param} placeholders with actual values
 *
 * @param template - String template with {param} placeholders
 * @param params - Object containing parameter values
 * @returns Interpolated string
 */
function interpolateString(
  template: string,
  params: Record<string, any>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}
