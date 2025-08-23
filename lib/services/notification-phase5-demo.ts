/**
 * Phase 5 Integration Demo
 *
 * Demonstrates the smart linking mechanism between NotificationBar and NotificationCenter
 * This file can be used for testing and showcasing the Phase 5 features
 */
import { NotificationArchivingService } from './notification-archiving-service';
import { NotificationBridgeService } from './notification-bridge-service';
import { NotificationPushStrategyService } from './notification-push-strategy';

/**
 * Demo scenarios for Phase 5 features
 */
export class NotificationPhase5Demo {
  /**
   * Demo 1: Critical Security Alert
   */
  static async demoCriticalAlert() {
    console.log('🚨 Demo: Critical Security Alert');

    await NotificationBridgeService.showCriticalAlert(
      '安全警告：检测到异常登录',
      '系统检测到您的账户在异地登录，如非本人操作请立即修改密码。\n\n登录位置：北京\n登录时间：2024-01-20 14:30:00\n设备：Chrome/Windows'
    );
  }

  /**
   * Demo 2: System Maintenance Notice
   */
  static async demoMaintenanceNotice() {
    console.log('🔧 Demo: System Maintenance Notice');

    await NotificationBridgeService.showMaintenanceNotice(
      '系统维护通知',
      '系统将于今晚23:00-01:00进行例行维护，期间服务可能暂时中断，请提前保存您的工作。',
      '2024-01-20 23:00 - 01:00'
    );
  }

  /**
   * Demo 3: Feature Announcement
   */
  static async demoFeatureAnnouncement() {
    console.log('✨ Demo: New Feature Announcement');

    await NotificationBridgeService.showFeatureAnnouncement(
      'AI 助手升级',
      '我们很高兴地宣布AI助手已升级到新版本！\n\n新功能包括：\n• 更快的响应速度\n• 支持更多文件格式\n• 增强的代码生成能力\n• 改进的对话记忆\n\n立即体验新功能吧！',
      'feature'
    );
  }

  /**
   * Demo 4: Agent Execution Result
   */
  static async demoAgentResult(success: boolean = true) {
    console.log(`🤖 Demo: Agent Result (${success ? 'Success' : 'Failed'})`);

    if (success) {
      await NotificationBridgeService.showAgentResult(
        'DataAnalyzer',
        true,
        '成功分析了1000条数据记录，生成了详细的统计报告。发现3个关键趋势和5个异常值。',
        '2分38秒'
      );
    } else {
      await NotificationBridgeService.showAgentResult(
        'DataAnalyzer',
        false,
        '数据分析失败：输入文件格式不支持。请确保上传CSV或Excel文件。',
        '15秒'
      );
    }
  }

  /**
   * Demo 5: Token Usage Warning
   */
  static async demoTokenWarning() {
    console.log('⚠️ Demo: Token Usage Warning');

    await NotificationBridgeService.showTokenWarning(9500, 10000, 95);
  }

  /**
   * Demo 6: Push Strategy Testing
   */
  static async demoPushStrategies() {
    console.log('📢 Demo: Push Strategy Testing');

    // Test different priority levels
    await NotificationPushStrategyService.pushNotification(
      '低优先级信息：功能使用提示',
      'info',
      'low'
    );

    setTimeout(async () => {
      await NotificationPushStrategyService.pushNotification(
        '中等优先级：系统更新完成',
        'success',
        'medium'
      );
    }, 2000);

    setTimeout(async () => {
      await NotificationPushStrategyService.pushNotification(
        '高优先级：磁盘空间不足',
        'warning',
        'high',
        {
          action: {
            text: '清理空间',
            handler: () => console.log('Opening disk cleanup...'),
            variant: 'primary',
          },
        }
      );
    }, 4000);

    setTimeout(async () => {
      await NotificationPushStrategyService.pushNotification(
        '严重错误：数据库连接失败',
        'error',
        'critical',
        {
          action: {
            text: '重试连接',
            handler: () => console.log('Retrying database connection...'),
            variant: 'primary',
          },
          category: 'security_alert',
        }
      );
    }, 6000);
  }

  /**
   * Demo 7: Archiving System
   */
  static async demoArchivingSystem() {
    console.log('📁 Demo: Archiving System');

    // Queue some notifications for archiving
    NotificationArchivingService.queueForArchiving(
      '系统错误：无法连接到外部API',
      'error',
      'security_alert',
      'high'
    );

    NotificationArchivingService.queueForArchiving(
      '系统警告：内存使用率超过90%',
      'warning',
      'system_maintenance',
      'medium'
    );

    // Show queue status
    const status = NotificationArchivingService.getQueueStatus();
    console.log('Archive queue status:', status);

    // Manually archive a notification
    await NotificationArchivingService.manualArchive(
      '手动归档测试：这是一个手动归档的通知',
      'info',
      'feature_tip',
      'low'
    );
  }

  /**
   * Demo 8: Complex Workflow
   */
  static async demoComplexWorkflow() {
    console.log('🔄 Demo: Complex Workflow');

    // Simulate a complex workflow with multiple notification types

    // Step 1: Start process
    await NotificationPushStrategyService.pushNotification(
      '开始数据处理流程',
      'info',
      'low'
    );

    // Step 2: Progress update
    setTimeout(async () => {
      await NotificationPushStrategyService.pushNotification(
        '数据处理进度：50%',
        'info',
        'low'
      );
    }, 3000);

    // Step 3: Warning during process
    setTimeout(async () => {
      await NotificationPushStrategyService.pushNotification(
        '注意：检测到部分数据异常',
        'warning',
        'medium',
        {
          action: {
            text: '查看详情',
            handler: () => console.log('Opening data anomaly details...'),
          },
        }
      );
    }, 6000);

    // Step 4: Successful completion
    setTimeout(async () => {
      await NotificationBridgeService.createNotificationWithAlert(
        {
          type: 'message',
          category: 'agent_result',
          title: '数据处理完成',
          content:
            '数据处理流程已成功完成。\n\n处理结果：\n• 总记录数：10,000\n• 有效记录：9,856\n• 异常记录：144\n• 处理时间：3分42秒\n\n详细报告已生成，可在结果页面查看。',
          priority: 'medium',
        },
        '数据处理已完成，点击查看详细报告',
        'success'
      );
    }, 9000);
  }

  /**
   * Run all demos in sequence
   */
  static async runAllDemos() {
    console.log('🎬 Starting Phase 5 Demo Sequence...');

    const demos = [
      { name: 'Critical Alert', fn: this.demoCriticalAlert },
      { name: 'Maintenance Notice', fn: this.demoMaintenanceNotice },
      { name: 'Feature Announcement', fn: this.demoFeatureAnnouncement },
      { name: 'Agent Success', fn: () => this.demoAgentResult(true) },
      { name: 'Agent Failure', fn: () => this.demoAgentResult(false) },
      { name: 'Token Warning', fn: this.demoTokenWarning },
      { name: 'Push Strategies', fn: this.demoPushStrategies },
      { name: 'Archiving System', fn: this.demoArchivingSystem },
      { name: 'Complex Workflow', fn: this.demoComplexWorkflow },
    ];

    for (let i = 0; i < demos.length; i++) {
      const demo = demos[i];
      console.log(
        `\n--- Running Demo ${i + 1}/${demos.length}: ${demo.name} ---`
      );

      try {
        await demo.fn.call(this);
        console.log(`✅ Demo ${demo.name} completed successfully`);
      } catch (error) {
        console.error(`❌ Demo ${demo.name} failed:`, error);
      }

      // Wait between demos to avoid overwhelming the UI
      if (i < demos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('\n🎉 All Phase 5 demos completed!');
  }

  /**
   * Get demo statistics
   */
  static getStatistics() {
    return {
      archiveService: NotificationArchivingService.getQueueStatus(),
      pushStrategy: NotificationPushStrategyService.getStatistics(),
    };
  }
}

/**
 * Quick access functions for testing individual features
 */
export const phase5Demo = {
  criticalAlert: () => NotificationPhase5Demo.demoCriticalAlert(),
  maintenance: () => NotificationPhase5Demo.demoMaintenanceNotice(),
  feature: () => NotificationPhase5Demo.demoFeatureAnnouncement(),
  agentSuccess: () => NotificationPhase5Demo.demoAgentResult(true),
  agentFailure: () => NotificationPhase5Demo.demoAgentResult(false),
  tokenWarning: () => NotificationPhase5Demo.demoTokenWarning(),
  pushStrategies: () => NotificationPhase5Demo.demoPushStrategies(),
  archiving: () => NotificationPhase5Demo.demoArchivingSystem(),
  workflow: () => NotificationPhase5Demo.demoComplexWorkflow(),
  all: () => NotificationPhase5Demo.runAllDemos(),
  stats: () => NotificationPhase5Demo.getStatistics(),
};

// Make demo available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as { phase5Demo: typeof phase5Demo }).phase5Demo =
    phase5Demo;
  console.log('Phase 5 demo functions available at window.phase5Demo');
  console.log('Try: phase5Demo.criticalAlert(), phase5Demo.all(), etc.');
}

export default NotificationPhase5Demo;
