import {
  getSupportedLocales,
  isValidLocale,
} from '@lib/config/language-config';
import { promises as fs } from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

// translation file path configuration
const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const LOCK_TIMEOUT = 5000; // 5 seconds lock timeout

// file lock management
const fileLocks = new Map<string, { timestamp: number; processId: string }>();

// get file lock
async function acquireLock(filePath: string): Promise<void> {
  const lockKey = path.basename(filePath);
  const now = Date.now();
  const processId = `${process.pid}-${now}`;

  // check existing lock
  const existingLock = fileLocks.get(lockKey);
  if (existingLock) {
    // check if lock is expired
    if (now - existingLock.timestamp < LOCK_TIMEOUT) {
      throw new Error(`File ${lockKey} is locked by another process`);
    }
    // clear expired lock
    fileLocks.delete(lockKey);
  }

  // get new lock
  fileLocks.set(lockKey, { timestamp: now, processId });
}

// release file lock
function releaseLock(filePath: string): void {
  const lockKey = path.basename(filePath);
  fileLocks.delete(lockKey);
}

// read translation file
async function readTranslationFile(locale: string): Promise<any> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to read translation file for locale ${locale}: ${error}`
    );
  }
}

// write translation file (with atomicity guarantee)
async function writeTranslationFile(locale: string, data: any): Promise<void> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const tempPath = `${filePath}.tmp`;

  try {
    // get file lock
    await acquireLock(filePath);

    // Write to temporary file without adding newline - let prettier handle formatting
    const fileContent = JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, fileContent, 'utf-8');

    // atomic rename
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // clean up temporary file
    try {
      await fs.unlink(tempPath);
    } catch {}

    throw new Error(
      `Failed to write translation file for locale ${locale}: ${error}`
    );
  } finally {
    // release file lock
    releaseLock(filePath);
  }
}

// deep merge objects
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

// get nested object value by path
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// set nested object value by path
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// GET: read translation content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const section = searchParams.get('section');

    // validate language code
    if (locale && !isValidLocale(locale)) {
      return NextResponse.json(
        { error: `Unsupported locale: ${locale}` },
        { status: 400 }
      );
    }

    // if specified language, return the translation
    if (locale) {
      const translations = await readTranslationFile(locale);

      if (section) {
        const sectionData = getNestedValue(translations, section);
        if (sectionData === undefined) {
          return NextResponse.json(
            { error: `Section '${section}' not found in locale '${locale}'` },
            { status: 404 }
          );
        }
        return NextResponse.json({ locale, section, data: sectionData });
      }

      return NextResponse.json({ locale, data: translations });
    }

    // otherwise return all supported languages and metadata
    const supportedLocales = getSupportedLocales();
    const result = {
      supportedLocales,
      availableLanguages: supportedLocales.length,
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to read translations:', error);
    return NextResponse.json(
      { error: 'Failed to read translations' },
      { status: 500 }
    );
  }
}

// PUT: update translation content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale, section, updates, mode = 'merge' } = body;

    // validate required parameters
    if (!locale || !updates) {
      return NextResponse.json(
        { error: 'Missing required parameters: locale, updates' },
        { status: 400 }
      );
    }

    // validate language code
    if (!isValidLocale(locale)) {
      return NextResponse.json(
        { error: `Unsupported locale: ${locale}` },
        { status: 400 }
      );
    }

    // read existing translation file
    const currentTranslations = await readTranslationFile(locale);

    let updatedTranslations;

    if (section) {
      // update specific section
      updatedTranslations = { ...currentTranslations };

      if (mode === 'replace') {
        setNestedValue(updatedTranslations, section, updates);
      } else {
        // default merge mode
        const currentSection =
          getNestedValue(currentTranslations, section) || {};
        const mergedSection = deepMerge(currentSection, updates);
        setNestedValue(updatedTranslations, section, mergedSection);
      }
    } else {
      // update entire file
      if (mode === 'replace') {
        updatedTranslations = updates;
      } else {
        updatedTranslations = deepMerge(currentTranslations, updates);
      }
    }

    // write updated translation file
    await writeTranslationFile(locale, updatedTranslations);

    const result = {
      success: true,
      locale,
      section: section || 'root',
      mode,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update translations:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update translations',
      },
      { status: 500 }
    );
  }
}

// POST: batch update multiple language translations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, updates, mode = 'merge' } = body;

    // validate required parameters
    if (!section || !updates || typeof updates !== 'object') {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: section, updates (object with locale keys)',
        },
        { status: 400 }
      );
    }

    const supportedLocales = getSupportedLocales();
    const results: any[] = [];
    const errors: any[] = [];

    // batch update all languages
    for (const locale of supportedLocales) {
      try {
        if (updates[locale]) {
          // read existing translation
          const currentTranslations = await readTranslationFile(locale);
          const updatedTranslations = { ...currentTranslations };

          if (mode === 'replace') {
            setNestedValue(updatedTranslations, section, updates[locale]);
          } else {
            const currentSection =
              getNestedValue(currentTranslations, section) || {};
            const mergedSection = deepMerge(currentSection, updates[locale]);
            setNestedValue(updatedTranslations, section, mergedSection);
          }

          // write updated translation
          await writeTranslationFile(locale, updatedTranslations);

          results.push({
            locale,
            success: true,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        errors.push({
          locale,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const response = {
      success: errors.length === 0,
      section,
      mode,
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length,
    };

    return NextResponse.json(response, {
      status: errors.length > 0 ? 207 : 200, // 207 Multi-Status for partial success (partial success)
    });
  } catch (error) {
    console.error('Failed to batch update translations:', error);
    return NextResponse.json(
      { error: 'Failed to batch update translations' },
      { status: 500 }
    );
  }
}
