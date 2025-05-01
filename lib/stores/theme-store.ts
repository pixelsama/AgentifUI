import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// 获取系统主题偏好
const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// 从localStorage获取保存的主题，如果没有则使用系统主题
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem("theme") as Theme) || getSystemTheme()
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light"
          // 更新 HTML 根元素的主题类
          if (typeof window !== "undefined") {
            document.documentElement.classList.remove("light", "dark")
            document.documentElement.classList.add(newTheme)
          }
          return { theme: newTheme }
        })
      },

      setTheme: (theme: Theme) => {
        // 更新 HTML 根元素的主题类
        if (typeof window !== "undefined") {
          document.documentElement.classList.remove("light", "dark")
          document.documentElement.classList.add(theme)
        }
        set({ theme })
      },
    }),
    {
      name: "theme-storage", // localStorage 的 key
      skipHydration: true, // 跳过水合，避免客户端/服务器端不匹配
    }
  )
) 