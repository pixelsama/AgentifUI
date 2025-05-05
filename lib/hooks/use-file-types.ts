"use client"

import React from "react"
import { useEffect, useState } from "react"
import { File, FileText, Image, Music, Video, FileCog } from "lucide-react"

// 定义文件类型接口
export interface FileType {
  title: string
  extensions: string[]
  icon: React.ReactNode
  acceptString: string
}

// 定义原始文件类型数据接口
interface RawFileType {
  title: string
  extensions: string[]
}

// 根据文件类型返回对应的图标
const getIconForFileType = (type: string): React.ReactNode => {
  switch (type.toLowerCase()) {
    case "文档":
      return React.createElement(FileText, { className: "w-4 h-4" })
    case "图片":
      return React.createElement(Image, { className: "w-4 h-4" })
    case "音频":
      return React.createElement(Music, { className: "w-4 h-4" })
    case "视频":
      return React.createElement(Video, { className: "w-4 h-4" })
    default:
      return React.createElement(FileCog, { className: "w-4 h-4" })
  }
}

// 生成文件选择器接受的格式字符串
const generateAcceptString = (extensions: string[]): string => {
  return extensions.map(ext => `.${ext}`).join(",")
}

// 文件类型钩子
export function useFileTypes() {
  const [fileTypes, setFileTypes] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadFileTypes = async () => {
      try {
        setIsLoading(true)
        // 加载文件类型配置
        const response = await fetch("/api/file-types")
        if (!response.ok) {
          throw new Error(`Failed to load file types: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // 处理原始数据，转换为所需格式
        if (data.SUPPORTED_FILE_TYPES && Array.isArray(data.SUPPORTED_FILE_TYPES)) {
          const processed: FileType[] = data.SUPPORTED_FILE_TYPES
            .filter((type: RawFileType) => type.extensions && type.extensions.length > 0) // 只保留有效文件类型
            .map((type: RawFileType) => ({
              title: type.title,
              extensions: type.extensions,
              icon: getIconForFileType(type.title),
              acceptString: generateAcceptString(type.extensions)
            }))
          
          setFileTypes(processed)
        } else {
          throw new Error("Invalid file types data structure")
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading file types:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }

    loadFileTypes()
  }, [])

  return { fileTypes, isLoading, error }
} 