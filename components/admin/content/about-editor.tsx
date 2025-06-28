'use client';

import type { AboutPageConfig, ValueCard } from '@lib/config/about-config';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Plus, Trash2 } from 'lucide-react';

import React from 'react';

// --- BEGIN COMMENT ---
// 导出配置类型供其他组件使用
// --- END COMMENT ---
export type { AboutPageConfig, ValueCard };

interface AboutEditorProps {
  config: AboutPageConfig;
  onChange: (config: AboutPageConfig) => void;
}

export function AboutEditor({ config, onChange }: AboutEditorProps) {
  const { isDark } = useTheme();

  // --- BEGIN COMMENT ---
  // 添加新的价值观卡片
  // --- END COMMENT ---
  const addValueCard = () => {
    const newCard: ValueCard = {
      id: Date.now().toString(),
      title: '新价值观',
      description: '请输入价值观描述...',
    };
    onChange({
      ...config,
      valueCards: [...config.valueCards, newCard],
    });
  };

  // --- BEGIN COMMENT ---
  // 删除价值观卡片
  // --- END COMMENT ---
  const removeValueCard = (id: string) => {
    onChange({
      ...config,
      valueCards: config.valueCards.filter(card => card.id !== id),
    });
  };

  // --- BEGIN COMMENT ---
  // 更新价值观卡片
  // --- END COMMENT ---
  const updateValueCard = (
    id: string,
    field: keyof ValueCard,
    value: string
  ) => {
    onChange({
      ...config,
      valueCards: config.valueCards.map(card =>
        card.id === id ? { ...card, [field]: value } : card
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* --- BEGIN COMMENT ---
      标题设置
      --- END COMMENT --- */}
      <div>
        <label
          className={cn(
            'mb-2 block text-sm font-medium',
            isDark ? 'text-stone-300' : 'text-stone-700'
          )}
        >
          页面标题
        </label>
        <input
          type="text"
          value={config.title}
          onChange={e => onChange({ ...config, title: e.target.value })}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            isDark
              ? 'border-stone-600 bg-stone-700 text-stone-100'
              : 'border-stone-300 bg-white text-stone-900'
          )}
        />
      </div>

      {/* --- BEGIN COMMENT ---
      副标题设置
      --- END COMMENT --- */}
      <div>
        <label
          className={cn(
            'mb-2 block text-sm font-medium',
            isDark ? 'text-stone-300' : 'text-stone-700'
          )}
        >
          副标题
        </label>
        <input
          type="text"
          value={config.subtitle}
          onChange={e => onChange({ ...config, subtitle: e.target.value })}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            isDark
              ? 'border-stone-600 bg-stone-700 text-stone-100'
              : 'border-stone-300 bg-white text-stone-900'
          )}
        />
      </div>

      {/* --- BEGIN COMMENT ---
      使命描述
      --- END COMMENT --- */}
      <div>
        <label
          className={cn(
            'mb-2 block text-sm font-medium',
            isDark ? 'text-stone-300' : 'text-stone-700'
          )}
        >
          使命描述
        </label>
        <textarea
          value={config.mission}
          onChange={e => onChange({ ...config, mission: e.target.value })}
          rows={4}
          className={cn(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm',
            isDark
              ? 'border-stone-600 bg-stone-700 text-stone-100'
              : 'border-stone-300 bg-white text-stone-900'
          )}
        />
      </div>

      {/* --- BEGIN COMMENT ---
      价值观卡片管理
      --- END COMMENT --- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label
            className={cn(
              'block text-sm font-medium',
              isDark ? 'text-stone-300' : 'text-stone-700'
            )}
          >
            价值观卡片
          </label>
          <button
            onClick={addValueCard}
            className={cn(
              'rounded p-1 transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {config.valueCards.map((card, index) => (
            <div
              key={card.id}
              className={cn(
                'rounded-lg border p-3',
                isDark
                  ? 'border-stone-600 bg-stone-700'
                  : 'border-stone-200 bg-stone-50'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-medium',
                    isDark ? 'text-stone-400' : 'text-stone-500'
                  )}
                >
                  卡片 {index + 1}
                </span>
                <button
                  onClick={() => removeValueCard(card.id)}
                  className={cn(
                    'rounded p-1 transition-colors',
                    isDark
                      ? 'text-red-400 hover:bg-red-900/30'
                      : 'text-red-600 hover:bg-red-100'
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              <input
                type="text"
                value={card.title}
                onChange={e =>
                  updateValueCard(card.id, 'title', e.target.value)
                }
                placeholder="标题"
                className={cn(
                  'mb-2 w-full rounded border px-2 py-1 text-xs',
                  isDark
                    ? 'border-stone-500 bg-stone-800 text-stone-100'
                    : 'border-stone-300 bg-white text-stone-900'
                )}
              />

              <textarea
                value={card.description}
                onChange={e =>
                  updateValueCard(card.id, 'description', e.target.value)
                }
                placeholder="描述"
                rows={2}
                className={cn(
                  'w-full resize-none rounded border px-2 py-1 text-xs',
                  isDark
                    ? 'border-stone-500 bg-stone-800 text-stone-100'
                    : 'border-stone-300 bg-white text-stone-900'
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      按钮文案
      --- END COMMENT --- */}
      <div>
        <label
          className={cn(
            'mb-2 block text-sm font-medium',
            isDark ? 'text-stone-300' : 'text-stone-700'
          )}
        >
          按钮文案
        </label>
        <input
          type="text"
          value={config.buttonText}
          onChange={e => onChange({ ...config, buttonText: e.target.value })}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            isDark
              ? 'border-stone-600 bg-stone-700 text-stone-100'
              : 'border-stone-300 bg-white text-stone-900'
          )}
        />
      </div>

      {/* --- BEGIN COMMENT ---
      版权文案
      --- END COMMENT --- */}
      <div>
        <label
          className={cn(
            'mb-2 block text-sm font-medium',
            isDark ? 'text-stone-300' : 'text-stone-700'
          )}
        >
          版权文案
        </label>
        <input
          type="text"
          value={config.copyrightText}
          onChange={e => onChange({ ...config, copyrightText: e.target.value })}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            isDark
              ? 'border-stone-600 bg-stone-700 text-stone-100'
              : 'border-stone-300 bg-white text-stone-900'
          )}
        />
      </div>
    </div>
  );
}
