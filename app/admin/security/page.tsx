'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { AlertTriangle, Eye, FileText, Key, Lock, Shield } from 'lucide-react';

import React from 'react';

export default function SecurityPage() {
  const { isDark } = useTheme();

  return (
    <div className="p-6">
      {/* --- BEGIN COMMENT ---
      页面标题区域
      --- END COMMENT --- */}
      <div className="mb-8">
        <h1
          className={cn(
            'mb-2 text-2xl font-bold',
            isDark ? 'text-stone-100' : 'text-stone-900'
          )}
        >
          安全设置
        </h1>
        <p
          className={cn(
            'text-sm',
            isDark ? 'text-stone-400' : 'text-stone-600'
          )}
        >
          配置系统安全策略、访问控制和审计日志
        </p>
      </div>

      {/* --- BEGIN COMMENT ---
      安全状态概览
      --- END COMMENT --- */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-green-900/30' : 'bg-green-100'
              )}
            >
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              系统安全
            </h3>
          </div>
          <p className="mb-1 text-2xl font-bold text-green-500">良好</p>
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            所有安全检查通过
          </p>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'
              )}
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              风险警告
            </h3>
          </div>
          <p className="mb-1 text-2xl font-bold text-yellow-500">2</p>
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            需要关注的安全事项
          </p>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Eye className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              活跃会话
            </h3>
          </div>
          <p
            className={cn(
              'mb-1 text-2xl font-bold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            24
          </p>
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            当前在线用户
          </p>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      安全功能卡片
      --- END COMMENT --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          className={cn(
            'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
            isDark
              ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
              : 'border-stone-200 bg-white hover:border-stone-300'
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Lock className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              访问控制
            </h3>
          </div>
          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            管理用户权限和访问策略
          </p>
          <button
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            )}
          >
            配置权限
          </button>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
            isDark
              ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
              : 'border-stone-200 bg-white hover:border-stone-300'
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Key className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              API 密钥
            </h3>
          </div>
          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            管理和轮换 API 访问密钥
          </p>
          <button
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            )}
          >
            管理密钥
          </button>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
            isDark
              ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
              : 'border-stone-200 bg-white hover:border-stone-300'
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <FileText className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              审计日志
            </h3>
          </div>
          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            查看系统操作和安全事件
          </p>
          <button
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            )}
          >
            查看日志
          </button>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
            isDark
              ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
              : 'border-stone-200 bg-white hover:border-stone-300'
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Shield className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              防火墙规则
            </h3>
          </div>
          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            配置网络访问和IP白名单
          </p>
          <button
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            )}
          >
            配置规则
          </button>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
            isDark
              ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
              : 'border-stone-200 bg-white hover:border-stone-300'
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              威胁检测
            </h3>
          </div>
          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            监控异常行为和安全威胁
          </p>
          <button
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            )}
          >
            查看威胁
          </button>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
            isDark
              ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
              : 'border-stone-200 bg-white hover:border-stone-300'
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Eye className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              会话管理
            </h3>
          </div>
          <p
            className={cn(
              'mb-4 text-sm',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          >
            管理用户会话和登录状态
          </p>
          <button
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            )}
          >
            管理会话
          </button>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      开发中提示
      --- END COMMENT --- */}
      <div
        className={cn(
          'mt-8 rounded-lg border-2 border-dashed p-4',
          isDark
            ? 'border-stone-700 bg-stone-800/50'
            : 'border-stone-300 bg-stone-50'
        )}
      >
        <p
          className={cn(
            'text-center text-sm',
            isDark ? 'text-stone-400' : 'text-stone-600'
          )}
        >
          🔒 安全功能正在开发中，敬请期待
        </p>
      </div>
    </div>
  );
}
