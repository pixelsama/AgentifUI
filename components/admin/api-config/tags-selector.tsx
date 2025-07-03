'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { X } from 'lucide-react';

interface TagsSelectorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagsSelector = ({ tags, onTagsChange }: TagsSelectorProps) => {
  const { isDark } = useTheme();

  const handleTagToggle = (tag: string) => {
    const isSelected = tags.includes(tag);
    if (isSelected) {
      onTagsChange(tags.filter(t => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const handleCustomTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };

  const handleTagRemove = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label
        className={cn(
          'mb-2 block font-serif text-sm font-medium',
          isDark ? 'text-stone-300' : 'text-stone-700'
        )}
      >
        应用标签 (tags)
      </label>
      <div className="space-y-3">
        {/* 预定义标签选择 - 按类别分组 */}
        <div className="space-y-3">
          {/* 模型类型 */}
          <div>
            <div
              className={cn(
                'mb-2 font-serif text-xs font-medium',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              模型类型
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['对话模型', '推理模型', '文档模型', '多模态'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'cursor-pointer rounded px-2 py-1.5 font-serif text-xs font-medium transition-colors',
                    tags.includes(tag)
                      ? isDark
                        ? 'border border-stone-500 bg-stone-600 text-stone-200'
                        : 'border border-stone-300 bg-stone-200 text-stone-800'
                      : isDark
                        ? 'border border-stone-600 bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                        : 'border border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 应用场景 */}
          <div>
            <div
              className={cn(
                'mb-2 font-serif text-xs font-medium',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              应用场景
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['文本生成', '代码生成', '数据分析', '翻译'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'cursor-pointer rounded px-2 py-1.5 font-serif text-xs font-medium transition-colors',
                    tags.includes(tag)
                      ? isDark
                        ? 'border border-stone-500 bg-stone-600 text-stone-200'
                        : 'border border-stone-300 bg-stone-200 text-stone-800'
                      : isDark
                        ? 'border border-stone-600 bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                        : 'border border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 技术特性 */}
          <div>
            <div
              className={cn(
                'mb-2 font-serif text-xs font-medium',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              技术特性
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['高精度', '快速响应', '本地部署', '企业级'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'cursor-pointer rounded px-2 py-1.5 font-serif text-xs font-medium transition-colors',
                    tags.includes(tag)
                      ? isDark
                        ? 'border border-stone-500 bg-stone-600 text-stone-200'
                        : 'border border-stone-300 bg-stone-200 text-stone-800'
                      : isDark
                        ? 'border border-stone-600 bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                        : 'border border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 自定义标签输入 - 更小的输入框 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="自定义标签（回车添加）"
            className={cn(
              'flex-1 rounded border px-2 py-1.5 font-serif text-xs',
              isDark
                ? 'border-stone-600 bg-stone-700 text-stone-100 placeholder-stone-400'
                : 'border-stone-300 bg-white text-stone-900 placeholder-stone-500'
            )}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                const tag = input.value.trim();
                handleCustomTagAdd(tag);
                input.value = '';
              }
            }}
          />
        </div>

        {/* 已选标签显示 - 更小的标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={cn(
                  'inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-serif text-xs font-medium',
                  isDark
                    ? 'border border-stone-600 bg-stone-700 text-stone-300'
                    : 'border border-stone-300 bg-stone-100 text-stone-700'
                )}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(index)}
                  className={cn(
                    'rounded-full p-0.5 transition-colors hover:bg-red-500 hover:text-white',
                    isDark ? 'text-stone-400' : 'text-stone-500'
                  )}
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))}
          </div>
        )}

        <p
          className={cn(
            'font-serif text-xs',
            isDark ? 'text-stone-400' : 'text-stone-500'
          )}
        >
          标签用于应用分类和搜索
        </p>
      </div>
    </div>
  );
};
