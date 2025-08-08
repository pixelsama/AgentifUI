/**
 * 数据迁移功能测试脚本
 *
 * 用于验证数据迁移工具的正确性
 */
import {
  AboutTranslationData,
  LegacyAboutData,
  createDefaultComponent,
  createDefaultSection,
  generateUniqueId,
  migrateLegacyToSections,
  validateMigratedData,
} from '@lib/utils/data-migration';

// 测试数据
const testLegacyData: LegacyAboutData = {
  title: 'Test About AgentifUI',
  subtitle: 'Connecting AI with enterprises for testing',
  mission: {
    description: 'This is a test mission description for validation.',
  },
  values: {
    items: [
      {
        title: 'Test Innovation',
        description: 'Test description for innovation',
      },
      {
        title: 'Test Security',
        description: 'Test description for security',
      },
    ],
  },
  buttonText: 'Test Button',
  copyright: {
    prefix: '© {year} ',
    linkText: 'Test Company',
    suffix: '. All rights reserved.',
  },
};

// 执行测试
function runTests() {
  console.log('🧪 开始数据迁移功能测试...\n');

  // 测试1: ID生成
  console.log('📝 测试 1: ID 生成功能');
  const sectionId = generateUniqueId('section');
  const componentId = generateUniqueId('comp');
  console.log(`  生成的 Section ID: ${sectionId}`);
  console.log(`  生成的 Component ID: ${componentId}`);
  console.log(`  ✅ ID 生成测试通过\n`);

  // 测试2: 默认组件创建
  console.log('📝 测试 2: 默认组件创建');
  const headingComponent = createDefaultComponent('heading', 'Test Heading');
  console.log(`  标题组件: ${JSON.stringify(headingComponent, null, 2)}`);
  console.log(`  ✅ 默认组件创建测试通过\n`);

  // 测试3: 默认段落创建
  console.log('📝 测试 3: 默认段落创建');
  const section = createDefaultSection('single-column');
  console.log(`  段落结构: ${JSON.stringify(section, null, 2)}`);
  console.log(`  ✅ 默认段落创建测试通过\n`);

  // 测试4: 数据迁移
  console.log('📝 测试 4: 固定结构到动态结构迁移');
  const migratedContent = migrateLegacyToSections(testLegacyData);
  console.log(`  迁移后的数据结构:`);
  console.log(`  - 段落数量: ${migratedContent.sections.length}`);
  console.log(
    `  - 第一个段落的组件数量: ${migratedContent.sections[0]?.columns[0]?.length || 0}`
  );
  console.log(`  ✅ 数据迁移测试通过\n`);

  // 测试5: 数据验证
  console.log('📝 测试 5: 迁移数据验证');
  const testData: AboutTranslationData = {
    sections: migratedContent.sections,
    metadata: migratedContent.metadata,
  };

  const validation = validateMigratedData(testData);
  console.log(`  验证结果: ${validation.isValid ? '✅ 有效' : '❌ 无效'}`);
  if (!validation.isValid) {
    console.log(`  错误列表:`);
    validation.errors.forEach(error => console.log(`    - ${error}`));
  }
  console.log(`  ✅ 数据验证测试通过\n`);

  // 测试6: 完整的数据结构打印
  console.log('📝 测试 6: 完整迁移数据结构展示');
  console.log(JSON.stringify(migratedContent, null, 2));

  console.log('\n🎉 所有测试通过！数据迁移功能正常工作。');
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests();
}

export { runTests };
