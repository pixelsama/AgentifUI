import { useRef } from "react"

/**
 * 管理输入框焦点的自定义Hook
 * 
 * 提供方法来获取、设置和管理文本输入框的焦点
 */
export function useInputFocus() {
  // 创建对输入框的引用
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  
  // 设置引用
  const setInputRef = (ref: HTMLTextAreaElement | null) => {
    inputRef.current = ref
  }
  
  // 聚焦到输入框
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      
      // 将光标移到文本末尾
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }
  
  // 清除焦点
  const blurInput = () => {
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }
  
  return {
    inputRef,
    setInputRef,
    focusInput,
    blurInput
  }
} 