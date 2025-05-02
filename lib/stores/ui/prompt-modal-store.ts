import { create } from "zustand"

interface PromptModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const usePromptModalStore = create<PromptModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false })
})) 