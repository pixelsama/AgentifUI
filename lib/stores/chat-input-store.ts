import { create } from "zustand"

interface ChatState {
  // 聊天界面状态
  isWelcomeScreen: boolean
  setIsWelcomeScreen: (isWelcome: boolean) => void

  // 暗黑模式
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  // 聊天界面状态
  isWelcomeScreen: true,
  setIsWelcomeScreen: (isWelcome) => set({ isWelcomeScreen: isWelcome }),

  // 暗黑模式
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}))
