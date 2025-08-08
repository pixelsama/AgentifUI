/**
 * 一次性数据迁移脚本
 *
 * 将现有的固定结构关于页面数据迁移为动态组件结构
 *
 * 使用方式：
 * 1. 开发环境: npm run migrate:about-data
 * 2. 代码中调用: import { runMigration } from '@/lib/scripts/migrate-about-data'
 */
import {
  AboutTranslationData,
  batchMigrateTranslations,
  createBackupData,
  validateMigratedData,
} from '@lib/utils/data-migration';
import fs from 'fs/promises';
import path from 'path';

// 配置文件路径
const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const BACKUP_DIR = path.join(process.cwd(), 'backup', 'translations');

// 支持的语言列表
const SUPPORTED_LOCALES = [
  'en-US',
  'zh-CN',
  'es-ES',
  'zh-TW',
  'ja-JP',
  'de-DE',
  'fr-FR',
  'ru-RU',
  'it-IT',
  'pt-PT',
];

// 日志工具
const logger = {
  info: (message: string) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  warn: (message: string) =>
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
  error: (message: string) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
  success: (message: string) =>
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`),
};

// 确保目录存在
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// 读取消息文件
async function readMessageFile(
  locale: string
): Promise<Record<string, unknown> | null> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logger.warn(`Failed to read message file for ${locale}: ${error}`);
    return null;
  }
}

// 写入消息文件
async function writeMessageFile(
  locale: string,
  data: Record<string, unknown>
): Promise<void> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write message file for ${locale}: ${error}`);
  }
}

// 创建备份
async function createBackup(
  locale: string,
  data: Record<string, unknown>
): Promise<void> {
  await ensureDir(BACKUP_DIR);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${locale}-${timestamp}.json`);

  const pages = data as { pages?: { about?: AboutTranslationData } };
  const backupData = createBackupData(pages.pages?.about || {});

  try {
    await fs.writeFile(
      backupPath,
      JSON.stringify(backupData, null, 2),
      'utf-8'
    );
    logger.info(`Created backup for ${locale}: ${backupPath}`);
  } catch (error) {
    throw new Error(`Failed to create backup for ${locale}: ${error}`);
  }
}

// 检查是否需要迁移
function needsMigration(aboutData: AboutTranslationData): boolean {
  // 如果已经有sections，说明已经迁移过了
  if (aboutData.sections && aboutData.sections.length > 0) {
    return false;
  }

  // 如果有旧的固定结构数据，需要迁移
  return Boolean(
    aboutData.title ||
      aboutData.subtitle ||
      aboutData.mission ||
      aboutData.values ||
      aboutData.buttonText
  );
}

// 迁移单个语言的数据
async function migrateLocaleData(locale: string): Promise<{
  success: boolean;
  skipped?: boolean;
  error?: string;
}> {
  try {
    logger.info(`Starting migration for ${locale}`);

    // 读取现有数据
    const messageData = await readMessageFile(locale);
    if (!messageData) {
      return { success: false, error: 'Failed to read message file' };
    }

    // 检查是否有关于页面数据
    const msgPages = messageData as {
      pages?: { about?: AboutTranslationData };
    };
    const aboutData = msgPages.pages?.about;
    if (!aboutData) {
      logger.warn(`No about page data found for ${locale}`);
      return { success: true, skipped: true };
    }

    // 检查是否需要迁移
    if (!needsMigration(aboutData)) {
      logger.info(`${locale} already migrated, skipping`);
      return { success: true, skipped: true };
    }

    // 创建备份
    await createBackup(locale, messageData);

    // 执行迁移
    const migratedData = batchMigrateTranslations({ [locale]: aboutData });
    const newAboutData = migratedData[locale];

    // 验证迁移后的数据
    const validation = validateMigratedData(newAboutData);
    if (!validation.isValid) {
      logger.error(`Migration validation failed for ${locale}:`);
      validation.errors.forEach((error: string) =>
        logger.error(`  - ${error}`)
      );
      return { success: false, error: 'Migration validation failed' };
    }

    // 更新消息数据
    if (!msgPages.pages) msgPages.pages = {};
    msgPages.pages.about = newAboutData;

    // 写入新数据
    await writeMessageFile(locale, messageData);

    logger.success(`Successfully migrated ${locale}`);
    return { success: true };
  } catch (error) {
    logger.error(`Migration failed for ${locale}: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 主迁移函数
export async function runMigration(
  options: {
    dryRun?: boolean;
    locales?: string[];
  } = {}
): Promise<{
  success: boolean;
  results: Record<
    string,
    { success: boolean; skipped?: boolean; error?: string }
  >;
  summary: {
    total: number;
    migrated: number;
    skipped: number;
    failed: number;
  };
}> {
  const { dryRun = false, locales = SUPPORTED_LOCALES } = options;

  logger.info(
    `Starting about page data migration${dryRun ? ' (DRY RUN)' : ''}`
  );
  logger.info(`Target locales: ${locales.join(', ')}`);

  const results: Record<
    string,
    { success: boolean; skipped?: boolean; error?: string }
  > = {};
  const summary = {
    total: locales.length,
    migrated: 0,
    skipped: 0,
    failed: 0,
  };

  for (const locale of locales) {
    if (dryRun) {
      // 在干运行模式下，只检查是否需要迁移
      const messageData = await readMessageFile(locale);
      const pages = messageData as {
        pages?: { about?: AboutTranslationData };
      } | null;
      const aboutData = pages?.pages?.about;

      if (!aboutData) {
        results[locale] = { success: true, skipped: true };
        summary.skipped++;
      } else if (needsMigration(aboutData)) {
        logger.info(`${locale} needs migration`);
        results[locale] = { success: true };
        summary.migrated++;
      } else {
        logger.info(`${locale} already migrated`);
        results[locale] = { success: true, skipped: true };
        summary.skipped++;
      }
    } else {
      // 执行实际迁移
      const result = await migrateLocaleData(locale);
      results[locale] = result;

      if (result.success) {
        if (result.skipped) {
          summary.skipped++;
        } else {
          summary.migrated++;
        }
      } else {
        summary.failed++;
      }
    }
  }

  // 打印总结
  logger.info('Migration Summary:');
  logger.info(`  Total locales: ${summary.total}`);
  logger.info(`  Migrated: ${summary.migrated}`);
  logger.info(`  Skipped: ${summary.skipped}`);
  logger.info(`  Failed: ${summary.failed}`);

  const overallSuccess = summary.failed === 0;

  if (overallSuccess) {
    logger.success('Migration completed successfully!');
  } else {
    logger.error('Migration completed with errors!');
  }

  return {
    success: overallSuccess,
    results,
    summary,
  };
}

// CLI 执行入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const localesArg = args.find(arg => arg.startsWith('--locales='));
  const locales = localesArg
    ? localesArg.split('=')[1].split(',')
    : SUPPORTED_LOCALES;

  runMigration({ dryRun, locales })
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Migration script failed: ${error}`);
      process.exit(1);
    });
}
