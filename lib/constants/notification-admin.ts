/**
 * Static variables for notification content insertion
 */
export const NOTIFICATION_VARIABLES = [
  'username',
  'time',
  'date',
  'agentName',
  'duration',
  'result',
  'percentage',
  'currentUsage',
  'limit',
  'details',
  'ip',
  'featureName',
  'features',
] as const;

/**
 * Default form values for creating notifications
 */
export const DEFAULT_NOTIFICATION_FORM = {
  type: 'message' as const,
  category: 'admin_announcement' as const,
  title: '',
  content: '',
  priority: 'medium' as const,
  target_roles: ['user'],
  target_users: [],
  scheduled_time: '',
};
