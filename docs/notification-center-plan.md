# 统一通知中心实现计划

基于Manus设计模式，构建包含"更新日志"和"消息"两个标签页的统一通知中心，与现有NotificationBar保持独立但可联动。

## 设计理念

### 现有系统定位

- **NotificationBar**：保持现有定位，用于即时操作反馈（成功/错误/警告等）
- **新通知中心**：持久化信息展示，分为两个维度：
  - **更新日志**：产品功能更新、版本发布等
  - **消息**：管理员通知、系统提醒、运行结果等

### 架构边界

- **NotificationBar**：瞬时操作反馈，自动消失
- **通知中心**：持久化信息，用户主动查看
- **两者独立**：不共享样式，但可以有逻辑联动

## 第一阶段：数据库设计

### 1.1 统一通知表结构

```sql
-- 统一通知表
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('changelog', 'message')),
  category text, -- changelog类型或消息类型
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_roles text[], -- 目标用户角色
  target_users uuid[], -- 特定目标用户
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}' -- 扩展字段
);

-- 用户通知读取状态
CREATE TABLE notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(notification_id, user_id)
);
```

### 1.2 消息类型定义

```typescript
type MessageCategory =
  | 'admin_announcement' // 管理员公告
  | 'agent_result' // Agent运行结果
  | 'token_usage' // Token消耗提醒
  | 'system_maintenance' // 系统维护
  | 'security_alert' // 安全提醒
  | 'feature_tip'; // 功能提示

type ChangelogCategory =
  | 'feature' // 新功能
  | 'improvement' // 改进
  | 'bugfix' // 修复
  | 'security' // 安全更新
  | 'api_change'; // API变更
```

## 第二阶段：后端API设计

### 2.1 统一API接口

```typescript
// app/api/notifications/route.ts
// GET /api/notifications?type=changelog|message&page=1&limit=10
// POST /api/notifications (创建通知)

// app/api/notifications/[id]/route.ts
// GET|PUT|DELETE /api/notifications/[id]

// app/api/notifications/mark-read/route.ts
// POST /api/notifications/mark-read (批量标记已读)

// app/api/notifications/unread-count/route.ts
// GET /api/notifications/unread-count
```

### 2.2 服务层设计

```typescript
// lib/services/notification-center-service.ts
export class NotificationCenterService {
  static async getNotifications(
    params: GetNotificationsParams
  ): Promise<NotificationList>;
  static async createNotification(
    data: CreateNotificationData
  ): Promise<Notification>;
  static async markAsRead(
    notificationIds: string[],
    userId: string
  ): Promise<void>;
  static async getUnreadCount(userId: string): Promise<UnreadCount>;
  static async deleteNotification(id: string): Promise<void>;
}
```

## 第三阶段：状态管理

### 3.1 通知中心Store

```typescript
// lib/stores/notification-center-store.ts
interface NotificationCenterState {
  // 基础状态
  isOpen: boolean;
  activeTab: 'all' | 'changelog' | 'message';

  // 数据状态
  notifications: Notification[];
  unreadCount: { changelog: number; message: number; total: number };
  loading: boolean;
  hasMore: boolean;

  // 操作方法
  openCenter: () => void;
  closeCenter: () => void;
  setActiveTab: (tab: string) => void;
  fetchNotifications: (type?: string, reset?: boolean) => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: (type?: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}
```

### 3.2 与现有系统的关系

- **独立存在**：不影响现有notification-store
- **可选联动**：重要消息可从NotificationBar引导到通知中心

## 第四阶段：UI组件开发

### 4.1 铃铛图标组件

```typescript
// components/notification-center/notification-bell.tsx
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}
```

**设计要点：**

- 红点徽章显示未读总数
- 集成到现有导航栏用户区域
- 支持键盘访问和屏幕阅读器
- 响应式设计

### 4.2 通知中心弹窗

```typescript
// components/notification-center/notification-center.tsx
```

**功能特点：**

- 固定尺寸弹窗 (参考Manus设计)
- 顶部标签切换："全部" | "更新日志" | "消息"
- 右上角关闭按钮
- 虚拟滚动支持大量数据
- 底部"查看全部"链接

### 4.3 通知条目组件

```typescript
// components/notification-center/notification-item.tsx
```

**设计差异化：**

- **更新日志条目**：
  - 标题 + 日期 + 预览内容
  - 可能包含图片/视频预览
  - 版本标签和分类标签
- **消息条目**：
  - 类型图标 + 标题 + 描述
  - 时间戳 + 已读状态
  - 优先级指示器

### 4.4 完整通知页面

```typescript
// app/notifications/page.tsx
// components/notification-center/notification-page.tsx
```

**页面功能：**

- 面包屑导航
- 高级筛选和搜索
- 分页或无限滚动
- 批量操作（标记已读、删除等）
- 导出功能

## 第五阶段：智能联动机制

### 5.1 NotificationBar → 消息中心联动

```typescript
// 扩展现有NotificationBar
interface NotificationWithAction {
  message: string;
  type: NotificationType;
  action?: {
    text: string;
    handler: () => void; // 打开通知中心并跳转到特定消息
  };
}

// 使用示例
showNotification('重要系统通知已发布', 'info', 5000, {
  text: '查看详情',
  handler: () => {
    openNotificationCenter('message', specificMessageId);
  },
});
```

### 5.2 消息自动归档机制

- **即时通知**：先在NotificationBar显示
- **重要消息**：同时创建持久化通知
- **定时归档**：重要的即时通知自动转为消息中心消息

## 第六阶段：管理后台

### 6.1 管理员发布界面

```typescript
// app/admin/notifications/page.tsx
// app/admin/notifications/create/page.tsx
// app/admin/notifications/[id]/edit/page.tsx
```

**功能包括：**

- 富文本编辑器（支持Markdown）
- 目标用户/角色选择器
- 发布时间调度
- 实时预览功能
- 草稿保存
- 批量管理界面

### 6.2 消息模板系统

```typescript
// lib/templates/notification-templates.ts
const MESSAGE_TEMPLATES = {
  token_warning: {
    title: 'Token使用量警告',
    content: '您的Token使用量已达到{percentage}%，请注意控制使用量。',
    category: 'token_usage',
    priority: 'medium',
  },
  agent_completed: {
    title: 'Agent执行完成',
    content: 'Agent "{agentName}" 已成功执行完成，耗时{duration}。',
    category: 'agent_result',
    priority: 'low',
  },
  maintenance_notice: {
    title: '系统维护通知',
    content: '系统将于{time}进行维护，预计持续{duration}，请提前保存工作。',
    category: 'system_maintenance',
    priority: 'high',
  },
};
```

## 第七阶段：实时更新

### 7.1 Supabase实时集成

```typescript
// lib/hooks/use-notification-realtime.ts
export function useNotificationRealtime() {
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `target_users=cs.{${currentUserId}}`,
        },
        payload => {
          // 实时更新未读计数
          refreshUnreadCount();

          // 可选择性显示即时提醒
          if (payload.new.priority === 'critical') {
            showNotification(payload.new.title, 'warning', 5000, {
              text: '查看详情',
              handler: () => openNotificationCenter('message', payload.new.id),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);
}
```

### 7.2 智能推送策略

```typescript
// lib/services/notification-push-service.ts
export class NotificationPushService {
  static async pushNotification(notification: Notification) {
    const { priority, type, target_users } = notification;

    // 高优先级：立即显示NotificationBar + 更新中心
    if (priority === 'critical' || priority === 'high') {
      this.showImmediateNotification(notification);
    }

    // 中等优先级：仅更新中心徽章
    if (priority === 'medium') {
      this.updateBadgeCount();
    }

    // 低优先级：静默更新，用户主动查看
    if (priority === 'low') {
      this.silentUpdate();
    }
  }
}
```

## 第八阶段：性能优化

### 8.1 数据获取优化

```typescript
// 虚拟滚动组件
// components/notification-center/virtual-notification-list.tsx

// 分页策略
const ITEMS_PER_PAGE = 20;
const PREFETCH_THRESHOLD = 5; // 距离底部5个条目时预加载

// 缓存策略
// lib/cache/notification-cache.ts
export class NotificationCache {
  static cache = new Map<string, CacheEntry>();
  static TTL = 5 * 60 * 1000; // 5分钟缓存

  static get(key: string): CacheEntry | null;
  static set(key: string, data: any): void;
  static invalidate(pattern?: string): void;
}
```

### 8.2 实时更新优化

```typescript
// 防抖和节流
import { debounce, throttle } from 'lodash';

// 防抖更新未读计数（避免频繁API调用）
const debouncedUpdateCount = debounce(updateUnreadCount, 500);

// 节流实时事件处理（避免过度渲染）
const throttledEventHandler = throttle(handleRealtimeEvent, 200);
```

## 第九阶段：国际化与主题

### 9.1 国际化支持

```json
// messages/en-US.json
{
  "components": {
    "notificationCenter": {
      "title": "Notifications",
      "tabs": {
        "all": "All",
        "changelog": "Changelog",
        "message": "Messages"
      },
      "empty": {
        "changelog": "No updates available",
        "message": "No messages"
      },
      "actions": {
        "markAllRead": "Mark all as read",
        "viewAll": "View all notifications"
      }
    }
  }
}
```

### 9.2 主题适配

```css
/* globals.css */
.notification-center {
  @apply bg-background border-border;
}

.notification-item {
  @apply hover:bg-accent/50;
}

.notification-unread {
  @apply bg-blue-50 dark:bg-blue-950/20;
}
```

## 第十阶段：测试与部署

### 10.1 测试策略

```typescript
// tests/notification-center.test.tsx
describe('NotificationCenter', () => {
  test('should display correct unread count');
  test('should filter by notification type');
  test('should mark notifications as read');
  test('should handle real-time updates');
});

// tests/notification-api.test.ts
describe('Notification API', () => {
  test('should create notification');
  test('should enforce RLS policies');
  test('should handle pagination');
});
```

### 10.2 部署检查清单

- [ ] 数据库迁移测试
- [ ] API端点功能验证
- [ ] 实时订阅测试
- [ ] 权限验证
- [ ] 性能基准测试
- [ ] 多语言界面测试
- [ ] 移动端适配验证

## 实施时间规划

### 第1-2周：基础架构

- 数据库设计和迁移
- 基础API开发
- 状态管理设计

### 第3-4周：核心UI

- 铃铛图标组件
- 通知中心弹窗
- 基础通知条目

### 第5-6周：功能完善

- 完整页面开发
- 管理后台界面
- 智能联动机制

### 第7-8周：优化与测试

- 实时更新功能
- 性能优化
- 全面测试

## 技术决策总结

### 1. 架构边界清晰

- **NotificationBar**：瞬时操作反馈，自动消失
- **通知中心**：持久化信息，用户主动查看
- **两者独立**：不共享样式，但可以有逻辑联动

### 2. 用户体验优先

- **统一入口**：单一铃铛图标
- **分类明确**：更新日志 vs 消息
- **渐进增强**：从简单徽章到完整功能

### 3. 扩展性考虑

- **消息类型可扩展**：Agent结果、Token警告、管理员公告等
- **推送策略可配置**：用户可选择接收哪些类型的通知
- **模板系统**：便于快速创建常见类型的通知

### 4. 性能保证

- **虚拟滚动**：处理大量通知
- **智能缓存**：减少不必要的API调用
- **实时优化**：防抖节流机制

这个设计方案创建了一个真正的通知中心，为未来的功能扩展（如Agent通知、Token提醒等）提供了坚实的基础，同时保持了与现有系统的良好兼容性。
