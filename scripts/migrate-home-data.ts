import fs from 'fs';
import path from 'path';

import {
  isHomeDynamicFormat,
  migrateHomeTranslationData,
} from '../lib/utils/data-migration';

/**
 * 批量迁移脚本 - 将所有语言文件中的主页数据从静态格式转换为动态sections格式
 */

const MESSAGES_DIR = path.join(__dirname, '../messages');
const supportedLocales = [
  'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'de-DE',
  'fr-FR',
  'ru-RU',
  'it-IT',
  'pt-PT',
  'es-ES',
];

interface MessageFile {
  pages: {
    home: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

async function migrateAllHomeData() {
  console.log('🚀 开始迁移主页数据...');

  for (const locale of supportedLocales) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  文件不存在: ${filePath}`);
      continue;
    }

    try {
      console.log(`📝 处理语言文件: ${locale}.json`);

      // 读取文件
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data: MessageFile = JSON.parse(fileContent);

      // 检查是否有主页数据
      if (!data.pages?.home) {
        console.warn(`⚠️  ${locale}.json 中没有找到主页数据`);
        continue;
      }

      // 检查是否已经是动态格式
      if (isHomeDynamicFormat(data.pages.home)) {
        console.log(`✅ ${locale}.json 主页数据已经是动态格式，跳过`);
        continue;
      }

      console.log(`🔄 转换 ${locale}.json 中的主页数据...`);

      // 转换主页数据
      const migratedHomeData = migrateHomeTranslationData(data.pages.home);

      // 更新数据
      data.pages.home = migratedHomeData;

      // 备份原文件
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 已备份原文件到: ${path.basename(backupPath)}`);

      // 保存新文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ 已更新 ${locale}.json`);
    } catch (error) {
      console.error(`❌ 处理 ${locale}.json 时出错:`, error);
    }
  }

  console.log('🎉 主页数据迁移完成!');
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateAllHomeData().catch(console.error);
}

export { migrateAllHomeData };
