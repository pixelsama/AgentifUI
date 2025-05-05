import { create } from "zustand"

// --- BEGIN COMMENT ---
// 定义单个附件文件的状态接口
// --- END COMMENT ---
export interface AttachmentFile {
  id: string // 使用文件对象和时间戳等生成的唯一ID
  file: File // 原始 File 对象
  name: string // 文件名
  size: number // 文件大小
  type: string // 文件类型
  status: "pending" | "uploading" | "success" | "error" // 上传状态
  progress: number // 上传进度 (0-100)
  error?: string // 错误信息
}

// --- BEGIN COMMENT ---
// 定义附件 Store 的 State 和 Actions 接口
// --- END COMMENT ---
interface AttachmentStoreState {
  files: AttachmentFile[]
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  updateFileStatus: (id: string, status: AttachmentFile["status"], progress?: number, error?: string) => void
  clearFiles: () => void
}

// --- BEGIN COMMENT ---
// 创建附件 Store
// --- END COMMENT ---
export const useAttachmentStore = create<AttachmentStoreState>((set, get) => ({
  files: [],

  // --- BEGIN COMMENT ---
  // 添加一个或多个文件到 Store
  // --- END COMMENT ---
  addFiles: (newFiles) => {
    const newAttachments = newFiles.map((file) => {
      const id = `${file.name}-${file.lastModified}-${file.size}` // 生成一个相对唯一的ID
      const attachment: AttachmentFile = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        progress: 0,
      }
      return attachment
    })

    set((state) => ({
      // 过滤掉可能重复添加的文件（基于ID）
      files: [
        ...state.files,
        ...newAttachments.filter((att) => !state.files.some((f) => f.id === att.id)),
      ],
    }))
  },

  // --- BEGIN COMMENT ---
  // 根据 ID 移除文件，并释放可能的预览 URL
  // --- END COMMENT ---
  removeFile: (id) => {
    set((state) => {
      const fileToRemove = state.files.find((f) => f.id === id)
      return {
        files: state.files.filter((f) => f.id !== id),
      }
    })
  },

  // --- BEGIN COMMENT ---
  // 更新指定文件的状态和进度
  // --- END COMMENT ---
  updateFileStatus: (id, status, progress, error) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status, progress: progress ?? f.progress, error: error ?? f.error } : f
      ),
    }))
  },

  // --- BEGIN COMMENT ---
  // 清空所有文件，并释放预览 URL
  // --- END COMMENT ---
  clearFiles: () => {
    set({ files: [] });
  },
})) 