import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 选中项目类型
export type SelectedItemType = 'chat' | 'app' | null;

interface SidebarState {
  // 基础状态
  isExpanded: boolean; // 侧边栏是否展开
  // 客户端挂载状态
  isMounted: boolean; // 组件是否已在客户端挂载
  // 内容显示状态
  contentVisible: boolean; // 侧边栏内容是否可见
  // 移动端状态管理
  isMobileNavVisible: boolean; // 移动端导航是否可见
  // 动画状态管理
  isAnimating: boolean; // 侧边栏是否正在动画中
  // 选中状态管理
  selectedType: SelectedItemType; // 选中的项目类型：'chat' 或 'app' 或 null
  selectedId: string | number | null; // 选中项目的ID

  // 方法
  toggleSidebar: () => void;
  // 客户端挂载方法
  setMounted: () => void;
  // 内容显示方法
  showContent: () => void;
  hideContent: () => void;
  updateContentVisibility: (isMobile: boolean) => void;
  // 宽度计算方法
  getSidebarWidth: (isMobile: boolean) => string;
  // 移动端方法
  showMobileNav: () => void;
  hideMobileNav: () => void;
  toggleMobileNav: () => void;
  // 选中状态管理方法
  selectItem: (
    type: SelectedItemType,
    id: string | number | null,
    keepCurrentExpandState?: boolean
  ) => void;
  clearSelection: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // 基础状态 - 桌面端持久化记忆用户偏好
      isExpanded: false,
      // 客户端挂载状态 - 初始为 false
      isMounted: false,
      // 内容显示状态
      contentVisible: false,
      // 移动端状态
      isMobileNavVisible: false,
      // 动画状态
      isAnimating: false,
      // 选中状态初始值
      selectedType: null,
      selectedId: null,

      // 客户端挂载方法
      setMounted: () => {
        set({ isMounted: true });
      },

      // 内容显示管理
      showContent: () => {
        set({ contentVisible: true });
      },

      hideContent: () => {
        set({ contentVisible: false });
      },

      // 根据设备类型和侧边栏状态更新内容可见性
      updateContentVisibility: (isMobile: boolean) => {
        const { isExpanded } = get();

        if (!isExpanded) {
          // 侧边栏折叠时直接隐藏内容
          set({ contentVisible: false });
          return;
        }

        // 如果是移动设备，立即显示内容，否则依赖外部延迟设置
        if (isMobile) {
          set({ contentVisible: true });
        }
        // 桌面端由外部计时器延迟设置
      },

      // 宽度计算方法
      getSidebarWidth: (isMobile: boolean) => {
        const { isExpanded } = get();

        // 根据设备类型和侧边栏状态返回不同宽度类名
        if (isMobile) {
          return isExpanded ? 'w-64' : 'w-0';
        } else {
          return isExpanded ? 'w-64' : 'w-16';
        }
      },

      toggleSidebar: () => {
        set(state => {
          const newIsExpanded = !state.isExpanded;

          // 当收起侧边栏时，立即隐藏内容
          if (!newIsExpanded) {
            set({ contentVisible: false });
          }
          // 展开时不立即设置contentVisible，让updateContentVisibility处理

          // 设置动画状态
          set({ isAnimating: true });

          // 150ms后清除动画状态
          setTimeout(() => {
            set({ isAnimating: false });
          }, 150);

          return {
            isExpanded: newIsExpanded,
          };
        });
      },

      // 移动端方法
      showMobileNav: () => {
        set({
          isExpanded: true,
          isMobileNavVisible: true,
          // --- BEGIN MODIFIED COMMENT ---
          // 移动端上立即显示内容
          // --- END MODIFIED COMMENT ---
          contentVisible: true,
        });
      },

      hideMobileNav: () => {
        set({
          isExpanded: false,
          isMobileNavVisible: false,
          contentVisible: false,
        });
      },

      toggleMobileNav: () => {
        const { isMobileNavVisible } = get();
        const newState = !isMobileNavVisible;

        set({
          isExpanded: newState,
          isMobileNavVisible: newState,
          // --- BEGIN MODIFIED COMMENT ---
          // 同步内容显示状态
          // --- END MODIFIED COMMENT ---
          contentVisible: newState,
        });
      },

      // 选中状态管理方法
      selectItem: (
        type: SelectedItemType,
        id: string | number | null,
        keepCurrentExpandState: boolean = false
      ) => {
        const currentState = get();

        // 更新选中状态
        const updates: Partial<SidebarState> = {
          selectedType: type,
          selectedId: id,
        };

        // 如果需要保持当前展开状态，确保内容可见
        if (keepCurrentExpandState && currentState.isExpanded) {
          updates.contentVisible = true;
        }

        set(updates);
      },

      clearSelection: () => {
        set({
          selectedType: null,
          selectedId: null,
        });
      },
    }),
    {
      name: 'sidebar-desktop-preferences',
      storage: createJSONStorage(() => localStorage),
      // 只在桌面端持久化 isExpanded 状态，移动端使用默认行为
      partialize: state => {
        const isDesktop =
          typeof window !== 'undefined' && window.innerWidth >= 768;
        return isDesktop ? { isExpanded: state.isExpanded } : {};
      },
    }
  )
);
