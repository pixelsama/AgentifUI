import { useEffect } from "react"
import { usePromptTemplateStore } from "@lib/stores/ui/prompt-template-store"
import { usePromptPanelStore } from "@lib/stores/ui/prompt-panel-store"
import { useFocusManager } from "@components/chat-input/chat-input"

/**
 * 处理提示模板交互的自定义Hook
 * 
 * 封装提示模板选择、面板状态和输入框交互的业务逻辑
 */
export function usePromptTemplateInteraction() {
  const { selectTemplate, isTemplateSelected, clearSelection } = usePromptTemplateStore()
  const { resetPanel } = usePromptPanelStore()
  const focusInput = useFocusManager(state => state.focusInput)
  
  // 处理模板选择
  const handleTemplateSelect = (template: { id: string | number, title: string, prompt: string }) => {
    // 使用store处理模板选择状态和输入框内容
    selectTemplate(template)
    
    // 选择后立即聚焦到输入框
    setTimeout(() => {
      focusInput()
    }, 10) // 增加一点延迟确保DOM更新完成
  }
  
  // 清理选择(当面板关闭时)
  const handlePanelClose = () => {
    resetPanel()
    // 注意：不清除选中的模板，允许用户继续编辑已选择的提示
  }
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearSelection()
    }
  }, [clearSelection])
  
  return {
    handleTemplateSelect,
    handlePanelClose,
    isTemplateSelected
  }
} 