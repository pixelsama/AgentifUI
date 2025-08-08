/**
 * 数据迁移工具
 *
 * 提供从固定结构到动态组件结构的迁移功能
 */
import {
  AboutTranslationData,
  ComponentInstance,
  ComponentType,
  IdPrefix,
  LegacyAboutData,
  PageContent,
  PageSection,
} from '@lib/types/about-page-components';

// 重新导出类型，以便其他模块使用
export type {
  LegacyAboutData,
  AboutTranslationData,
  PageContent,
  PageSection,
  ComponentInstance,
  ComponentType,
  IdPrefix,
} from '@lib/types/about-page-components';

// ID 生成函数
export function generateUniqueId(prefix: IdPrefix): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

// 生成多个唯一ID
export function generateUniqueIds(prefix: IdPrefix, count: number): string[] {
  return Array.from({ length: count }, () => generateUniqueId(prefix));
}

// 创建默认组件实例
export function createDefaultComponent(
  type: ComponentType,
  content?: string
): ComponentInstance {
  const id = generateUniqueId('comp');

  const defaultProps: Record<ComponentType, Record<string, unknown>> = {
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

// 创建默认段落
export function createDefaultSection(
  layout: 'single-column' | 'two-column' | 'three-column' = 'single-column'
): PageSection {
  const id = generateUniqueId('section');
  const columnCount =
    layout === 'single-column' ? 1 : layout === 'two-column' ? 2 : 3;

  return {
    id,
    layout,
    columns: Array(columnCount)
      .fill([])
      .map(() => []),
  };
}

// 从固定结构迁移到动态组件结构
export function migrateLegacyToSections(legacy: LegacyAboutData): PageContent {
  const sections: PageSection[] = [];

  // 标题和副标题段落
  if (legacy.title || legacy.subtitle) {
    const titleComponents: ComponentInstance[] = [];

    if (legacy.title) {
      titleComponents.push(createDefaultComponent('heading', legacy.title));
      titleComponents[titleComponents.length - 1].props.level = 1;
      titleComponents[titleComponents.length - 1].props.textAlign = 'center';
    }

    if (legacy.subtitle) {
      titleComponents.push(
        createDefaultComponent('paragraph', legacy.subtitle)
      );
      titleComponents[titleComponents.length - 1].props.textAlign = 'center';
    }

    if (titleComponents.length > 0) {
      sections.push({
        id: generateUniqueId('section'),
        layout: 'single-column',
        columns: [titleComponents],
      });
    }
  }

  // 使命段落
  if (legacy.mission?.description) {
    sections.push({
      id: generateUniqueId('section'),
      layout: 'single-column',
      columns: [
        [
          createDefaultComponent('heading', 'Our Mission'),
          createDefaultComponent('paragraph', legacy.mission.description),
        ],
      ],
    });
  }

  // 价值观段落
  if (legacy.values?.items && legacy.values.items.length > 0) {
    const valuesSection: PageSection = {
      id: generateUniqueId('section'),
      layout: 'single-column',
      columns: [[createDefaultComponent('heading', 'Our Values')]],
    };

    // 添加卡片组件
    const cardsComponent = createDefaultComponent('cards');
    cardsComponent.props = {
      layout: 'grid',
      items: legacy.values.items,
    };

    valuesSection.columns[0].push(cardsComponent);
    sections.push(valuesSection);
  }

  // 按钮段落
  if (legacy.buttonText) {
    const buttonComponent = createDefaultComponent('button', legacy.buttonText);
    sections.push({
      id: generateUniqueId('section'),
      layout: 'single-column',
      columns: [[buttonComponent]],
    });
  }

  // 版权段落
  if (legacy.copyright) {
    const copyrightText = [
      legacy.copyright.prefix?.replace(
        '{year}',
        new Date().getFullYear().toString()
      ) || '',
      legacy.copyright.linkText || '',
      legacy.copyright.suffix || '',
    ].join('');

    if (copyrightText.trim()) {
      const copyrightComponent = createDefaultComponent(
        'paragraph',
        copyrightText
      );
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

// 迁移完整的翻译数据
export function migrateAboutTranslationData(
  legacy: AboutTranslationData
): AboutTranslationData {
  // 如果已经是动态格式，直接返回
  if (legacy.sections && legacy.sections.length > 0) {
    return legacy;
  }

  // 迁移固定结构到动态结构
  const pageContent = migrateLegacyToSections(legacy);

  return {
    sections: pageContent.sections,
    metadata: {
      ...legacy.metadata,
      ...pageContent.metadata,
      migrated: true,
    },
  };
}

// 批量迁移多语言数据
export function batchMigrateTranslations(
  translations: Record<string, AboutTranslationData>
): Record<string, AboutTranslationData> {
  const migratedTranslations: Record<string, AboutTranslationData> = {};

  for (const [locale, data] of Object.entries(translations)) {
    migratedTranslations[locale] = migrateAboutTranslationData(data);
  }

  return migratedTranslations;
}

// 验证迁移后的数据完整性
export function validateMigratedData(data: AboutTranslationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查是否有sections
  if (!data.sections || data.sections.length === 0) {
    errors.push('迁移后的数据缺少sections');
  }

  // 检查每个section的完整性
  data.sections?.forEach((section: PageSection, index: number) => {
    if (!section.id) {
      errors.push(`Section ${index} 缺少ID`);
    }

    if (!section.layout) {
      errors.push(`Section ${index} 缺少布局配置`);
    }

    if (!section.columns || !Array.isArray(section.columns)) {
      errors.push(`Section ${index} 缺少或无效的columns`);
    }

    // 检查组件完整性
    section.columns?.forEach(
      (column: ComponentInstance[], columnIndex: number) => {
        if (!Array.isArray(column)) {
          errors.push(`Section ${index}, Column ${columnIndex} 不是数组`);
          return;
        }

        column.forEach((component, componentIndex) => {
          if (!component.id) {
            errors.push(
              `Section ${index}, Column ${columnIndex}, Component ${componentIndex} 缺少ID`
            );
          }

          if (!component.type) {
            errors.push(
              `Section ${index}, Column ${columnIndex}, Component ${componentIndex} 缺少类型`
            );
          }

          if (!component.props) {
            errors.push(
              `Section ${index}, Column ${columnIndex}, Component ${componentIndex} 缺少props`
            );
          }
        });
      }
    );
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 创建备份数据
export function createBackupData(data: AboutTranslationData): {
  data: AboutTranslationData;
  timestamp: string;
  version: string;
} {
  return {
    data: JSON.parse(JSON.stringify(data)), // 深拷贝
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
}
