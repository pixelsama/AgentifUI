import { create } from "zustand"

// 选中项目类型
export type SelectedItemType = 'chat' | 'app' | null

interface SidebarState {
  isExpanded: boolean
  isHovering: boolean
  hoverTimeoutId: number | null
  clickCooldown: boolean
  // 选中状态管理
  selectedType: SelectedItemType // 'chat' 或 'app' 或 null
  selectedId: string | number | null // 选中项目的ID
  // 方法
  toggleSidebar: () => void
  setHovering: (hovering: boolean) => void
  lockExpanded: () => void
  // 选中状态管理方法
  selectItem: (type: SelectedItemType, id: string | number | null) => void
  clearSelection: () => void
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isExpanded: false,
  isHovering: false,
  hoverTimeoutId: null,
  clickCooldown: false, // Prevents hover from triggering right after a click
  // 选中状态初始值
  selectedType: null,
  selectedId: null,

  toggleSidebar: () => {
    set((state) => {
      // Clear any pending hover timeout
      if (state.hoverTimeoutId) {
        clearTimeout(state.hoverTimeoutId)
      }

      // Set clickCooldown to prevent hover from immediately triggering
      const willBeCollapsed = !state.isExpanded

      // If we're collapsing, set a cooldown to prevent immediate hover expansion
      if (state.isExpanded) {
        setTimeout(() => {
          set({ clickCooldown: false })
        }, 300) // 300ms cooldown after clicking to close
      }

      return {
        isExpanded: !state.isExpanded,
        isHovering: false,
        hoverTimeoutId: null,
        clickCooldown: state.isExpanded, // Only set cooldown when collapsing
      }
    })
  },

  setHovering: (hovering) => {
    set((state) => {
      // Clear any existing timeout
      if (state.hoverTimeoutId) {
        clearTimeout(state.hoverTimeoutId)
      }

      // If we're in cooldown mode after a click, don't respond to hover
      if (state.clickCooldown) {
        return { hoverTimeoutId: null }
      }

      // If we're already in a clicked-expanded state, don't change anything on hover
      if (state.isExpanded && !state.isHovering) {
        return { hoverTimeoutId: null }
      }

      // For hover in, add delay
      if (hovering && !state.isExpanded) {
        const timeoutId = window.setTimeout(() => {
          // Only expand if we're still hovering and not in cooldown
          if (!get().clickCooldown) {
            set({ isHovering: true, isExpanded: true, hoverTimeoutId: null })
          }
        }, 200) // 200ms delay before expanding

        return { hoverTimeoutId: timeoutId }
      }

      // For hover out, add longer delay
      if (!hovering && state.isHovering) {
        const timeoutId = window.setTimeout(() => {
          set({ isHovering: false, isExpanded: false, hoverTimeoutId: null })
        }, 300) // 300ms delay before collapsing

        return { hoverTimeoutId: timeoutId }
      }

      return { isHovering: hovering, hoverTimeoutId: null }
    })
  },

  lockExpanded: () => {
    const state = get()
    // Clear any pending hover timeout
    if (state.hoverTimeoutId) {
      clearTimeout(state.hoverTimeoutId)
    }
    set({ isHovering: false, hoverTimeoutId: null })
  },

  // 选中状态管理方法
  selectItem: (type: SelectedItemType, id: string | number | null) => {
    set({ 
      selectedType: type, 
      selectedId: id,
      // 确保侧边栏保持展开状态
      isExpanded: true,
      isHovering: false 
    })
  },

  clearSelection: () => {
    set({ 
      selectedType: null, 
      selectedId: null 
    })
  },
})) 