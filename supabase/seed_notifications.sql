-- ============================================================================
-- Notification Center Seed Data
-- Sample data for testing the notification center system
-- ============================================================================

-- ============================================================================
-- Sample Changelog Notifications
-- ============================================================================

INSERT INTO public.notifications (
  type, category, title, content, priority, target_roles, target_users, 
  published, published_at, metadata
) VALUES 
-- New Feature Announcements
(
  'changelog',
  'feature',
  '介绍 Wide Research',
  '一项新功能现已推出。我们对产品的研究体验，重新开发了从输入到输出的方式，让你能够自然地研究任何主题并得到有用的答案。了解更多 Pro 和 Plus 用户的新功能。',
  'high',
  '{}',
  '{}',
  true,
  now(),
  '{"version": "v2.1.0", "image_url": "/changelog/wide-research.jpg", "read_more_url": "/changelog/wide-research"}'
),

-- Improvement Updates
(
  'changelog',
  'improvement', 
  '对话界面优化',
  '我们优化了聊天界面的响应速度和用户体验，包括更快的消息加载、改进的文件上传和更好的移动端适配。',
  'medium',
  '{}',
  '{}',
  true,
  now() - interval '2 days',
  '{"version": "v2.0.5", "affected_areas": ["chat", "mobile", "file-upload"]}'
),

-- Bug Fix Notifications
(
  'changelog',
  'bugfix',
  '修复消息同步问题',
  '修复了在某些情况下聊天消息无法正确同步的问题，现在所有设备上的消息都能保持一致。',
  'medium',
  '{}',
  '{}',
  true,
  now() - interval '5 days',
  '{"version": "v2.0.4", "bug_id": "BUG-2024-156"}'
),

-- Security Updates
(
  'changelog',
  'security',
  '安全性增强更新',
  '本次更新包含重要的安全性改进，建议所有用户及时更新。更新内容包括身份验证加强和数据传输加密优化。',
  'critical',
  '{}',
  '{}',
  true,
  now() - interval '1 week',
  '{"version": "v2.0.3", "cve_fixes": ["CVE-2024-001", "CVE-2024-002"]}'
);

-- ============================================================================
-- Sample Message Notifications
-- ============================================================================

INSERT INTO public.notifications (
  type, category, title, content, priority, target_roles, target_users, 
  published, published_at, metadata
) VALUES 
-- Admin Announcements
(
  'message',
  'admin_announcement',
  '系统维护通知',
  '我们计划在今晚 23:00-01:00 进行系统维护，届时服务可能会短暂中断。请提前保存您的工作。维护期间如有紧急问题，请联系技术支持。',
  'high',
  '{}',
  '{}',
  true,
  now() - interval '2 hours',
  '{"maintenance_window": "2024-08-22 23:00:00+00:00 to 2024-08-23 01:00:00+00:00", "contact": "support@agentifui.com"}'
),

-- Token Usage Warnings (for all users)
(
  'message',
  'token_usage',
  'Token使用量提醒',
  '您的Token使用量已达到月度限额的 80%，请注意合理使用以避免超出限制。您可以在设置中查看详细的使用统计。',
  'medium',
  '{"user"}',
  '{}',
  true,
  now() - interval '1 day',
  '{"usage_percentage": 80, "limit_reset_date": "2024-09-01", "upgrade_available": true}'
),

-- Agent Execution Results (for specific users)
(
  'message', 
  'agent_result',
  'Agent执行完成',
  'Agent "数据分析助手" 已成功执行完成，耗时 2分35秒。生成的报告已保存到您的工作区，您可以随时查看和下载。',
  'low',
  '{}',
  '{}', -- Will be filled with actual user IDs in practice
  true,
  now() - interval '30 minutes',
  '{"agent_name": "数据分析助手", "execution_time": "2m35s", "result_url": "/workspace/reports/analysis-20240822.pdf"}'
),

-- Feature Tips
(
  'message',
  'feature_tip',
  '新功能提示：批量对话导出',
  '您知道吗？现在您可以一键导出多个对话记录。在对话历史页面选择多个对话，然后点击"批量导出"按钮即可将它们保存为PDF或Markdown格式。',
  'low',
  '{}',
  '{}',
  true,
  now() - interval '3 days',
  '{"feature": "batch_export", "tutorial_url": "/help/batch-export", "dismiss_after_days": 7}'
),

-- Security Alerts (for admins only)
(
  'message',
  'security_alert',
  '异常登录检测',
  '系统检测到有用户账户存在异常登录行为。建议您检查用户管理面板并采取必要的安全措施。详细信息已发送到管理员邮箱。',
  'critical',
  '{"admin"}',
  '{}',
  true,
  now() - interval '1 hour',
  '{"alert_id": "SEC-2024-0822-001", "affected_users": 3, "source_ips": ["192.168.1.100", "10.0.0.50"], "action_required": true}'
);

-- ============================================================================
-- Sample Draft Notifications (Unpublished)
-- ============================================================================

INSERT INTO public.notifications (
  type, category, title, content, priority, target_roles, target_users, 
  published, published_at, metadata
) VALUES 
-- Draft announcement
(
  'message',
  'admin_announcement',
  '下周功能发布预告',
  '我们即将在下周发布一些令人兴奋的新功能，包括增强的AI对话能力、新的文件处理选项和改进的用户界面。敬请期待！',
  'medium',
  '{}',
  '{}',
  false,
  null,
  '{"scheduled_publish": "2024-08-29 10:00:00+00:00", "draft_version": 1}'
),

-- Draft changelog entry
(
  'changelog',
  'feature',
  'AI模型升级至GPT-4.5',
  '我们正在测试最新的GPT-4.5模型集成，这将为用户带来更智能、更准确的对话体验。新模型在理解复杂查询和生成高质量回答方面有显著改进。',
  'high',
  '{}',
  '{}',
  false,
  null,
  '{"version": "v2.2.0", "testing_phase": "alpha", "rollout_plan": "gradual"}'
);

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.notifications IS 'Contains sample notification data for testing the notification center system';

-- Note: In a real application, you would:
-- 1. Replace target_users empty arrays with actual user UUIDs
-- 2. Set created_by to actual admin user IDs
-- 3. Use more realistic timestamps
-- 4. Customize content for your specific use case