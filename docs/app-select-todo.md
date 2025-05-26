# App切换集成指南

## 核心理念

**重要**：App切换功能已经内置在现有的 `validateAndRefreshConfig` 方法中，无需额外实现。

- `validateAndRefreshConfig(targetAppId)` = 切换到指定app
- `validateAndRefreshConfig()` = 验证当前app，失败时自动切换到默认app

## 1. `validateAndRefreshConfig` 功能矩阵

| 功能类别 | 具体作用 | 使用场景 |
|---------|---------|---------|
| **🔄 配置同步** | 管理端变更同步到用户端 | 管理员修改配置后自动更新 |
| **🛡️ 配置验证** | 验证app存在性和有效性 | 应用启动、定时验证 |
| **🔀 智能切换** | 指定切换 + 自动fallback | 用户切换app、当前app失效 |
| **⚡ 性能优化** | 30秒防抖 + 缓存管理 | 避免频繁验证请求 |
| **🚨 错误恢复** | 优雅降级 + 自动重试 | 网络异常、配置错误 |
| **🎮 UI状态** | 加载状态 + 错误反馈 | 用户界面反馈 |

## 2. App列表管理

### 2.1 App列表Store

```typescript
// lib/stores/app-list-store.ts
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
```

### 2.2 App服务

```typescript
// lib/services/dify/app-service.ts
import { getProviderByName } from '@lib/db';

export async function getAllDifyApps(): Promise<Array<{id: string, name: string}>> {
  try {
    // 获取Dify提供商
    const providerResult = await getProviderByName('Dify');
    if (!providerResult.success || !providerResult.data) {
      throw new Error('未找到Dify提供商');
    }

    // 获取所有Dify服务实例
    const { createClient } = await import('@lib/supabase/client');
    const supabase = createClient();
  
    const { data: instances, error } = await supabase
      .from('service_instances')
      .select('instance_id, display_name, name')
      .eq('provider_id', providerResult.data.id)
      .order('display_name');
    
    if (error) {
      throw error;
    }
  
    return instances?.map(instance => ({
      id: instance.instance_id,
      name: instance.display_name || instance.name
    })) || [];
  
  } catch (error) {
    console.error('获取Dify应用列表失败:', error);
    throw error;
  }
}
```

## 3. 使用模式

### 3.1 基础切换模式

```typescript
// 任何需要app切换的组件
const AppSelectorComponent = () => {
  const { validateAndRefreshConfig, isValidating, currentAppId } = useCurrentApp();
  const { apps, fetchApps, isLoading } = useAppListStore();
  const { clearMessages } = useChatStore();

  useEffect(() => {
    fetchApps(); // 获取app列表
  }, [fetchApps]);

  const handleAppChange = async (appId: string) => {
    if (appId === currentAppId) return;
  
    try {
      // 🎯 直接使用 validateAndRefreshConfig 进行切换
      await validateAndRefreshConfig(appId);
    
      // 清理聊天状态
      clearMessages();
    
      // 重定向到新聊天
      if (typeof window !== 'undefined') {
        window.location.href = '/chat/new';
      }
    } catch (error) {
      console.error('切换app失败:', error);
    }
  };

  if (isLoading) return <div>加载应用列表...</div>;

  return (
    <select 
      value={currentAppId || ''} 
      onChange={(e) => handleAppChange(e.target.value)}
      disabled={isValidating}
    >
      <option value="">请选择应用</option>
      {apps.map(app => (
        <option key={app.id} value={app.id}>
          {app.name}
        </option>
      ))}
    </select>
  );
};
```

### 3.2 便捷Hook（可选）

```typescript
// lib/hooks/use-app-switching.ts
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useAppListStore } from '@lib/stores/app-list-store';
import { useChatStore } from '@lib/stores/chat-store';

export function useAppSwitching() {
  const { validateAndRefreshConfig, isValidating } = useCurrentApp();
  const { clearMessages } = useChatStore();
  const { clearCache } = useAppListStore();

  const switchApp = async (targetAppId: string) => {
    try {
      // 🎯 核心：直接使用 validateAndRefreshConfig
      await validateAndRefreshConfig(targetAppId);
    
      // 清理相关状态
      clearMessages();
      clearCache(); // 清除app列表缓存，确保下次获取最新
    
      // 重定向
      if (typeof window !== 'undefined') {
        window.location.href = '/chat/new';
      }
    
    } catch (error) {
      console.error('切换app失败:', error);
      throw error;
    }
  };

  return {
    switchApp,
    isValidating
  };
}
```

### 3.3 使用便捷Hook

```typescript
const AppSelectorWithHook = () => {
  const { currentAppId } = useCurrentApp();
  const { apps, fetchApps, isLoading } = useAppListStore();
  const { switchApp, isValidating } = useAppSwitching();

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return (
    <select 
      value={currentAppId || ''} 
      onChange={(e) => switchApp(e.target.value)}
      disabled={isValidating || isLoading}
    >
      {apps.map(app => (
        <option key={app.id} value={app.id}>{app.name}</option>
      ))}
    </select>
  );
};
```

## 4. 路由集成

### 4.1 默认聊天页面

```typescript
// app/chat/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentApp } from '@lib/hooks/use-current-app';

export default function DefaultChatPage() {
  const router = useRouter();
  const { validateAndRefreshConfig, isLoading, error } = useCurrentApp();

  useEffect(() => {
    const initializeDefaultChat = async () => {
      try {
        // 🎯 验证当前配置，无配置时自动初始化默认app
        await validateAndRefreshConfig();
      
        // 重定向到新对话页面
        router.replace('/chat/new');
      } catch (error) {
        console.error('初始化默认聊天失败:', error);
      }
    };

    initializeDefaultChat();
  }, [router, validateAndRefreshConfig]);

  if (isLoading) {
    return <div>正在加载应用配置...</div>;
  }

  if (error) {
    return (
      <div>
        <div>加载应用配置失败: {error}</div>
        <button onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    );
  }

  return <div>正在跳转...</div>;
}
```

## 5. 典型使用场景

### 5.1 应用启动验证

```typescript
// 应用启动时验证配置
useEffect(() => {
  validateAndRefreshConfig(); // 验证当前配置，失效时自动fallback
}, []);
```

### 5.2 用户主动切换

```typescript
// 用户选择切换到特定app
const handleUserSwitch = (newAppId: string) => {
  validateAndRefreshConfig(newAppId); // 切换到指定app
};
```

### 5.3 定时配置同步

```typescript
// 定时验证配置是否有更新
useEffect(() => {
  const interval = setInterval(() => {
    validateAndRefreshConfig(); // 同步最新配置
  }, 5 * 60 * 1000); // 5分钟

  return () => clearInterval(interval);
}, []);
```

### 5.4 发送消息前验证

```typescript
// 发送消息前确保配置有效
const handleSendMessage = async (message: string) => {
  await validateAndRefreshConfig(); // 确保配置最新有效
  // 发送消息逻辑...
};
```

## 6. 设计优势

### 6.1 核心优势
- **复用现有逻辑**：直接使用 `validateAndRefreshConfig(targetAppId)` 
- **统一状态管理**：所有app状态集中在 `current-app-store`
- **自动错误恢复**：内置fallback机制，切换失败时使用默认app
- **性能优化**：30秒防抖 + app列表5分钟缓存

### 6.2 架构特点
- **简洁实现**：避免重复代码，逻辑清晰一致
- **状态分离**：app列表独立管理，不污染localStorage
- **灵活使用**：支持直接调用和Hook封装两种方式
- **错误隔离**：app列表获取失败不影响当前app使用

## 7. 注意事项

1. **状态清理**：切换app时必须清理聊天相关状态
2. **用户体验**：使用 `isValidating` 状态显示加载提示
3. **错误处理**：利用现有错误恢复机制，提供友好反馈
4. **缓存策略**：app列表采用短时缓存，避免过度请求
5. **URL同步**：切换后重定向保持路由状态一致

这个方案充分利用现有的 `validateAndRefreshConfig` 功能，保持架构简洁，避免重复实现。 