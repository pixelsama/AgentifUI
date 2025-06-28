'use client';

import { InstanceFilterSelector } from '@components/admin/api-config/instance-filter-selector';
import { useTheme } from '@lib/hooks/use-theme';
import {
  ServiceInstance,
  useApiConfigStore,
} from '@lib/stores/api-config-store';
import { cn } from '@lib/utils';
import {
  Bot,
  Database,
  FileText,
  Globe,
  Key,
  Loader2,
  MessageSquare,
  Plus,
  Settings,
  Star,
  StarOff,
  Trash2,
  Workflow,
  Zap,
} from 'lucide-react';

import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ApiConfigLayoutProps {
  children: ReactNode;
}

// --- BEGIN COMMENT ---
// 根据Dify应用类型获取对应图标
// --- END COMMENT ---
const getAppTypeIcon = (difyAppType?: string) => {
  switch (difyAppType) {
    case 'chatbot':
      return MessageSquare;
    case 'agent':
      return Bot;
    case 'chatflow':
      return Workflow;
    case 'workflow':
      return Settings;
    case 'text-generation':
      return FileText;
    default:
      return Globe;
  }
};

// --- BEGIN COMMENT ---
// 根据Dify应用类型获取类型标签和颜色
// --- END COMMENT ---
const getAppTypeInfo = (difyAppType?: string) => {
  switch (difyAppType) {
    case 'chatbot':
      return { label: '聊天助手', color: 'emerald' };
    case 'agent':
      return { label: '智能代理', color: 'violet' };
    case 'chatflow':
      return { label: '对话流', color: 'amber' };
    case 'workflow':
      return { label: '工作流', color: 'rose' };
    case 'text-generation':
      return { label: '文本生成', color: 'cyan' };
    default:
      return { label: '应用', color: 'stone' };
  }
};

export default function ApiConfigLayout({ children }: ApiConfigLayoutProps) {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    serviceInstances: instances,
    apiKeys,
    providers,
    isLoading: instancesLoading,
    loadConfigData: loadInstances,
    deleteAppInstance: deleteInstance,
    setDefaultInstance,
  } = useApiConfigStore();

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );

  // --- BEGIN COMMENT ---
  // 从URL查询参数获取筛选状态
  // --- END COMMENT ---
  const [filterProviderId, setFilterProviderId] = useState<string | null>(
    () => {
      return searchParams.get('provider') || null;
    }
  );

  // --- BEGIN COMMENT ---
  // 初始化数据加载
  // --- END COMMENT ---
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      loadInstances().finally(() => {
        setHasInitiallyLoaded(true);
      });
    }
  }, [hasInitiallyLoaded, loadInstances]);

  // --- BEGIN COMMENT ---
  // 处理筛选变化并同步URL
  // --- END COMMENT ---
  const handleFilterChange = (providerId: string | null) => {
    // 如果值没有变化，直接返回
    if (providerId === filterProviderId) return;

    setFilterProviderId(providerId);

    // 立即更新URL查询参数，不使用startTransition避免延迟
    const params = new URLSearchParams(searchParams.toString());
    if (providerId) {
      params.set('provider', providerId);
    } else {
      params.delete('provider');
    }

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });

    // --- BEGIN COMMENT ---
    // 通知page组件筛选状态变化，用于新建应用时自动设置提供商
    // --- END COMMENT ---
    window.dispatchEvent(
      new CustomEvent('filterChanged', {
        detail: { providerId },
      })
    );
  };

  // --- BEGIN COMMENT ---
  // 监听URL变化同步筛选状态（优化避免循环）
  // --- END COMMENT ---
  useEffect(() => {
    const urlProviderId = searchParams.get('provider');
    // 只在真正不同时才更新，避免循环
    if (urlProviderId !== filterProviderId) {
      setFilterProviderId(urlProviderId);
      // 同步通知page组件
      window.dispatchEvent(
        new CustomEvent('filterChanged', {
          detail: { providerId: urlProviderId },
        })
      );
    }
  }, [searchParams]); // 移除filterProviderId依赖，避免循环

  // --- BEGIN COMMENT ---
  // 🎯 根据筛选条件过滤应用实例
  // --- END COMMENT ---
  const filteredInstances = useMemo(() => {
    if (!filterProviderId) {
      return instances; // 显示全部
    }
    return instances.filter(
      instance => instance.provider_id === filterProviderId
    );
  }, [instances, filterProviderId]);

  // --- BEGIN COMMENT ---
  // 监听page组件的状态变化，完全同步page的表单状态
  // --- END COMMENT ---
  useEffect(() => {
    const handleAddFormToggled = (event: CustomEvent) => {
      const { showAddForm: newShowAddForm, selectedInstance } = event.detail;
      setShowAddForm(newShowAddForm);
      // --- BEGIN COMMENT ---
      // 当显示添加表单时，清除所有选中状态
      // 当显示编辑表单时，设置对应的选中状态
      // --- END COMMENT ---
      if (newShowAddForm) {
        setSelectedInstanceId(null);
      } else if (selectedInstance) {
        setSelectedInstanceId(selectedInstance.instance_id);
      } else {
        setSelectedInstanceId(null);
      }
    };

    const handleSetInstanceAsDefault = (event: CustomEvent) => {
      const { instanceId } = event.detail;
      handleSetDefaultInstance(instanceId);
    };

    const handleDirectSetDefault = (event: CustomEvent) => {
      const { instanceId } = event.detail;
      // --- 统一逻辑：直接调用相同的函数 ---
      handleSetDefaultInstance(instanceId);
    };

    const handleReloadInstances = () => {
      // 重新加载服务实例数据
      loadInstances();
    };

    const handleReloadProviders = () => {
      // 重新加载providers数据
      loadInstances(); // 这会同时加载providers和instances
    };

    window.addEventListener(
      'addFormToggled',
      handleAddFormToggled as EventListener
    );
    window.addEventListener(
      'setInstanceAsDefault',
      handleSetInstanceAsDefault as EventListener
    );
    window.addEventListener(
      'directSetDefault',
      handleDirectSetDefault as EventListener
    );
    window.addEventListener('reloadInstances', handleReloadInstances);
    window.addEventListener('reloadProviders', handleReloadProviders);

    return () => {
      window.removeEventListener(
        'addFormToggled',
        handleAddFormToggled as EventListener
      );
      window.removeEventListener(
        'setInstanceAsDefault',
        handleSetInstanceAsDefault as EventListener
      );
      window.removeEventListener(
        'directSetDefault',
        handleDirectSetDefault as EventListener
      );
      window.removeEventListener('reloadInstances', handleReloadInstances);
      window.removeEventListener('reloadProviders', handleReloadProviders);
    };
  }, []);

  const handleDeleteInstance = async (instanceId: string) => {
    const instanceToDelete = instances.find(
      inst => inst.instance_id === instanceId
    );
    if (!instanceToDelete) {
      alert('未找到要删除的实例');
      return;
    }

    // --- 检查是否为默认应用 ---
    if (instanceToDelete.is_default) {
      alert('默认应用不可删除，请先设置其他应用为默认应用');
      return;
    }

    if (!confirm('确定要删除此应用实例吗？此操作不可撤销。')) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteInstance(instanceToDelete.id);

      // --- BEGIN COMMENT ---
      // 通知page组件实例被删除
      // --- END COMMENT ---
      window.dispatchEvent(
        new CustomEvent('instanceDeleted', {
          detail: { instanceId },
        })
      );
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除应用实例失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefaultInstance = async (instanceId: string) => {
    // --- 添加调试信息 ---
    console.log('设置默认应用 - 传入ID:', instanceId);
    console.log(
      '当前所有实例:',
      instances.map(inst => ({
        id: inst.id,
        instance_id: inst.instance_id,
        display_name: inst.display_name,
      }))
    );

    // --- 修复：使用数据库ID查找实例 ---
    const instanceToSet = instances.find(inst => inst.id === instanceId);
    if (!instanceToSet) {
      console.error('未找到实例，传入ID:', instanceId);
      alert('未找到要设置的实例');
      return;
    }

    console.log('找到实例:', instanceToSet);

    if (instanceToSet.is_default) {
      return; // 已经是默认应用，无需操作
    }

    if (
      !confirm(
        `确定要将"${instanceToSet.display_name || '此应用'}"设置为默认应用吗？`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await setDefaultInstance(instanceToSet.id);

      // --- BEGIN COMMENT ---
      // 通知page组件默认应用已更改
      // --- END COMMENT ---
      window.dispatchEvent(
        new CustomEvent('defaultInstanceChanged', {
          detail: { instanceId },
        })
      );
    } catch (error) {
      console.error('设置默认应用失败:', error);
      alert('设置默认应用失败');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* --- BEGIN COMMENT ---
      左侧导航：固定宽度，从admin导航栏下方开始
      --- END COMMENT --- */}
      <div
        className={cn(
          'fixed left-16 z-40 flex w-80 flex-shrink-0 flex-col',
          'top-12 bottom-0'
        )}
      >
        {/* 头部：不需要额外的顶部间距，因为已经从正确位置开始 */}
        <div
          className={cn(
            'flex-shrink-0 border-b p-2',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-stone-100'
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            {/* --- BEGIN COMMENT ---
            使用新的筛选选择器替换原有的标题
            --- END COMMENT --- */}
            <InstanceFilterSelector
              providers={providers}
              selectedProviderId={filterProviderId}
              onFilterChange={handleFilterChange}
              instanceCount={filteredInstances.length}
              isLoading={!hasInitiallyLoaded && instancesLoading}
            />

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggleAddForm'));
              }}
              className={cn(
                'cursor-pointer rounded-lg p-1.5 transition-all duration-200',
                'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                showAddForm
                  ? isDark
                    ? 'bg-stone-500 text-stone-100 focus:ring-stone-400'
                    : 'bg-stone-400 text-white focus:ring-stone-300'
                  : isDark
                    ? 'bg-stone-600 text-stone-200 hover:bg-stone-500 hover:text-stone-100 focus:ring-stone-500'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300 hover:text-stone-900 focus:ring-stone-400'
              )}
            >
              <Plus
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  showAddForm && 'rotate-45'
                )}
              />
            </button>
          </div>
        </div>

        {/* 列表：独立滚动区域 */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto',
            isDark ? 'bg-stone-800' : 'bg-stone-100'
          )}
        >
          {!hasInitiallyLoaded && instancesLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-stone-400" />
              <p
                className={cn(
                  'font-serif text-sm',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                加载应用实例中...
              </p>
            </div>
          ) : filteredInstances.length === 0 ? (
            <div className="p-4 text-center">
              <Database className="mx-auto mb-3 h-12 w-12 text-stone-400" />
              <p
                className={cn(
                  'font-serif text-sm',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                {filterProviderId ? '该提供商暂无应用实例' : '暂无应用实例'}
              </p>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('toggleAddForm'));
                }}
                className={cn(
                  'mt-2 cursor-pointer font-serif text-sm transition-colors',
                  isDark
                    ? 'text-stone-300 hover:text-stone-100'
                    : 'text-stone-600 hover:text-stone-800'
                )}
              >
                添加第一个应用
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filteredInstances.map(instance => {
                const difyAppType = instance.config?.app_metadata?.dify_apptype;
                const AppIcon = getAppTypeIcon(difyAppType);
                const typeInfo = getAppTypeInfo(difyAppType);
                const provider = providers.find(
                  p => p.id === instance.provider_id
                );

                return (
                  <div
                    key={instance.instance_id}
                    className={cn(
                      'group relative cursor-pointer rounded-xl p-3',
                      'transition-all duration-200 ease-in-out',
                      'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                      'border backdrop-blur-sm',
                      // 固定高度保持一致性
                      'flex h-20 flex-col justify-between',
                      selectedInstanceId === instance.instance_id
                        ? isDark
                          ? 'border-stone-400 bg-stone-700/80 shadow-xl focus:ring-stone-400'
                          : 'border-stone-400 bg-white shadow-lg focus:ring-stone-300'
                        : isDark
                          ? 'border-stone-600/70 bg-stone-800/70 hover:border-stone-500 hover:bg-stone-700/80 hover:shadow-lg focus:ring-stone-500'
                          : 'border-stone-300/80 bg-white/90 hover:border-stone-400 hover:bg-white hover:shadow-md focus:ring-stone-300'
                    )}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('selectInstance', {
                          detail: instance,
                        })
                      );
                    }}
                    tabIndex={0}
                  >
                    {/* 主要内容区域 */}
                    <div className="flex h-full items-start justify-between">
                      <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                        {/* 顶部：应用名称和图标 */}
                        <div className="flex items-center gap-2">
                          <AppIcon
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              isDark ? 'text-stone-300' : 'text-stone-600'
                            )}
                          />
                          <h3
                            className={cn(
                              'truncate font-serif text-sm font-medium',
                              isDark ? 'text-stone-100' : 'text-stone-900'
                            )}
                          >
                            {instance.display_name}
                          </h3>

                          {/* 默认应用标签 */}
                          {instance.is_default && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-serif text-xs font-medium',
                                isDark
                                  ? 'border border-amber-800/40 bg-amber-900/30 text-amber-300'
                                  : 'border border-amber-200 bg-amber-100 text-amber-800'
                              )}
                            >
                              <Star className="h-2.5 w-2.5" />
                              默认
                            </span>
                          )}
                        </div>

                        {/* 底部：类型和提供商信息（低调显示） */}
                        <div className="flex items-center gap-2 text-xs">
                          {/* 应用类型原始值 */}
                          {difyAppType && (
                            <span
                              className={cn(
                                'font-serif',
                                isDark ? 'text-stone-500' : 'text-stone-500'
                              )}
                            >
                              {difyAppType}
                            </span>
                          )}

                          {/* 分隔符 */}
                          {difyAppType && provider && (
                            <span className={cn('text-stone-500')}>·</span>
                          )}

                          {/* 提供商信息 */}
                          {provider && (
                            <span
                              className={cn(
                                'font-serif',
                                isDark ? 'text-stone-500' : 'text-stone-500'
                              )}
                            >
                              {provider.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 右侧操作按钮 */}
                      <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* 设置默认应用按钮 */}
                        {!instance.is_default && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleSetDefaultInstance(instance.id);
                            }}
                            disabled={isProcessing}
                            className={cn(
                              'cursor-pointer rounded-lg p-1.5 transition-colors',
                              'focus:ring-2 focus:ring-offset-1 focus:outline-none',
                              isDark
                                ? 'text-stone-400 hover:bg-stone-600 hover:text-amber-300 focus:ring-amber-500'
                                : 'text-stone-500 hover:bg-amber-100 hover:text-amber-700 focus:ring-amber-300',
                              isProcessing && 'cursor-not-allowed opacity-50'
                            )}
                            title="设为默认应用"
                          >
                            <StarOff className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* 删除按钮 */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteInstance(instance.instance_id);
                          }}
                          disabled={isProcessing || instance.is_default}
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'focus:ring-2 focus:ring-offset-1 focus:outline-none',
                            instance.is_default
                              ? 'cursor-not-allowed text-stone-400 opacity-30'
                              : cn(
                                  'cursor-pointer',
                                  isDark
                                    ? 'text-stone-400 hover:bg-red-900/40 hover:text-red-300 focus:ring-red-500'
                                    : 'text-stone-500 hover:bg-red-100 hover:text-red-700 focus:ring-red-300'
                                ),
                            isProcessing &&
                              !instance.is_default &&
                              'cursor-not-allowed opacity-50'
                          )}
                          title={
                            instance.is_default ? '默认应用不可删除' : '删除'
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      分割线：从admin导航栏下方开始的全高度垂直分割线
      --- END COMMENT --- */}
      <div
        className={cn(
          'fixed left-96 z-40 w-px',
          'top-12 bottom-0',
          isDark ? 'bg-stone-700' : 'bg-stone-200'
        )}
      ></div>

      {/* --- BEGIN COMMENT ---
      右侧内容区域：调整左边距以适应固定侧边栏
      --- END COMMENT --- */}
      <div className="ml-80 h-full flex-1 overflow-hidden pl-px">
        {children}
      </div>
    </div>
  );
}
