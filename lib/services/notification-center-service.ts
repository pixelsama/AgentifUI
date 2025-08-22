/**
 * Notification Center Service Layer
 *
 * Higher-level business logic for the notification center system.
 * Handles complex operations, validation, and coordination between different components.
 */
import {
  canUserAccessNotification,
  createNotification,
  deleteNotification,
  getAllNotificationsForAdmin,
  getNotificationsWithReadStatus,
  getTargetedNotifications,
  getUserUnreadCount,
  getUserUnreadCountByCategory,
  markNotificationAsRead,
  markNotificationsAsRead,
  updateNotification,
} from '@lib/db/notification-center';
import { getUserProfileByIdLegacy as getProfile } from '@lib/db/profiles';
import type {
  CreateNotificationData,
  GetNotificationsParams,
  Notification,
  NotificationListResponse,
  NotificationTemplate,
  NotificationType,
  NotificationWithReadStatus,
  UnreadCount,
  UpdateNotificationData,
  UserRole,
} from '@lib/types/notification-center';

// ============================================================================
// Public User Operations
// ============================================================================

export class NotificationCenterService {
  /**
   * Get notifications for a user with read status and filtering
   */
  static async getNotifications(
    userId: string,
    params: GetNotificationsParams = {}
  ): Promise<NotificationListResponse> {
    // Get user profile for role-based filtering
    const profile = await getProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Fetch notifications with read status
    const { notifications, total_count } = await getNotificationsWithReadStatus(
      userId,
      params
    );

    // Get unread count
    const unreadCount = await getUserUnreadCount(userId, params.type);

    return {
      notifications,
      total_count,
      has_more: (params.offset || 0) + notifications.length < total_count,
      unread_count: unreadCount,
    };
  }

  /**
   * Get targeted notifications for a user based on their role
   */
  static async getTargetedNotifications(
    userId: string,
    userRole: UserRole,
    params: GetNotificationsParams = {}
  ): Promise<NotificationWithReadStatus[]> {
    return await getTargetedNotifications(userId, userRole, params);
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<void> {
    // Verify user has access to this notification
    const profile = await getProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const hasAccess = await canUserAccessNotification(
      userId,
      profile.role,
      notificationId
    );
    if (!hasAccess) {
      throw new Error('Access denied to notification');
    }

    await markNotificationAsRead(notificationId, userId);
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(
    notificationIds: string[],
    userId: string
  ): Promise<number> {
    if (notificationIds.length === 0) {
      return 0;
    }

    // Verify user has access to all notifications
    const profile = await getProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const accessChecks = await Promise.all(
      notificationIds.map(id =>
        canUserAccessNotification(userId, profile.role, id)
      )
    );

    const inaccessibleIds = notificationIds.filter(
      (_, index) => !accessChecks[index]
    );
    if (inaccessibleIds.length > 0) {
      throw new Error(
        `Access denied to notifications: ${inaccessibleIds.join(', ')}`
      );
    }

    return await markNotificationsAsRead(notificationIds, userId);
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(
    userId: string,
    type?: NotificationType
  ): Promise<UnreadCount> {
    return await getUserUnreadCount(userId, type);
  }

  /**
   * Get unread count breakdown by category
   */
  static async getUnreadCountByCategory(
    userId: string
  ): Promise<Record<string, number>> {
    return await getUserUnreadCountByCategory(userId);
  }

  /**
   * Check if user can access a specific notification
   */
  static async canUserAccess(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    const profile = await getProfile(userId);
    if (!profile) {
      return false;
    }

    return await canUserAccessNotification(
      userId,
      profile.role,
      notificationId
    );
  }
}

// ============================================================================
// Admin Management Operations
// ============================================================================

export class NotificationAdminService {
  /**
   * Verify user has admin permissions
   */
  private static async verifyAdminPermissions(userId: string): Promise<void> {
    const profile = await getProfile(userId);
    if (!profile || profile.role !== 'admin') {
      throw new Error('Insufficient permissions. Admin role required.');
    }
  }

  /**
   * Verify user has manager or admin permissions
   */
  private static async verifyManagerPermissions(userId: string): Promise<void> {
    const profile = await getProfile(userId);
    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      throw new Error(
        'Insufficient permissions. Admin or manager role required.'
      );
    }
  }

  /**
   * Get all notifications for admin management
   */
  static async getAllNotifications(
    userId: string,
    params: GetNotificationsParams = {}
  ): Promise<{
    notifications: Notification[];
    total_count: number;
    has_more: boolean;
  }> {
    await this.verifyAdminPermissions(userId);

    const { notifications, total_count } =
      await getAllNotificationsForAdmin(params);

    return {
      notifications,
      total_count,
      has_more: (params.offset || 0) + notifications.length < total_count,
    };
  }

  /**
   * Create a new notification
   */
  static async createNotification(
    data: CreateNotificationData,
    createdBy: string
  ): Promise<Notification> {
    await this.verifyManagerPermissions(createdBy);

    // Validate targeting
    if (data.target_roles && data.target_roles.length > 0) {
      const validRoles: UserRole[] = ['admin', 'manager', 'user'];
      const invalidRoles = data.target_roles.filter(
        role => !validRoles.includes(role)
      );
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid target roles: ${invalidRoles.join(', ')}`);
      }
    }

    return await createNotification(data);
  }

  /**
   * Update an existing notification
   */
  static async updateNotification(
    data: UpdateNotificationData,
    updatedBy: string
  ): Promise<Notification> {
    await this.verifyManagerPermissions(updatedBy);

    // Validate targeting if provided
    if (data.target_roles && data.target_roles.length > 0) {
      const validRoles: UserRole[] = ['admin', 'manager', 'user'];
      const invalidRoles = data.target_roles.filter(
        role => !validRoles.includes(role)
      );
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid target roles: ${invalidRoles.join(', ')}`);
      }
    }

    return await updateNotification(data);
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(
    notificationId: string,
    deletedBy: string
  ): Promise<void> {
    await this.verifyAdminPermissions(deletedBy);
    await deleteNotification(notificationId);
  }

  /**
   * Bulk publish notifications
   */
  static async bulkPublish(
    notificationIds: string[],
    publishedBy: string
  ): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    await this.verifyManagerPermissions(publishedBy);

    const results = {
      success: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const id of notificationIds) {
      try {
        await updateNotification({ id, published: true });
        results.success.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Bulk unpublish notifications
   */
  static async bulkUnpublish(
    notificationIds: string[],
    unpublishedBy: string
  ): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    await this.verifyManagerPermissions(unpublishedBy);

    const results = {
      success: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const id of notificationIds) {
      try {
        await updateNotification({ id, published: false });
        results.success.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Bulk delete notifications
   */
  static async bulkDelete(
    notificationIds: string[],
    deletedBy: string
  ): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    await this.verifyAdminPermissions(deletedBy);

    const results = {
      success: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const id of notificationIds) {
      try {
        await deleteNotification(id);
        results.success.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

// ============================================================================
// Template-based Notification Creation
// ============================================================================

export class NotificationTemplateService {
  /**
   * Common notification templates
   */
  private static templates: Record<string, NotificationTemplate> = {
    token_warning: {
      title: 'Token使用量警告',
      content:
        '您的Token使用量已达到{percentage}%，请注意控制使用量以避免超出限制。',
      category: 'token_usage',
      priority: 'medium',
      metadata: { template: 'token_warning' },
    },
    agent_completed: {
      title: 'Agent执行完成',
      content:
        'Agent "{agentName}" 已成功执行完成，耗时{duration}。结果已保存到您的工作区。',
      category: 'agent_result',
      priority: 'low',
      metadata: { template: 'agent_completed' },
    },
    maintenance_notice: {
      title: '系统维护通知',
      content:
        '系统将于{startTime}进行维护，预计持续{duration}。维护期间服务可能暂时不可用，请提前保存您的工作。',
      category: 'system_maintenance',
      priority: 'high',
      metadata: { template: 'maintenance_notice' },
    },
    security_alert: {
      title: '安全提醒',
      content:
        '检测到异常登录行为。如果这不是您的操作，请立即修改密码并联系管理员。',
      category: 'security_alert',
      priority: 'critical',
      metadata: { template: 'security_alert' },
    },
    feature_announcement: {
      title: '新功能发布',
      content: '我们很高兴地宣布新功能 "{featureName}" 现已上线！{description}',
      category: 'feature',
      priority: 'medium',
      metadata: { template: 'feature_announcement' },
    },
  };

  /**
   * Create notification from template
   */
  static async createFromTemplate(
    templateName: string,
    variables: Record<string, string>,
    options: {
      targetRoles?: UserRole[];
      targetUsers?: string[];
      published?: boolean;
    },
    createdBy: string
  ): Promise<Notification> {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Replace variables in template
    let title = template.title;
    let content = template.content;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    const notificationData: CreateNotificationData = {
      type: 'message', // Templates are typically for messages
      category: template.category,
      title,
      content,
      priority: template.priority,
      target_roles: options.targetRoles || [],
      target_users: options.targetUsers || [],
      published: options.published !== undefined ? options.published : true,
      metadata: {
        ...template.metadata,
        template_variables: variables,
      },
    };

    return await NotificationAdminService.createNotification(
      notificationData,
      createdBy
    );
  }

  /**
   * Get available templates
   */
  static getAvailableTemplates(): Record<string, NotificationTemplate> {
    return { ...this.templates };
  }

  /**
   * Add custom template
   */
  static addTemplate(name: string, template: NotificationTemplate): void {
    this.templates[name] = template;
  }
}
