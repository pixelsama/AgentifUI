import { create } from 'zustand';

/**
 * ThinkBlock 状态接口
 */
interface ThinkState {
  // 是否检测到 <think> 标签并在处理其内容
  isThinking: boolean;
  // ThinkBlock 内容区域是否可见 (展开/折叠)
  isOpen: boolean;
  // 设置思考状态
  setIsThinking: (thinking: boolean) => void;
  // 切换展开/折叠状态
  toggleOpen: () => void;
  // 重置状态为初始值
  reset: () => void;
}

// 初始状态
const initialState = {
  isThinking: false,
  isOpen: true, // 默认展开
};

/**
 * Zustand Store 用于管理 ThinkBlock 的状态
 */
export const useThinkStore = create<ThinkState>((set) => ({
  ...initialState,

  // 设置当前是否正在处理 <think> 内容
  setIsThinking: (thinking) => set({ 
    isThinking: thinking,
    // 如果思考完成 (thinking 为 false)，则自动折叠
    isOpen: thinking ? true : false, 
  }),

  // 切换内容区域的可见性
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  // 重置状态
  reset: () => set(initialState),
})); 