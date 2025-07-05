'use client';

import { useTheme } from '@lib/hooks/use-theme';
import type {
  DifyFileInputControl,
  DifyNumberInputControl,
  DifyParagraphControl,
  DifySelectControl,
  DifyTextInputControl,
} from '@lib/services/dify/types';
import { cn } from '@lib/utils';

import React from 'react';

import { useTranslations } from 'next-intl';

import { CustomSelect } from './custom-select';
import { FileUploadField } from './file-upload-field';

interface FormFieldProps {
  type: 'text-input' | 'number' | 'paragraph' | 'select' | 'file' | 'file-list';
  config:
    | DifyTextInputControl
    | DifyNumberInputControl
    | DifyParagraphControl
    | DifySelectControl
    | DifyFileInputControl;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  instanceId?: string; // 添加instanceId用于文件上传
}

/**
 * 通用表单字段组件
 *
 * 支持的字段类型：
 * - text-input: 单行文本输入
 * - number: 数字输入
 * - paragraph: 多行文本输入
 * - select: 下拉选择
 * - file: 文件上传
 */
export function FormField({
  type,
  config,
  value,
  onChange,
  error,
  instanceId,
}: FormFieldProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.workflow.form');

  const baseInputClasses = cn(
    'w-full rounded-xl border-2 px-4 py-3 font-serif transition-all duration-300',
    'focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 focus:outline-none',
    'backdrop-blur-sm focus:shadow-lg focus:shadow-stone-500/25',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' +
          (isDark ? ' bg-red-900/10' : ' bg-red-50/50')
      : isDark
        ? 'border-stone-600 bg-stone-800/90 text-stone-100 placeholder-stone-400 hover:border-stone-500'
        : 'border-stone-300 bg-white/90 text-stone-900 placeholder-stone-500 hover:border-stone-400'
  );

  const labelClasses = cn(
    'mb-3 flex items-center gap-2 font-serif text-sm font-semibold',
    isDark ? 'text-stone-200' : 'text-stone-800'
  );

  const errorClasses = cn(
    'mt-2 flex items-center gap-2',
    isDark ? 'text-red-400' : 'text-red-600'
  );

  const renderInput = () => {
    switch (type) {
      case 'text-input':
        const textConfig = config as DifyTextInputControl;
        return (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={t('inputPlaceholder', { label: config.label })}
            maxLength={textConfig.max_length || undefined}
            className={baseInputClasses}
          />
        );

      case 'number':
        const numberConfig = config as DifyNumberInputControl;
        return (
          <input
            type="number"
            value={value}
            onChange={e => {
              const inputValue = e.target.value;
              console.log(
                `[FormField-${config.variable}] 用户输入:`,
                inputValue,
                '(类型:',
                typeof inputValue,
                ')'
              );

              // 如果输入为空，传递空字符串
              if (inputValue === '') {
                console.log(
                  `[FormField-${config.variable}] 输入为空，传递空字符串`
                );
                onChange('');
                return;
              }

              // 尝试转换为数字
              const numValue = parseFloat(inputValue);
              console.log(
                `[FormField-${config.variable}] parseFloat结果:`,
                numValue,
                '(类型:',
                typeof numValue,
                ')'
              );

              if (!isNaN(numValue)) {
                console.log(
                  `[FormField-${config.variable}] 传递数字值:`,
                  numValue
                );
                onChange(numValue);
              } else {
                // 如果转换失败，保持原始字符串（用于验证）
                console.log(
                  `[FormField-${config.variable}] 转换失败，保持字符串:`,
                  inputValue
                );
                onChange(inputValue);
              }
            }}
            placeholder={t('inputPlaceholder', { label: config.label })}
            min={numberConfig.min}
            max={numberConfig.max}
            step={numberConfig.step || 1}
            className={baseInputClasses}
          />
        );

      case 'paragraph':
        const paragraphConfig = config as DifyParagraphControl;
        const hasMaxLength = (paragraphConfig as any).max_length;
        return (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={t('inputPlaceholder', { label: config.label })}
            rows={6}
            maxLength={hasMaxLength || undefined}
            className={cn(
              baseInputClasses,
              'resize-none',
              hasMaxLength ? 'pb-8' : '' // 为字符计数器留出空间
            )}
          />
        );

      case 'select':
        const selectConfig = config as DifySelectControl;
        return (
          <CustomSelect
            value={value}
            onChange={onChange}
            options={selectConfig.options}
            placeholder={t('selectPlaceholder', { label: config.label })}
            error={error}
          />
        );

      case 'file':
        const fileConfig = config as any;
        if (!instanceId) {
          console.warn('[FormField] file类型字段需要instanceId参数');
          return null;
        }
        return (
          <FileUploadField
            config={{
              ...fileConfig, // 保留所有原始字段
              enabled: true, // 确保启用
            }}
            value={value || []}
            onChange={onChange}
            error={error}
            instanceId={instanceId}
            isSingleFileMode={true} // 单文件模式
          />
        );

      case 'file-list':
        const fileListConfig = config as any;
        if (!instanceId) {
          console.warn('[FormField] file-list类型字段需要instanceId参数');
          return null;
        }
        return (
          <FileUploadField
            config={{
              ...fileListConfig, // 保留所有原始字段
              enabled: true, // 确保启用
            }}
            value={value || []}
            onChange={onChange}
            error={error}
            instanceId={instanceId}
            isSingleFileMode={false} // 多文件模式
          />
        );

      default:
        return null;
    }
  };

  // 为number类型生成范围提示信息
  const getNumberHint = () => {
    if (type !== 'number') return null;

    const numberConfig = config as DifyNumberInputControl;
    const hints: string[] = [];

    if (numberConfig.min !== undefined && numberConfig.max !== undefined) {
      hints.push(
        t('rangeHint', { min: numberConfig.min, max: numberConfig.max })
      );
    } else if (numberConfig.min !== undefined) {
      hints.push(t('minValueHint', { min: numberConfig.min }));
    } else if (numberConfig.max !== undefined) {
      hints.push(t('maxValueHint', { max: numberConfig.max }));
    }

    if (numberConfig.step && numberConfig.step !== 1) {
      hints.push(t('stepHint', { step: numberConfig.step }));
    }

    if (numberConfig.precision !== undefined) {
      hints.push(t('precisionHint', { precision: numberConfig.precision }));
    }

    return hints.length > 0 ? hints.join('，') : null;
  };

  return (
    <div className="space-y-1">
      <label className={labelClasses}>
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            'bg-gradient-to-r from-stone-500 to-stone-400'
          )}
        />
        {config.label}
        {config.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {renderInput()}

        {/* 字符计数（仅对有长度限制的字段显示） */}
        {(type === 'text-input' || type === 'paragraph') &&
          (config as any).max_length && (
            <div
              className={cn(
                'absolute right-4 bottom-3 font-mono text-xs transition-opacity duration-200',
                isDark ? 'text-stone-500' : 'text-stone-400',
                (value || '').length > 0 ? 'opacity-100' : 'opacity-0'
              )}
            >
              {(value || '').length} / {(config as any).max_length}
            </div>
          )}
      </div>

      {/* 数字类型的范围提示 */}
      {type === 'number' && getNumberHint() && (
        <div
          className={cn(
            'font-serif text-xs',
            isDark ? 'text-stone-400' : 'text-stone-500'
          )}
        >
          {getNumberHint()}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className={errorClasses}>
          <div className="h-1 w-1 rounded-full bg-red-500" />
          <span className="font-serif text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
