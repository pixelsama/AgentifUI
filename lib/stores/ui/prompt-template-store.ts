import { create } from "zustand"
import { useChatInputStore } from "../chat-input-store"

interface PromptTemplate {
  id: string | number
  title: string
  prompt: string
}

interface PromptTemplateState {
  // 当前选中的模板ID
  selectedTemplateId: string | number | null
  
  // 选择模板处理
  selectTemplate: (template: PromptTemplate) => void
  
  // 取消选择
  clearSelection: () => void
  
  // 检查模板是否被选中
  isTemplateSelected: (templateId: string | number) => boolean
}

export const usePromptTemplateStore = create<PromptTemplateState>((set, get) => ({
  // 初始状态
  selectedTemplateId: null,
  
  // 选择模板 - 如果已选中则取消选择，否则选中并填入内容
  selectTemplate: (template) => {
    const { selectedTemplateId } = get()
    const { setMessage, clearMessage } = useChatInputStore.getState()
    
    // 如果点击的是当前已选中的模板，则取消选择并清空输入框
    if (selectedTemplateId === template.id) {
      clearMessage()
      set({ selectedTemplateId: null })
    } else {
      // 否则，选中新模板并设置输入框内容
      setMessage(template.prompt)
      set({ selectedTemplateId: template.id })
    }
  },
  
  // 清除选择
  clearSelection: () => {
    set({ selectedTemplateId: null })
  },
  
  // 检查模板是否被选中
  isTemplateSelected: (templateId) => {
    return get().selectedTemplateId === templateId
  }
})) 