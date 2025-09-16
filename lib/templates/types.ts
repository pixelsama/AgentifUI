/**
 * Notification Template Type Definitions
 *
 * Core interfaces and types for the notification template system
 */
import type { NotificationPriority } from '@lib/types/notification-admin';
import type { NotificationCategory } from '@lib/types/notification-center';

export interface NotificationTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Notification category */
  category: NotificationCategory;
  /** Default priority */
  priority: NotificationPriority;
  /** Default notification type */
  type: 'changelog' | 'message';
  /** Title template with variables */
  title: string;
  /** Content template with variables */
  content: string;
  /** Template variables */
  variables: TemplateVariable[];
  /** Default target roles */
  defaultTargetRoles: string[];
  /** Template tags for categorization */
  tags: string[];
}

export interface TemplateVariable {
  /** Variable name (without braces) */
  name: string;
  /** Variable description */
  description: string;
  /** Variable type */
  type: 'string' | 'number' | 'date' | 'url' | 'email';
  /** Whether variable is required */
  required: boolean;
  /** Default value if any */
  defaultValue?: string;
  /** Example value */
  example?: string;
}
