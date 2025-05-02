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
    set((state) => ({
      isOpen: state.activeDropdownId !== id || !state.isOpen,
      activeDropdownId: state.activeDropdownId !== id || !state.isOpen ? id : null,
      position: position || null
    }))
  },
  closeDropdown: () => {
    set({
      isOpen: false,
      activeDropdownId: null,
      position: null
    })
  }
})) 