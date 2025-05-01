import { useThemeStore } from '@lib/stores/theme-store'

export function useTheme() {
  const { theme, toggleTheme } = useThemeStore()

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }
} 