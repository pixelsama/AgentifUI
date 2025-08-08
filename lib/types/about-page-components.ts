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
}

// 页面段落接口
export interface PageSection {
  id: string;
  layout: LayoutType;
  columns: ComponentInstance[][];
  shouldDelete?: boolean;
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
  variant: 'primary' | 'secondary' | 'outline';
  action: 'link' | 'submit' | 'external';
  url?: string;
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
