import { create } from "zustand"

interface DropdownState {
  isOpen: boolean
  activeDropdownId: string | null
  position: { top: number; left: number } | null
  toggleDropdown: (id: string, position?: { top: number; left: number }) => void
  closeDropdown: () => void
}

export const useDropdownStore = create<DropdownState>((set) => ({
  isOpen: false,
  activeDropdownId: null,
  position: null,
  toggleDropdown: (id, position) => {
    set((state) => {
      // 如果点击的是已经打开的下拉菜单，则关闭它
      if (state.isOpen && state.activeDropdownId === id) {
        return {
          isOpen: false,
          activeDropdownId: null,
          position: null
        }
      }
      
      // 否则，打开新的下拉菜单
      return {
        isOpen: true,
        activeDropdownId: id,
        position: position || null
      }
    })
  },
  closeDropdown: () => {
    set({
      isOpen: false,
      activeDropdownId: null,
      position: null
    })
  }
})) 