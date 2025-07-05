'use client';

// 文件类型hook的兼容性包装器
// 重新导出新的配置驱动的文件类型hook，保持向后兼容
export { useFileTypesFromConfig as useFileTypes } from './use-file-types-from-config';
export type { FileType, FileUploadConfig } from './use-file-types-from-config';
