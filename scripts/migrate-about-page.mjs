#!/usr/bin/env node

/**
 * Data migration script for About Page dynamic component system
 * 
 * This script migrates the existing fixed structure about page translations
 * to the new dynamic component structure while maintaining backward compatibility.
 * 
 * Usage:
 *   node scripts/migrate-about-page.mjs [--dry-run] [--locale=en-US]
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const noBackup = args.includes('--no-backup');
const targetLocale = args.find(arg => arg.startsWith('--locale='))?.split('=')[1];

// Configuration
const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const BACKUP_DIR = path.join(process.cwd(), 'backups', 'about-page-migration');
const SUPPORTED_LOCALES = [
  'en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'de-DE', 
  'fr-FR', 'ru-RU', 'it-IT', 'pt-PT', 'es-ES'
];

/**
 * Generate unique ID with timestamp and random string
 */
function generateUniqueId(prefix = 'comp') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create default component instance
 */
function createDefaultComponent(type, content = '') {
  const id = generateUniqueId('comp');
  
  const defaultProps = {
    heading: {
      content: content || 'New Heading',
      level: 2,
      textAlign: 'left',
    },
    paragraph: {
      content: content || 'New paragraph text',
      textAlign: 'left',
    },
    button: {
      text: content || 'New Button',
      variant: 'primary',
      action: 'link',
      url: '#',
    },
    cards: {
      layout: 'grid',
      items: [],
    },
    image: {
      src: '',
      alt: content || 'Image',
      alignment: 'center',
      width: 'auto',
      height: 'auto',
    },
    divider: {
      style: 'solid',
      color: 'gray',
      thickness: 'medium',
    },
  };

  return {
    id,
    type,
    props: defaultProps[type] || {},
  };
}

/**
 * Migrate legacy structure to dynamic sections
 */
function migrateLegacyToSections(legacy) {
  const sections = [];

  // Title and subtitle section
  if (legacy.title || legacy.subtitle) {
    const titleComponents = [];

    if (legacy.title) {
      const titleComp = createDefaultComponent('heading', legacy.title);
      titleComp.props.level = 1;
      titleComp.props.textAlign = 'center';
      titleComponents.push(titleComp);
    }

    if (legacy.subtitle) {
      const subtitleComp = createDefaultComponent('paragraph', legacy.subtitle);
      subtitleComp.props.textAlign = 'center';
      titleComponents.push(subtitleComp);
    }

    if (titleComponents.length > 0) {
      sections.push({
        id: generateUniqueId('section'),
        layout: 'single-column',
        columns: [titleComponents],
      });
    }
  }

  // Mission section
  if (legacy.mission?.description) {
    const missionTitle = legacy.mission.title || 'Our Mission';
    sections.push({
      id: generateUniqueId('section'),
      layout: 'single-column',
      columns: [
        [
          createDefaultComponent('heading', missionTitle),
          createDefaultComponent('paragraph', legacy.mission.description),
        ],
      ],
    });
  }

  // Values section
  if (legacy.values?.items && legacy.values.items.length > 0) {
    const valuesTitle = legacy.values.title || 'Our Values';
    const valuesSection = {
      id: generateUniqueId('section'),
      layout: 'single-column',
      columns: [[createDefaultComponent('heading', valuesTitle)]],
    };

    // Add cards component
    const cardsComponent = createDefaultComponent('cards');
    cardsComponent.props = {
      layout: 'grid',
      items: legacy.values.items,
    };

    valuesSection.columns[0].push(cardsComponent);
    sections.push(valuesSection);
  }

  // Button section
  if (legacy.buttonText) {
    const buttonComponent = createDefaultComponent('button', legacy.buttonText);
    buttonComponent.props.textAlign = 'center';
    sections.push({
      id: generateUniqueId('section'),
      layout: 'single-column',
      columns: [[buttonComponent]],
    });
  }

  // Copyright section
  if (legacy.copyright) {
    const copyrightText = [
      legacy.copyright.prefix?.replace('{year}', new Date().getFullYear().toString()) || '',
      legacy.copyright.linkText || '',
      legacy.copyright.suffix || '',
    ].join('');

    if (copyrightText.trim()) {
      const copyrightComponent = createDefaultComponent('paragraph', copyrightText);
      copyrightComponent.props.textAlign = 'center';

      sections.push({
        id: generateUniqueId('section'),
        layout: 'single-column',
        columns: [[copyrightComponent]],
      });
    }
  }

  return {
    sections,
    metadata: {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      author: 'system-migration',
    },
  };
}

/**
 * Validate migrated data
 */
function validateMigratedData(data) {
  const errors = [];

  if (!data.sections || data.sections.length === 0) {
    errors.push('Migration failed: no sections created');
  }

  data.sections?.forEach((section, index) => {
    if (!section.id) {
      errors.push(`Section ${index} missing ID`);
    }
    if (!section.layout) {
      errors.push(`Section ${index} missing layout`);
    }
    if (!section.columns || !Array.isArray(section.columns)) {
      errors.push(`Section ${index} missing or invalid columns`);
    }

    section.columns?.forEach((column, columnIndex) => {
      if (!Array.isArray(column)) {
        errors.push(`Section ${index}, Column ${columnIndex} is not an array`);
        return;
      }

      column.forEach((component, componentIndex) => {
        if (!component.id) {
          errors.push(`Section ${index}, Column ${columnIndex}, Component ${componentIndex} missing ID`);
        }
        if (!component.type) {
          errors.push(`Section ${index}, Column ${columnIndex}, Component ${componentIndex} missing type`);
        }
        if (!component.props) {
          errors.push(`Section ${index}, Column ${columnIndex}, Component ${componentIndex} missing props`);
        }
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Load translation file for a specific locale
 */
async function loadTranslationFile(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  
  if (!existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }

  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Save translation file for a specific locale
 */
async function saveTranslationFile(locale, data) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const formattedContent = JSON.stringify(data, null, 2);
  
  if (!isDryRun) {
    await fs.writeFile(filePath, formattedContent, 'utf8');
  }
  
  console.log(`📝 ${isDryRun ? '[DRY RUN] Would save' : 'Saved'}: ${filePath}`);
}

/**
 * Create backup of original translation files
 */
async function createBackups(locales) {
  if (noBackup) {
    console.log('⚠️  Backup skipped (--no-backup flag)');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, timestamp);
  
  await fs.mkdir(backupPath, { recursive: true });
  
  for (const locale of locales) {
    try {
      const data = await loadTranslationFile(locale);
      const backupFilePath = path.join(backupPath, `${locale}.json`);
      
      const backupData = {
        data: JSON.parse(JSON.stringify(data.pages?.about || {})),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
      
      if (!isDryRun) {
        await fs.writeFile(backupFilePath, JSON.stringify({
          originalFile: `${locale}.json`,
          migrationTimestamp: new Date().toISOString(),
          ...backupData
        }, null, 2), 'utf8');
      }
      
      console.log(`💾 ${isDryRun ? '[DRY RUN] Would backup' : 'Backed up'}: ${locale} -> ${backupFilePath}`);
    } catch (error) {
      console.error(`❌ Failed to backup ${locale}:`, error);
    }
  }
}

/**
 * Check if about page data is already in dynamic format
 */
function isAlreadyDynamicFormat(aboutData) {
  return aboutData && 
         Array.isArray(aboutData.sections) && 
         aboutData.sections.length > 0 &&
         aboutData.sections[0].id &&
         aboutData.sections[0].layout &&
         Array.isArray(aboutData.sections[0].columns);
}

/**
 * Extract legacy about data from translation object
 */
function extractLegacyAboutData(translationData) {
  const aboutData = translationData?.pages?.about;
  
  if (!aboutData) {
    return null;
  }

  // If already dynamic format, return null
  if (isAlreadyDynamicFormat(aboutData)) {
    return null;
  }

  return {
    title: aboutData.title || '',
    subtitle: aboutData.subtitle || '',
    mission: {
      title: aboutData.mission?.title || 'Our Mission',
      description: aboutData.mission?.description || ''
    },
    values: {
      title: aboutData.values?.title || 'Our Values',
      items: aboutData.values?.items || []
    },
    buttonText: aboutData.buttonText || '',
    copyright: aboutData.copyright || {
      prefix: '',
      linkText: '',
      suffix: ''
    }
  };
}

/**
 * Calculate migration statistics
 */
function calculateStats(legacy, migrated) {
  const sectionsCreated = migrated.sections?.length || 0;
  const componentsCreated = migrated.sections?.reduce((total, section) => {
    return total + section.columns.reduce((colTotal, column) => colTotal + column.length, 0);
  }, 0) || 0;
  
  const originalDataSize = JSON.stringify(legacy).length;
  const migratedDataSize = JSON.stringify(migrated).length;

  return {
    sectionsCreated,
    componentsCreated,
    originalDataSize,
    migratedDataSize
  };
}

/**
 * Migrate a single locale
 */
async function migrateLocale(locale) {
  const warnings = [];
  
  try {
    console.log(`\n🔄 Processing ${locale}...`);
    
    // Load translation data
    const translationData = await loadTranslationFile(locale);
    const legacyAboutData = extractLegacyAboutData(translationData);
    
    if (!legacyAboutData) {
      if (isAlreadyDynamicFormat(translationData?.pages?.about)) {
        console.log(`✅ ${locale} already uses dynamic format - skipping`);
        return {
          locale,
          success: true,
          warnings: ['Already in dynamic format'],
          stats: { sectionsCreated: 0, componentsCreated: 0, originalDataSize: 0, migratedDataSize: 0 }
        };
      }
      
      console.log(`⚠️  ${locale} has no about page data - skipping`);
      return {
        locale,
        success: true,
        warnings: ['No about page data found'],
        stats: { sectionsCreated: 0, componentsCreated: 0, originalDataSize: 0, migratedDataSize: 0 }
      };
    }

    // Validate legacy data
    if (!legacyAboutData.title && !legacyAboutData.subtitle) {
      warnings.push('Missing title and subtitle');
    }
    
    if (!legacyAboutData.mission?.description) {
      warnings.push('Missing mission description');
    }
    
    if (!legacyAboutData.values?.items?.length) {
      warnings.push('No value items found');
    }

    // Migrate to dynamic structure
    console.log(`🔧 Migrating ${locale} from legacy to dynamic format...`);
    const migratedData = migrateLegacyToSections(legacyAboutData);
    
    // Add metadata
    const aboutTranslationData = {
      sections: migratedData.sections,
      metadata: {
        ...migratedData.metadata,
        migrated: true,
      }
    };

    // Validate migrated data
    const validation = validateMigratedData(aboutTranslationData);
    if (!validation.isValid) {
      throw new Error(`Migration validation failed: ${validation.errors.join(', ')}`);
    }

    // Calculate statistics
    const stats = calculateStats(legacyAboutData, aboutTranslationData);

    // Update translation data structure
    const updatedTranslationData = {
      ...translationData,
      pages: {
        ...translationData.pages,
        about: aboutTranslationData
      }
    };

    // Save migrated data
    await saveTranslationFile(locale, updatedTranslationData);
    
    console.log(`✅ ${locale} migration completed:`);
    console.log(`   📊 Sections created: ${stats.sectionsCreated}`);
    console.log(`   🧩 Components created: ${stats.componentsCreated}`);
    console.log(`   📏 Data size: ${stats.originalDataSize}B → ${stats.migratedDataSize}B`);
    
    if (warnings.length > 0) {
      console.log(`   ⚠️  Warnings: ${warnings.join(', ')}`);
    }

    return {
      locale,
      success: true,
      warnings,
      stats
    };

  } catch (error) {
    console.error(`❌ Failed to migrate ${locale}:`, error);
    return {
      locale,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      warnings,
      stats: { sectionsCreated: 0, componentsCreated: 0, originalDataSize: 0, migratedDataSize: 0 }
    };
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting About Page Dynamic Component Migration');
  console.log('=================================================');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  }
  
  if (targetLocale && !SUPPORTED_LOCALES.includes(targetLocale)) {
    console.error(`❌ Unsupported locale: ${targetLocale}`);
    console.log(`Supported locales: ${SUPPORTED_LOCALES.join(', ')}`);
    process.exit(1);
  }

  const localeList = targetLocale ? [targetLocale] : SUPPORTED_LOCALES;
  console.log(`📋 Target locales: ${localeList.join(', ')}`);

  try {
    // Create backups
    console.log('\n📦 Creating backups...');
    await createBackups(localeList);

    // Run migrations
    console.log('\n🔄 Running migrations...');
    const results = [];
    
    for (const locale of localeList) {
      const result = await migrateLocale(locale);
      results.push(result);
    }

    // Summary report
    console.log('\n📊 Migration Summary');
    console.log('===================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
      const totalSections = successful.reduce((sum, r) => sum + r.stats.sectionsCreated, 0);
      const totalComponents = successful.reduce((sum, r) => sum + r.stats.componentsCreated, 0);
      
      console.log(`📊 Total sections created: ${totalSections}`);
      console.log(`🧩 Total components created: ${totalComponents}`);
    }

    // List failures
    if (failed.length > 0) {
      console.log('\n❌ Failed migrations:');
      failed.forEach(result => {
        console.log(`   ${result.locale}: ${result.error}`);
      });
    }

    // List warnings
    const withWarnings = results.filter(r => r.warnings.length > 0);
    if (withWarnings.length > 0) {
      console.log('\n⚠️  Migrations with warnings:');
      withWarnings.forEach(result => {
        console.log(`   ${result.locale}: ${result.warnings.join(', ')}`);
      });
    }

    if (isDryRun) {
      console.log('\n🔍 Dry run completed - no files were modified');
      console.log('Run without --dry-run to apply changes');
    } else {
      console.log('\n🎉 Migration completed successfully!');
      console.log('   📁 Backup files saved to:', BACKUP_DIR);
      console.log('   🔄 Please restart your development server');
      console.log('   ✅ Run type checking: pnpm type-check');
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});