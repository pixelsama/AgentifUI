import { create } from 'zustand'

interface PromptPanelState {
  // 展开的面板ID
  expandedId: number | null
  // 面板位置
  position: {
    top: number
    left: number
  } | null
  // 方法
  setExpandedId: (id: number | null) => void
  setPosition: (position: { top: number; left: number } | null) => void
  togglePanel: (id: number) => void
  resetPanel: () => void
}

export const usePromptPanelStore = create<PromptPanelState>((set) => ({
  expandedId: null,
  position: null,

  setExpandedId: (id) => set({ expandedId: id }),
  
  setPosition: (position) => set({ position }),
  
  togglePanel: (id) => set((state) => ({
    expandedId: state.expandedId === id ? null : id
  })),
  
  resetPanel: () => set({
    expandedId: null,
    position: null
  })
})) 