import type { MessageAttachment } from '@lib/stores/chat-store';
import { create } from 'zustand';

interface FilePreviewState {
  isPreviewOpen: boolean;
  currentPreviewFile: MessageAttachment | null;
  openPreview: (file: MessageAttachment) => void;
  closePreview: () => void;
}

export const useFilePreviewStore = create<FilePreviewState>(set => ({
  isPreviewOpen: false,
  currentPreviewFile: null,
  openPreview: file => set({ isPreviewOpen: true, currentPreviewFile: file }),
  closePreview: () => set({ isPreviewOpen: false, currentPreviewFile: null }),
}));
