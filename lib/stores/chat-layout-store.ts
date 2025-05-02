import { create } from 'zustand';

interface ChatLayoutState {
  inputHeight: number; // 存储输入框的实际高度
  setInputHeight: (height: number) => void;
  resetInputHeight: () => void;
}

// 根据 chat-input/index.tsx 中的 textarea 样式，初始最小高度是 48px
const INITIAL_INPUT_HEIGHT = 48; 

export const useChatLayoutStore = create<ChatLayoutState>((set) => ({
  inputHeight: INITIAL_INPUT_HEIGHT, // 初始高度
  setInputHeight: (height) => set({ inputHeight: height }),
  resetInputHeight: () => set({ inputHeight: INITIAL_INPUT_HEIGHT }),
}));

// 导出初始高度常量，方便其他组件使用
export { INITIAL_INPUT_HEIGHT };
