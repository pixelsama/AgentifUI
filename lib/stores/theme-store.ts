import { create } from "zustand"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches 
    ? "dark" 
    : "light",
  
  toggleTheme: () => {
    set((state) => ({ 
      theme: state.theme === "light" ? "dark" : "light" 
    }))
  },

  setTheme: (theme: Theme) => {
    set({ theme })
  },
})) 