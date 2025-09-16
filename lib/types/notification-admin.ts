import type { NotificationCategory } from './notification-center';

export interface NotificationForm {
  id?: string;
  type: 'changelog' | 'message';
  category: NotificationCategory;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_roles: string[];
  target_users: string[];
  scheduled_time?: string;
  published?: boolean;
  published_at?: string | null;
}

export interface NotificationTemplate {
  title: string;
  content: string;
  category: NotificationCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CategoryOption {
  label: string;
  description: string;
}

export interface PriorityOption {
  label: string;
  description: string;
}

export interface RoleOption {
  value: string;
  label: string;
}
