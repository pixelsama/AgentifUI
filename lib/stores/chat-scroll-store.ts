import { create } from 'zustand';

// --- BEGIN COMMENT ---
// 定义滚动状态接口
// --- END COMMENT ---
interface ChatScrollState {
  // --- BEGIN COMMENT ---
  // 标记用户是否已手动向上滚动，离开聊天底部。
  // 如果为 true，则禁用自动滚动到底部的行为。
  // --- END COMMENT ---
  userScrolledUp: boolean;
  // --- BEGIN COMMENT ---
  // 更新 userScrolledUp 状态的方法。
  // --- END COMMENT ---
  setUserScrolledUp: (scrolledUp: boolean) => void;
}

// --- BEGIN COMMENT ---
// 创建 Zustand store 来管理聊天滚动状态。
// --- END COMMENT ---
export const useChatScrollStore = create<ChatScrollState>((set) => ({
  // --- BEGIN COMMENT ---
  // 初始状态：默认用户在底部，自动滚动是激活的。
  // --- END COMMENT ---
  userScrolledUp: false,
  // --- BEGIN COMMENT ---
  // 实现状态更新方法。
  // --- END COMMENT ---
  setUserScrolledUp: (scrolledUp) => {
    // console.log(`[ChatScrollStore] Setting userScrolledUp to: ${scrolledUp}`); // 可以取消注释用于调试
    set({ userScrolledUp: scrolledUp });
  },
})); 