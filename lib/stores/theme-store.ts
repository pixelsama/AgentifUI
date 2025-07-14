import { create } from 'zustand';

// 注意: 随着引入 next-themes，这个 Zustand store 的作用已大幅减小，甚至可能多余。
// 组件应优先使用 @lib/hooks/use-theme.ts 中的 useTheme Hook (它封装了 next-themes)。
// 保留此 store 主要是为了兼容可能直接导入其 action 的旧组件。
// store 自身不再存储实际的主题状态，也不再负责持久化或 DOM 操作。
type Theme = 'light' | 'dark' | 'system'; // 主题类型，与 next-themes 保持一致

interface ThemeState {
  // _theme_placeholder: 不再存储实际主题状态，由 next-themes 管理。
  // 保留此占位符或移除皆可，取决于是否需要维持 store 的基本结构。
  _theme_placeholder?: Theme;

  // toggleTheme: 切换主题的 action (已弃用)。
  // 实际的切换逻辑应通过调用 useTheme() 返回的 toggleTheme 函数完成。
  toggleTheme: () => void;

  // setTheme: 设置特定主题的 action (已弃用)。
  // 实际设置逻辑应通过调用 useTheme() 返回的 setTheme 函数完成。
  setTheme: (theme: Theme) => void;
}

// 不再需要 persist 中间件、getSystemTheme 或任何初始状态逻辑。
// next-themes 会处理持久化和状态初始化。
export const useThemeStore = create<ThemeState>()(() => ({
  _theme_placeholder: undefined, // 占位符状态，不实际使用

  // 下方的 action 实现是"空壳"，因为它们无法在 store 创建函数内部直接调用 useTheme Hook。
  // 如果组件完全迁移到使用 useTheme Hook，这些 action 理论上可以移除。
  // 保留它们并添加警告是为了提醒开发者正确的用法。
  toggleTheme: () => {
    console.warn(
      '[DEPRECATED] 从 store 调用 toggleTheme 已弃用。请使用 useTheme() Hook 返回的 toggleTheme 函数。'
    );
    // 此处无法调用 next-themes 的 setTheme
  },

  setTheme: (theme: Theme) => {
    console.warn(
      `[DEPRECATED] 从 store 调用 setTheme('${theme}') 已弃用。请使用 useTheme() Hook 返回的 setTheme 函数。`
    );
    // 此处无法调用 next-themes 的 setTheme
  },
}));
