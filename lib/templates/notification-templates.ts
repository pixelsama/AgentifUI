/**
 * Notification Templates System
 *
 * Provides predefined templates for common notification types
 * with variable substitution support
 */
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
  priority: 'low' | 'medium' | 'high' | 'critical';
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

/**
 * Predefined notification templates
 */
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  token_warning: {
    id: 'token_warning',
    name: 'Token使用量警告',
    description: 'Token使用量达到阈值时的警告通知',
    category: 'token_usage',
    priority: 'medium',
    type: 'message',
    title: 'Token使用量警告',
    content: `您的Token使用量已达到{percentage}%，请注意控制使用量以避免服务中断。

当前状态：
• 已使用：{currentUsage} tokens
• 总额度：{limit} tokens
• 使用率：{percentage}%
• 更新时间：{updateTime}

建议操作：
- 检查最近的使用记录
- 优化API调用频率
- 考虑升级服务套餐

如有疑问，请联系技术支持。`,
    variables: [
      {
        name: 'percentage',
        description: '使用百分比',
        type: 'number',
        required: true,
        example: '85',
      },
      {
        name: 'currentUsage',
        description: '当前使用量',
        type: 'number',
        required: true,
        example: '8500',
      },
      {
        name: 'limit',
        description: '总额度',
        type: 'number',
        required: true,
        example: '10000',
      },
      {
        name: 'updateTime',
        description: '更新时间',
        type: 'date',
        required: true,
        example: '2024-01-20 14:30',
      },
    ],
    defaultTargetRoles: ['user'],
    tags: ['token', 'usage', 'warning', 'system'],
  },

  agent_completed: {
    id: 'agent_completed',
    name: 'Agent执行完成',
    description: 'AI Agent成功执行完成的通知',
    category: 'agent_result',
    priority: 'low',
    type: 'message',
    title: 'Agent执行完成',
    content: `Agent "{agentName}" 已成功执行完成。

执行信息：
• Agent名称：{agentName}
• 执行时间：{duration}
• 完成时间：{completedAt}
• 执行状态：成功

执行结果：
{result}

您可以在Agent管理页面查看详细的执行日志和结果数据。`,
    variables: [
      {
        name: 'agentName',
        description: 'Agent名称',
        type: 'string',
        required: true,
        example: 'DataAnalyzer',
      },
      {
        name: 'duration',
        description: '执行时长',
        type: 'string',
        required: true,
        example: '2分38秒',
      },
      {
        name: 'completedAt',
        description: '完成时间',
        type: 'date',
        required: true,
        example: '2024-01-20 15:45',
      },
      {
        name: 'result',
        description: '执行结果描述',
        type: 'string',
        required: true,
        example: '成功处理1000条数据记录',
      },
    ],
    defaultTargetRoles: ['user'],
    tags: ['agent', 'completion', 'success', 'automation'],
  },

  agent_failed: {
    id: 'agent_failed',
    name: 'Agent执行失败',
    description: 'AI Agent执行失败的错误通知',
    category: 'agent_result',
    priority: 'medium',
    type: 'message',
    title: 'Agent执行失败',
    content: `Agent "{agentName}" 执行失败，请检查配置和输入数据。

错误信息：
• Agent名称：{agentName}
• 失败时间：{failedAt}
• 执行时长：{duration}
• 错误类型：{errorType}

错误详情：
{errorMessage}

建议操作：
- 检查输入数据格式
- 验证Agent配置参数
- 查看详细错误日志
- 联系技术支持（如需要）

您可以在Agent管理页面重新执行或修改配置。`,
    variables: [
      {
        name: 'agentName',
        description: 'Agent名称',
        type: 'string',
        required: true,
        example: 'DataProcessor',
      },
      {
        name: 'failedAt',
        description: '失败时间',
        type: 'date',
        required: true,
        example: '2024-01-20 15:30',
      },
      {
        name: 'duration',
        description: '执行时长',
        type: 'string',
        required: true,
        example: '45秒',
      },
      {
        name: 'errorType',
        description: '错误类型',
        type: 'string',
        required: true,
        example: '数据格式错误',
      },
      {
        name: 'errorMessage',
        description: '错误详情',
        type: 'string',
        required: true,
        example: '输入文件格式不支持，请使用CSV或Excel格式',
      },
    ],
    defaultTargetRoles: ['user'],
    tags: ['agent', 'failure', 'error', 'troubleshooting'],
  },

  maintenance_notice: {
    id: 'maintenance_notice',
    name: '系统维护通知',
    description: '系统维护和升级的预告通知',
    category: 'system_maintenance',
    priority: 'high',
    type: 'message',
    title: '系统维护通知',
    content: `系统将于{startTime}进行例行维护，预计持续{duration}。

维护详情：
• 开始时间：{startTime}
• 结束时间：{endTime}
• 维护类型：{maintenanceType}
• 影响范围：{affectedServices}

维护期间可能出现的影响：
- 服务暂时中断
- 数据同步延迟
- 功能临时不可用
- 登录可能受影响

重要提醒：
请在维护开始前保存您的工作进度，避免数据丢失。

维护完成后，所有服务将恢复正常。如有紧急问题，请联系技术支持。

感谢您的理解与配合！`,
    variables: [
      {
        name: 'startTime',
        description: '维护开始时间',
        type: 'date',
        required: true,
        example: '2024-01-20 23:00',
      },
      {
        name: 'endTime',
        description: '维护结束时间',
        type: 'date',
        required: true,
        example: '2024-01-21 01:00',
      },
      {
        name: 'duration',
        description: '维护时长',
        type: 'string',
        required: true,
        example: '2小时',
      },
      {
        name: 'maintenanceType',
        description: '维护类型',
        type: 'string',
        required: true,
        example: '数据库升级',
      },
      {
        name: 'affectedServices',
        description: '受影响的服务',
        type: 'string',
        required: true,
        example: '所有在线服务',
      },
    ],
    defaultTargetRoles: ['user', 'admin'],
    tags: ['maintenance', 'system', 'downtime', 'upgrade'],
  },

  security_alert: {
    id: 'security_alert',
    name: '安全警告',
    description: '安全相关的紧急警告通知',
    category: 'security_alert',
    priority: 'critical',
    type: 'message',
    title: '安全警告',
    content: `检测到您的账户存在异常活动，请立即采取安全措施。

异常详情：
• 检测时间：{detectedAt}
• 异常类型：{alertType}
• 来源位置：{location}
• IP地址：{ipAddress}
• 设备信息：{deviceInfo}

安全建议：
1. 立即修改账户密码
2. 检查账户活动记录
3. 启用两步验证（如未启用）
4. 退出所有设备的登录状态
5. 检查账户绑定的邮箱和手机

详细信息：
{details}

如果这不是您的操作，请立即联系我们的安全团队。

安全热线：{securityHotline}
支持邮箱：{supportEmail}`,
    variables: [
      {
        name: 'detectedAt',
        description: '检测时间',
        type: 'date',
        required: true,
        example: '2024-01-20 14:30',
      },
      {
        name: 'alertType',
        description: '警告类型',
        type: 'string',
        required: true,
        example: '异地登录',
      },
      {
        name: 'location',
        description: '来源位置',
        type: 'string',
        required: true,
        example: '北京市',
      },
      {
        name: 'ipAddress',
        description: 'IP地址',
        type: 'string',
        required: true,
        example: '192.168.1.100',
      },
      {
        name: 'deviceInfo',
        description: '设备信息',
        type: 'string',
        required: true,
        example: 'Chrome/Windows',
      },
      {
        name: 'details',
        description: '详细信息',
        type: 'string',
        required: true,
        example: '从未授权的设备尝试访问敏感功能',
      },
      {
        name: 'securityHotline',
        description: '安全热线',
        type: 'string',
        required: false,
        example: '400-123-4567',
      },
      {
        name: 'supportEmail',
        description: '支持邮箱',
        type: 'email',
        required: false,
        example: 'security@example.com',
      },
    ],
    defaultTargetRoles: ['user'],
    tags: ['security', 'alert', 'urgent', 'protection'],
  },

  feature_announcement: {
    id: 'feature_announcement',
    name: '新功能发布',
    description: '新功能发布的公告通知',
    category: 'feature',
    priority: 'medium',
    type: 'changelog',
    title: '新功能发布：{featureName}',
    content: `我们很高兴地宣布推出新功能：{featureName}！

功能亮点：
{highlights}

主要特性：
{features}

使用方法：
{usage}

更新内容：
• 发布版本：{version}
• 发布时间：{releaseDate}
• 兼容性：{compatibility}

立即体验：
{callToAction}

我们相信这个新功能将极大地提升您的使用体验。如有任何问题或建议，欢迎随时联系我们。

更多详情请查看：{documentationUrl}`,
    variables: [
      {
        name: 'featureName',
        description: '功能名称',
        type: 'string',
        required: true,
        example: 'AI智能助手',
      },
      {
        name: 'highlights',
        description: '功能亮点',
        type: 'string',
        required: true,
        example: '支持多语言对话，响应速度提升50%',
      },
      {
        name: 'features',
        description: '主要特性列表',
        type: 'string',
        required: true,
        example: '• 自然语言处理\n• 代码生成\n• 文档写作',
      },
      {
        name: 'usage',
        description: '使用方法',
        type: 'string',
        required: true,
        example: '点击右下角的AI助手图标即可开始使用',
      },
      {
        name: 'version',
        description: '版本号',
        type: 'string',
        required: true,
        example: 'v2.1.0',
      },
      {
        name: 'releaseDate',
        description: '发布日期',
        type: 'date',
        required: true,
        example: '2024-01-20',
      },
      {
        name: 'compatibility',
        description: '兼容性信息',
        type: 'string',
        required: true,
        example: '支持所有现代浏览器',
      },
      {
        name: 'callToAction',
        description: '行动呼吁',
        type: 'string',
        required: true,
        example: '访问新功能页面开始体验',
      },
      {
        name: 'documentationUrl',
        description: '文档链接',
        type: 'url',
        required: false,
        example: 'https://docs.example.com/new-feature',
      },
    ],
    defaultTargetRoles: ['user', 'admin'],
    tags: ['feature', 'release', 'announcement', 'update'],
  },

  api_deprecation: {
    id: 'api_deprecation',
    name: 'API弃用通知',
    description: 'API版本弃用和迁移的通知',
    category: 'api_change',
    priority: 'high',
    type: 'changelog',
    title: 'API弃用通知：{apiName}',
    content: `重要通知：API "{apiName}" 将于{deprecationDate}弃用。

弃用详情：
• API名称：{apiName}
• 当前版本：{currentVersion}
• 弃用日期：{deprecationDate}
• 完全停用日期：{shutdownDate}

新版本信息：
• 新API名称：{newApiName}
• 新版本：{newVersion}
• 新功能：{newFeatures}

迁移指南：
{migrationSteps}

重要时间节点：
• {deprecationDate} - 开始弃用警告
• {migrationDeadline} - 建议完成迁移
• {shutdownDate} - 旧版本完全停用

影响范围：
{affectedComponents}

技术支持：
如需迁移协助，请联系技术团队：
• 技术文档：{documentationUrl}
• 支持邮箱：{supportEmail}
• 迁移工具：{migrationToolUrl}

请及时更新您的集成代码，避免服务中断。`,
    variables: [
      {
        name: 'apiName',
        description: 'API名称',
        type: 'string',
        required: true,
        example: 'Legacy Chat API v1.0',
      },
      {
        name: 'currentVersion',
        description: '当前版本',
        type: 'string',
        required: true,
        example: 'v1.0',
      },
      {
        name: 'deprecationDate',
        description: '弃用开始日期',
        type: 'date',
        required: true,
        example: '2024-03-01',
      },
      {
        name: 'shutdownDate',
        description: '完全停用日期',
        type: 'date',
        required: true,
        example: '2024-06-01',
      },
      {
        name: 'newApiName',
        description: '新API名称',
        type: 'string',
        required: true,
        example: 'Modern Chat API v2.0',
      },
      {
        name: 'newVersion',
        description: '新版本',
        type: 'string',
        required: true,
        example: 'v2.0',
      },
      {
        name: 'newFeatures',
        description: '新功能特性',
        type: 'string',
        required: true,
        example: '更高性能、更好的错误处理、增强的安全性',
      },
      {
        name: 'migrationSteps',
        description: '迁移步骤',
        type: 'string',
        required: true,
        example: '1. 更新API端点\n2. 修改请求格式\n3. 测试新接口',
      },
      {
        name: 'migrationDeadline',
        description: '建议迁移截止日期',
        type: 'date',
        required: true,
        example: '2024-05-01',
      },
      {
        name: 'affectedComponents',
        description: '受影响的组件',
        type: 'string',
        required: true,
        example: '聊天功能、消息推送、实时通知',
      },
      {
        name: 'documentationUrl',
        description: '技术文档链接',
        type: 'url',
        required: false,
        example: 'https://docs.example.com/api-migration',
      },
      {
        name: 'supportEmail',
        description: '支持邮箱',
        type: 'email',
        required: false,
        example: 'api-support@example.com',
      },
      {
        name: 'migrationToolUrl',
        description: '迁移工具链接',
        type: 'url',
        required: false,
        example: 'https://tools.example.com/migration',
      },
    ],
    defaultTargetRoles: ['developer', 'admin'],
    tags: ['api', 'deprecation', 'migration', 'breaking-change'],
  },

  user_onboarding: {
    id: 'user_onboarding',
    name: '用户欢迎',
    description: '新用户欢迎和引导通知',
    category: 'feature_tip',
    priority: 'low',
    type: 'message',
    title: '欢迎使用{platformName}！',
    content: `亲爱的{username}，欢迎加入{platformName}！

我们很高兴您选择了我们的平台。为了帮助您更好地开始使用，我们为您准备了完整的入门指南。

快速开始：
1. 完善您的个人资料
2. 浏览平台主要功能
3. 查看使用教程和文档
4. 加入用户社区

主要功能：
{mainFeatures}

学习资源：
• 新手教程：{tutorialUrl}
• 使用文档：{documentationUrl}
• 社区论坛：{communityUrl}
• 帮助中心：{helpUrl}

专属优惠：
作为新用户，您可以享受：
{specialOffers}

需要帮助？
我们的客户服务团队随时为您提供支持：
• 在线客服：{supportChat}
• 服务邮箱：{supportEmail}
• 服务热线：{supportPhone}

再次感谢您的加入，祝您使用愉快！

{platformName} 团队`,
    variables: [
      {
        name: 'username',
        description: '用户名',
        type: 'string',
        required: true,
        example: '张三',
      },
      {
        name: 'platformName',
        description: '平台名称',
        type: 'string',
        required: true,
        example: 'AgentifUI',
      },
      {
        name: 'mainFeatures',
        description: '主要功能介绍',
        type: 'string',
        required: true,
        example: '• AI助手对话\n• 智能代码生成\n• 项目管理工具',
      },
      {
        name: 'tutorialUrl',
        description: '教程链接',
        type: 'url',
        required: false,
        example: 'https://tutorial.example.com',
      },
      {
        name: 'documentationUrl',
        description: '文档链接',
        type: 'url',
        required: false,
        example: 'https://docs.example.com',
      },
      {
        name: 'communityUrl',
        description: '社区链接',
        type: 'url',
        required: false,
        example: 'https://community.example.com',
      },
      {
        name: 'helpUrl',
        description: '帮助中心链接',
        type: 'url',
        required: false,
        example: 'https://help.example.com',
      },
      {
        name: 'specialOffers',
        description: '专属优惠',
        type: 'string',
        required: false,
        example: '首月免费试用，额外1000 tokens',
      },
      {
        name: 'supportChat',
        description: '在线客服',
        type: 'string',
        required: false,
        example: '点击右下角聊天图标',
      },
      {
        name: 'supportEmail',
        description: '支持邮箱',
        type: 'email',
        required: false,
        example: 'support@example.com',
      },
      {
        name: 'supportPhone',
        description: '服务热线',
        type: 'string',
        required: false,
        example: '400-123-4567',
      },
    ],
    defaultTargetRoles: ['user'],
    tags: ['onboarding', 'welcome', 'getting-started', 'tutorial'],
  },
};

/**
 * Template processing utilities
 */
export class NotificationTemplateProcessor {
  /**
   * Process template with variable substitution
   */
  static processTemplate(
    template: NotificationTemplate,
    variables: Record<string, unknown>
  ): { title: string; content: string } {
    let processedTitle = template.title;
    let processedContent = template.content;

    // Replace variables in title and content
    template.variables.forEach(variable => {
      const value =
        variables[variable.name] ||
        variable.defaultValue ||
        `{${variable.name}}`;
      const placeholder = new RegExp(`\\{${variable.name}\\}`, 'g');

      processedTitle = processedTitle.replace(placeholder, String(value));
      processedContent = processedContent.replace(placeholder, String(value));
    });

    return {
      title: processedTitle,
      content: processedContent,
    };
  }

  /**
   * Validate required variables
   */
  static validateVariables(
    template: NotificationTemplate,
    variables: Record<string, unknown>
  ): { isValid: boolean; missingVariables: string[] } {
    const missingVariables = template.variables
      .filter(variable => variable.required && !variables[variable.name])
      .map(variable => variable.name);

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * Get template by ID
   */
  static getTemplate(templateId: string): NotificationTemplate | null {
    return NOTIFICATION_TEMPLATES[templateId] || null;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(
    category: NotificationCategory
  ): NotificationTemplate[] {
    return Object.values(NOTIFICATION_TEMPLATES).filter(
      template => template.category === category
    );
  }

  /**
   * Get templates by type
   */
  static getTemplatesByType(
    type: 'changelog' | 'message'
  ): NotificationTemplate[] {
    return Object.values(NOTIFICATION_TEMPLATES).filter(
      template => template.type === type
    );
  }

  /**
   * Search templates by name or description
   */
  static searchTemplates(query: string): NotificationTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(NOTIFICATION_TEMPLATES).filter(
      template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get all template categories
   */
  static getAllCategories(): NotificationCategory[] {
    const categories = new Set<NotificationCategory>();
    Object.values(NOTIFICATION_TEMPLATES).forEach(template => {
      categories.add(template.category);
    });
    return Array.from(categories);
  }

  /**
   * Get all template tags
   */
  static getAllTags(): string[] {
    const tags = new Set<string>();
    Object.values(NOTIFICATION_TEMPLATES).forEach(template => {
      template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }
}

export default NOTIFICATION_TEMPLATES;
