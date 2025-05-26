import { create } from 'zustand';

interface AppInfo {
  id: string;
  name: string;
}

interface AppListState {
  apps: AppInfo[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;

  fetchApps: () => Promise<void>;
  clearCache: () => void;
}

export const useAppListStore = create<AppListState>((set, get) => ({
  apps: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,

  fetchApps: async () => {
    const now = Date.now();
    const state = get();
  
    // 5分钟内不重复获取
    if (now - state.lastFetchTime < 5 * 60 * 1000 && state.apps.length > 0) {
      return;
    }
  
    set({ isLoading: true, error: null });
  
    try {
      const { getAllDifyApps } = await import('@lib/services/dify/app-service');
      const apps = await getAllDifyApps();
      set({ 
        apps, 
        isLoading: false, 
        lastFetchTime: now 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  },

  clearCache: () => {
    set({ 
      apps: [], 
      lastFetchTime: 0,
      error: null 
    });
  }
})); 