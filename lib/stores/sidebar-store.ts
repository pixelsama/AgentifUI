import { create } from "zustand"

// 选中项目类型
export type SelectedItemType = 'chat' | 'app' | null

interface SidebarState {
  // 基础状态
  isExpanded: boolean
  isHovering: boolean
  hoverTimeoutId: number | null
  clickCooldown: boolean
  // 客户端挂载状态
  isMounted: boolean
  // 内容显示状态
  contentVisible: boolean
  // 移动端状态管理
  isMobileNavVisible: boolean
  // 选中状态管理
  selectedType: SelectedItemType // 'chat' 或 'app' 或 null
  selectedId: string | number | null // 选中项目的ID
  
  // 方法
  toggleSidebar: () => void
  setHovering: (hovering: boolean) => void
  lockExpanded: () => void
  // 客户端挂载方法
  setMounted: () => void
  // 内容显示方法
  showContent: () => void
  hideContent: () => void
  updateContentVisibility: (isMobile: boolean) => void
  // 宽度计算方法
  getSidebarWidth: (isMobile: boolean) => string
  // 移动端方法
  showMobileNav: () => void
  hideMobileNav: () => void
  toggleMobileNav: () => void
  // 选中状态管理方法
  selectItem: (type: SelectedItemType, id: string | number | null) => void
  clearSelection: () => void
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // 基础状态
  isExpanded: false,
  isHovering: false,
  hoverTimeoutId: null,
  clickCooldown: false,
  // 客户端挂载状态 - 初始为false
  isMounted: false,
  // 内容显示状态
  contentVisible: false,
  // 移动端状态
  isMobileNavVisible: false,
  // 选中状态初始值
  selectedType: null,
  selectedId: null,

  // 客户端挂载方法
  setMounted: () => {
    set({ isMounted: true })
  },
  
  // 内容显示管理
  showContent: () => {
    set({ contentVisible: true })
  },
  
  hideContent: () => {
    set({ contentVisible: false })
  },
  
  // 根据设备类型和侧边栏状态更新内容可见性
  updateContentVisibility: (isMobile: boolean) => {
    const { isExpanded } = get()
    
    if (!isExpanded) {
      // 侧边栏折叠时直接隐藏内容
      set({ contentVisible: false })
      return
    }
    
    // 如果是移动设备，立即显示内容，否则依赖动画
    if (isMobile) {
      set({ contentVisible: true })
    }
    // 桌面端由外部计时器延迟设置
  },

  // 宽度计算方法
  getSidebarWidth: (isMobile: boolean) => {
    const { isExpanded, isMounted } = get()
    
    // 未挂载前保持宽度为0防止闪烁
    if (!isMounted) return "w-0"
    
    // 根据设备类型和侧边栏状态返回不同宽度类名
    if (isMobile) {
      return isExpanded ? "w-64" : "w-0"
    } else {
      return isExpanded ? "w-64" : "w-16"
    }
  },

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

      // 当收起侧边栏时，立即隐藏内容
      if (state.isExpanded) {
        set({ contentVisible: false })
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
      // 如果是移动设备上，忽略悬停事件
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return { hoverTimeoutId: null }
      }
      
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
          set({ 
            isHovering: false, 
            isExpanded: false, 
            hoverTimeoutId: null,
            contentVisible: false // 当收起侧边栏时，隐藏内容
          })
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
  
  // 移动端方法
  showMobileNav: () => {
    set({ 
      isExpanded: true, 
      isMobileNavVisible: true,
      contentVisible: true // 移动端上立即显示内容
    })
  },
  
  hideMobileNav: () => {
    set({ 
      isExpanded: false, 
      isMobileNavVisible: false,
      contentVisible: false
    })
  },
  
  toggleMobileNav: () => {
    const { isMobileNavVisible } = get()
    const newState = !isMobileNavVisible
    
    set({ 
      isExpanded: newState,
      isMobileNavVisible: newState,
      contentVisible: newState // 同步内容显示状态
    })
  },

  // 选中状态管理方法
  selectItem: (type: SelectedItemType, id: string | number | null) => {
    set({ 
      selectedType: type, 
      selectedId: id,
      // 确保侧边栏保持展开状态
      isExpanded: true,
      isHovering: false,
      contentVisible: true // 确保选择项后内容可见
    })
  },

  clearSelection: () => {
    set({ 
      selectedType: null, 
      selectedId: null 
    })
  },
})) 