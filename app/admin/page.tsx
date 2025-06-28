'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Key,
  Menu,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  stats?: string;
}

function AdminCard({
  title,
  description,
  icon: Icon,
  href,
  stats,
}: AdminCardProps) {
  const { isDark } = useTheme();

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
        isDark
          ? 'hover:bg-stone-750 border-stone-700 bg-stone-800 hover:border-stone-600'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-stone-200/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isDark ? 'text-stone-300' : 'text-stone-600'
                )}
              />
            </div>
            <h3
              className={cn(
                'text-lg font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              {title}
            </h3>
          </div>

          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            {description}
          </p>

          {stats && (
            <div
              className={cn(
                'text-xs font-medium',
                isDark ? 'text-stone-500' : 'text-stone-500'
              )}
            >
              {stats}
            </div>
          )}
        </div>

        <ArrowRight
          className={cn(
            'h-5 w-5 transition-transform group-hover:translate-x-1',
            isDark ? 'text-stone-400' : 'text-stone-400'
          )}
        />
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const { isDark } = useTheme();
  const [apiConfigStatus, setApiConfigStatus] = useState<string>('检查中...');

  // --- BEGIN COMMENT ---
  // 检查API配置状态
  // --- END COMMENT ---
  useEffect(() => {
    const checkApiConfigStatus = async () => {
      try {
        // 检查是否有配置的服务实例
        const response = await fetch('/api/admin/status');
        if (response.ok) {
          const data = await response.json();
          setApiConfigStatus(data.hasActiveInstances ? '已配置' : '待配置');
        } else {
          setApiConfigStatus('待配置');
        }
      } catch (error) {
        console.error('检查API配置状态失败:', error);
        setApiConfigStatus('待配置');
      }
    };

    checkApiConfigStatus();
  }, []);

  // --- BEGIN COMMENT ---
  // 管理功能卡片配置
  // --- END COMMENT ---
  const adminCards: AdminCardProps[] = [
    {
      title: 'API 配置',
      description: '管理应用实例、配置参数和API密钥',
      icon: Key,
      href: '/admin/api-config',
      stats: `当前状态: ${apiConfigStatus}`,
    },
    {
      title: '关于与通知',
      description: '管理About页面内容和系统通知推送',
      icon: Bell,
      href: '/admin/content',
      stats: '功能可用',
    },
    {
      title: '用户管理',
      description: '管理用户账户、权限和访问控制',
      icon: Users,
      href: '/admin/users',
      stats: '功能可用',
    },
    {
      title: '组织管理',
      description: '管理组织结构、部门和成员关系',
      icon: Building2,
      href: '/admin/organizations',
      stats: '功能可用',
    },
    {
      title: '数据统计',
      description: '查看使用情况、性能指标和分析报告',
      icon: BarChart3,
      href: '/admin/analytics',
      stats: '即将推出',
    },
    {
      title: '安全设置',
      description: '配置安全策略、审计日志和访问控制',
      icon: Shield,
      href: '/admin/security',
      stats: '即将推出',
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl p-6">
        {/* --- BEGIN COMMENT ---
        页面标题和描述
        --- END COMMENT --- */}
        <div className="mb-8">
          <h1
            className={cn(
              'mb-2 text-3xl font-bold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            管理后台概览
          </h1>
          <p
            className={cn(
              'text-lg',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            欢迎使用 AgentifUI 管理后台，在这里您可以管理系统的各项配置和设置。
          </p>
        </div>

        {/* --- BEGIN COMMENT ---
        快速状态概览
        --- END COMMENT --- */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            className={cn(
              'rounded-lg border p-4',
              isDark
                ? 'border-stone-700 bg-stone-800'
                : 'border-stone-200 bg-white'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                >
                  系统状态
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    isDark ? 'text-green-400' : 'text-green-600'
                  )}
                >
                  正常运行
                </p>
              </div>
              <div className={cn('h-3 w-3 rounded-full', 'bg-green-500')} />
            </div>
          </div>

          <div
            className={cn(
              'rounded-lg border p-4',
              isDark
                ? 'border-stone-700 bg-stone-800'
                : 'border-stone-200 bg-white'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                >
                  API 连接
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    isDark ? 'text-stone-300' : 'text-stone-700'
                  )}
                >
                  已连接
                </p>
              </div>
              <div className={cn('h-3 w-3 rounded-full', 'bg-stone-500')} />
            </div>
          </div>

          <div
            className={cn(
              'rounded-lg border p-4',
              isDark
                ? 'border-stone-700 bg-stone-800'
                : 'border-stone-200 bg-white'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                >
                  版本信息
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    isDark ? 'text-stone-100' : 'text-stone-900'
                  )}
                >
                  v1.0.0
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- BEGIN COMMENT ---
        管理功能卡片网格
        --- END COMMENT --- */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {adminCards.map(card => (
            <AdminCard
              key={card.href}
              title={card.title}
              description={card.description}
              icon={card.icon}
              href={card.href}
              stats={card.stats}
            />
          ))}
        </div>

        {/* --- BEGIN COMMENT ---
        快速操作区域
        --- END COMMENT --- */}
        <div
          className={cn(
            'mt-8 border-t pt-8',
            isDark ? 'border-stone-700' : 'border-stone-200'
          )}
        >
          <h2
            className={cn(
              'mb-4 text-xl font-semibold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            快速操作
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/api-config"
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isDark
                  ? 'bg-stone-700 text-stone-100 hover:bg-stone-600'
                  : 'bg-stone-800 text-white hover:bg-stone-700'
              )}
            >
              配置 API
            </Link>
            <Link
              href="/chat"
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                isDark
                  ? 'border-stone-600 text-stone-300 hover:bg-stone-800'
                  : 'border-stone-300 text-stone-700 hover:bg-stone-50'
              )}
            >
              返回对话
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
