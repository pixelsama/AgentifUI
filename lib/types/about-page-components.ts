/**
 * 动态关于页面组件类型定义
 *
 * 这个文件定义了动态组件编辑器所需的所有类型，包括：
 * - 组件类型枚举
 * - 布局类型枚举
 * - 组件实例结构
 * - 页面段落结构
 * - 页面内容结构
 * - 各种组件的 props 接口定义
 */

// 支持的布局类型
export type LayoutType = 'single-column' | 'two-column' | 'three-column';

// 支持的组件类型
export type ComponentType =
  | 'heading'
  | 'paragraph'
  | 'cards'
  | 'button'
  | 'image'
  | 'divider';

// 组件实例接口
export interface ComponentInstance {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  // 是否继承section的共享属性 (默认true)
  inheritFromSection?: boolean;
  // 要覆盖的section属性键名列表
  overrideProps?: string[];
}

// Section共享属性接口
export interface SectionCommonProps {
  // 样式主题
  theme?: 'light' | 'dark' | 'auto';
  // 间距设置
  spacing?: 'compact' | 'normal' | 'spacious';
  // 文本对齐
  textAlign?: 'left' | 'center' | 'right';
  // 动画效果
  animation?: 'fade' | 'slide' | 'none';
  // 是否可交互
  interactive?: boolean;
  // 拖拽行为
  dragBehavior?: 'inherit' | 'custom';
  // 背景样式
  backgroundColor?: string;
  // 边框样式
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  // 自定义属性扩展
  [key: string]: unknown;
}

// 页面段落接口
export interface PageSection {
  id: string;
  layout: LayoutType;
  columns: ComponentInstance[][];
  shouldDelete?: boolean;
  // 新增：section级别的共享属性
  commonProps?: SectionCommonProps;
}

// 页面内容接口
export interface PageContent {
  sections: PageSection[];
  metadata?: {
    version?: string;
    lastModified?: string;
    author?: string;
  };
}

// === 组件 Props 接口定义 ===

// 标题组件 Props
export interface HeadingProps {
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign: 'left' | 'center' | 'right';
}

// 段落组件 Props
export interface ParagraphProps {
  content: string;
  textAlign: 'left' | 'center' | 'right';
}

// 卡片组件 Props
export interface CardsProps {
  layout: 'grid' | 'list';
  items: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

// 按钮组件 Props
export interface ButtonProps {
  text: string;
  variant: 'solid' | 'outline';
  action: 'link' | 'submit' | 'external';
  url?: string;
  // 可选的第二个按钮
  secondaryButton?: {
    text: string;
    variant: 'solid' | 'outline';
    action: 'link' | 'submit' | 'external';
    url?: string;
  };
}

// 图片组件 Props
export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right';
  width?: string | number;
  height?: string | number;
}

// 分隔线组件 Props
export interface DividerProps {
  style: 'solid' | 'dashed' | 'dotted';
  color?: string;
  thickness?: 'thin' | 'medium' | 'thick';
}

// 组件 Props 联合类型
export type ComponentProps =
  | HeadingProps
  | ParagraphProps
  | CardsProps
  | ButtonProps
  | ImageProps
  | DividerProps;

// 组件定义接口 (用于组件注册系统)
export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: string;
  defaultProps: Record<string, unknown>;
  category: 'basic' | 'layout' | 'content' | 'media';
  description?: string;
}

// 编辑器状态接口
export interface AboutEditorState {
  pageContent: PageContent | null;
  selectedComponentId: string | null;
  undoStack: PageContent[];
  redoStack: PageContent[];
  isDirty: boolean;
  isLoading: boolean;
}

// 拖拽结果接口 (来自 react-beautiful-dnd)
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}

// ID 生成相关类型
export type IdPrefix = 'section' | 'comp';

// 数据迁移相关接口
export interface LegacyAboutData {
  title?: string;
  subtitle?: string;
  mission?: {
    description?: string;
  };
  values?: {
    items?: Array<{
      title: string;
      description: string;
    }>;
  };
  buttonText?: string;
  copyright?: {
    prefix?: string;
    linkText?: string;
    suffix?: string;
  };
}

// 扩展的 About 翻译数据接口，支持动态组件结构
export interface AboutTranslationData {
  // 新的动态组件结构
  sections?: PageSection[];

  // 向后兼容：保留原有的固定结构 (用于数据迁移)
  title?: string;
  subtitle?: string;
  mission?: {
    description?: string;
  };
  values?: {
    items?: Array<{
      title: string;
      description: string;
    }>;
  };
  buttonText?: string;
  copyright?: {
    prefix?: string;
    linkText?: string;
    suffix?: string;
  };

  // 元数据
  metadata?: {
    version?: string;
    lastModified?: string;
    author?: string;
    migrated?: boolean; // 标记是否已从固定结构迁移到动态结构
  };
}

// 检查数据是否为新的动态格式
export function isDynamicFormat(data: AboutTranslationData): boolean {
  return Boolean(data && data.sections && data.sections.length > 0);
}

// 检查数据是否为旧的固定格式
export function isLegacyFormat(data: AboutTranslationData): boolean {
  return Boolean(
    !data.sections &&
      (data.title ||
        data.subtitle ||
        data.mission ||
        data.values ||
        data.buttonText)
  );
}

// Re-export utility functions from data-migration for convenience
export {
  generateUniqueId,
  createDefaultComponent,
  createDefaultSection,
  migrateLegacyToSections,
  migrateAboutTranslationData,
  batchMigrateTranslations,
  validateMigratedData,
  createBackupData,
} from '@lib/utils/data-migration';

// === 属性继承工具函数 ===

/**
 * 合并section公共属性和组件特有属性
 *
 * @param sectionCommonProps - Section级别的公共属性
 * @param componentProps - 组件特有属性
 * @param overrideProps - 要覆盖的公共属性键名列表
 * @returns 合并后的最终属性对象
 */
export function mergeComponentProps(
  sectionCommonProps: SectionCommonProps = {},
  componentProps: Record<string, unknown> = {},
  overrideProps: string[] = []
): Record<string, unknown> {
  // 创建section属性副本
  const inherited = { ...sectionCommonProps };

  // 移除被覆盖的属性
  overrideProps.forEach(key => {
    delete inherited[key];
  });

  // 组件特有属性优先级更高
  return {
    ...inherited,
    ...componentProps,
  };
}

/**
 * 获取组件的最终属性 (包含继承逻辑)
 *
 * @param component - 组件实例
 * @param sectionCommonProps - Section的公共属性
 * @returns 解析后的最终属性对象
 */
export function getResolvedComponentProps(
  component: ComponentInstance,
  sectionCommonProps?: SectionCommonProps
): Record<string, unknown> {
  // 如果不继承或没有section公共属性，直接返回组件props
  if (component.inheritFromSection === false || !sectionCommonProps) {
    return component.props;
  }

  // 合并属性 (默认继承)
  return mergeComponentProps(
    sectionCommonProps,
    component.props,
    component.overrideProps || []
  );
}
