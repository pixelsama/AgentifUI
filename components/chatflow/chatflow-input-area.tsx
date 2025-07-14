'use client';

import { FileUploadField } from '@components/workflow/workflow-input-form/file-upload-field';
import { FormField } from '@components/workflow/workflow-input-form/form-field';
import { validateFormData } from '@components/workflow/workflow-input-form/validation';
import { useChatWidth } from '@lib/hooks/use-chat-width';
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import type { DifyUserInputFormItem } from '@lib/services/dify/types';
import { cn } from '@lib/utils';
import { Loader2, RotateCcw, Send, Workflow } from 'lucide-react';

import React, { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

interface ChatflowInputAreaProps {
  instanceId: string;
  onSubmit: (
    query: string,
    inputs: Record<string, any>,
    files?: any[]
  ) => Promise<void>;
  isProcessing?: boolean;
  isWaiting?: boolean;
  className?: string;
  onFormConfigChange?: (hasFormConfig: boolean) => void;
}

/**
 * Chatflow 输入区域组件
 *
 * 功能特点：
 * - 始终包含查询输入框（sys.query）
 * - 根据应用配置显示动态表单字段
 * - 完整的表单验证（必选字段、文件类型等）
 * - 正确构建 chat-messages API payload
 */
export function ChatflowInputArea({
  instanceId,
  onSubmit,
  isProcessing = false,
  isWaiting = false,
  className,
  onFormConfigChange,
}: ChatflowInputAreaProps) {
  const { isDark } = useThemeColors();
  const { widthClass, paddingClass } = useChatWidth();
  const { currentAppInstance } = useCurrentApp();
  const t = useTranslations('pages.chatflow');

  // --- 状态管理 ---
  const [query, setQuery] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialFormData, setInitialFormData] = useState<Record<string, any>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [userInputForm, setUserInputForm] = useState<DifyUserInputFormItem[]>(
    []
  );
  const [hasFormConfig, setHasFormConfig] = useState(false);

  // --- 初始化应用配置 ---
  useEffect(() => {
    const initializeFormConfig = async () => {
      try {
        setIsLoading(true);
        console.log(
          '[ChatflowInputArea] 开始加载应用配置，instanceId:',
          instanceId
        );

        // 从数据库获取应用配置
        const { createClient } = await import('@lib/supabase/client');
        const supabase = createClient();

        const { data: serviceInstance, error } = await supabase
          .from('service_instances')
          .select('*')
          .eq('instance_id', instanceId)
          .single();

        if (error || !serviceInstance) {
          console.warn('[ChatflowInputArea] 未找到服务实例，使用纯查询模式');
          setHasFormConfig(false);
          onFormConfigChange?.(false);
          return;
        }

        console.log('[ChatflowInputArea] 找到服务实例:', serviceInstance);

        // 解析 user_input_form 配置
        const difyParams = serviceInstance.config?.dify_parameters;
        const formItems = difyParams?.user_input_form || [];

        console.log('[ChatflowInputArea] 解析到的 user_input_form:', formItems);

        if (Array.isArray(formItems) && formItems.length > 0) {
          setUserInputForm(formItems);
          setHasFormConfig(true);
          onFormConfigChange?.(true);

          // 初始化表单默认值
          const initialData: Record<string, any> = {};
          formItems.forEach((formItem: DifyUserInputFormItem) => {
            const fieldType = Object.keys(formItem)[0];
            const fieldConfig = formItem[fieldType as keyof typeof formItem];

            if (fieldConfig) {
              if (fieldType === 'file' || fieldType === 'file-list') {
                initialData[fieldConfig.variable] = fieldConfig.default || [];
              } else if (fieldType === 'number') {
                const numberConfig = fieldConfig as any;
                initialData[fieldConfig.variable] =
                  numberConfig.default !== undefined
                    ? numberConfig.default
                    : '';
              } else {
                initialData[fieldConfig.variable] = fieldConfig.default || '';
              }
            }
          });

          setFormData(initialData);
          setInitialFormData(initialData);
        } else {
          setHasFormConfig(false);
          onFormConfigChange?.(false);
        }
      } catch (error) {
        console.error('[ChatflowInputArea] 初始化失败:', error);
        setHasFormConfig(false);
        onFormConfigChange?.(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (instanceId) {
      initializeFormConfig();
    }
  }, [instanceId, onFormConfigChange]);

  // --- 表单字段更新 ---
  const handleFieldChange = useCallback(
    (variable: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        [variable]: value,
      }));

      // 清除该字段的错误
      if (errors[variable]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[variable];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // --- 输入法组合状态管理 ---
  const [isComposing, setIsComposing] = useState(false);

  // --- 查询输入更新 ---
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuery(e.target.value);

      // 清除查询字段的错误
      if (errors.query) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.query;
          return newErrors;
        });
      }
    },
    [errors]
  );

  // --- 表单重置 ---
  const handleReset = useCallback(() => {
    setQuery('');
    setFormData({ ...initialFormData });
    setErrors({});
  }, [initialFormData]);

  // --- 表单提交 ---
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isProcessing || isWaiting) return;

      const newErrors: Record<string, string> = {};

      // 验证查询字段（必填）
      if (!query.trim()) {
        newErrors.query = t('form.question.required');
      } else {
        // 检查查询字段长度限制（如果有的话）
        // 注意：这里我们设置一个合理的默认最大长度，防止过长的输入
        const maxQueryLength = 2000; // 设置合理的查询最大长度
        if (query.length > maxQueryLength) {
          newErrors.query = t('form.question.tooLong', {
            maxLength: maxQueryLength,
          });
        }
      }

      // 验证表单字段（如果有的话）
      if (hasFormConfig && userInputForm.length > 0) {
        const formValidationErrors = validateFormData(formData, userInputForm);
        Object.assign(newErrors, formValidationErrors);
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // 提取文件
      const files = extractFilesFromFormData(formData);

      // 清除错误并提交
      setErrors({});

      try {
        await onSubmit(query.trim(), formData, files);

        // 提交成功后清空表单
        setQuery('');
        setFormData({ ...initialFormData });
      } catch (error) {
        console.error('[ChatflowInputArea] 提交失败:', error);
      }
    },
    [
      query,
      formData,
      userInputForm,
      hasFormConfig,
      isProcessing,
      isWaiting,
      onSubmit,
      initialFormData,
    ]
  );

  // --- 检查是否可以提交 ---
  const canSubmit = useCallback(() => {
    if (!query.trim()) return false;

    if (hasFormConfig && userInputForm.length > 0) {
      const formValidationErrors = validateFormData(formData, userInputForm);
      return Object.keys(formValidationErrors).length === 0;
    }

    return true;
  }, [query, formData, userInputForm, hasFormConfig]);

  // --- 键盘事件处理：Enter提交，Shift+Enter换行 ---
  const handleQueryKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();

        // 检查是否可以提交
        if (!isProcessing && !isWaiting && canSubmit()) {
          // 创建一个模拟的表单事件来触发提交
          const form = e.currentTarget.closest('form');
          if (form) {
            const submitEvent = new Event('submit', {
              bubbles: true,
              cancelable: true,
            });
            form.dispatchEvent(submitEvent);
          }
        }
      }
    },
    [isProcessing, isWaiting, canSubmit, isComposing]
  );

  // --- 输入法组合事件处理 ---
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // --- 加载状态 ---
  if (isLoading) {
    return (
      <div className={cn('mx-auto w-full', widthClass, paddingClass, 'py-8')}>
        <div className="flex items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2
              className={cn(
                'mx-auto h-6 w-6 animate-spin',
                isDark ? 'text-stone-400' : 'text-stone-500'
              )}
            />
            <p
              className={cn(
                'font-serif text-sm',
                isDark ? 'text-stone-400' : 'text-stone-500'
              )}
            >
              {t('loading.inputConfig')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mx-auto w-full',
        widthClass,
        paddingClass,
        'py-8',
        className
      )}
    >
      {/* --- 现代化表单容器 --- */}
      <div
        className={cn(
          'mx-auto max-w-2xl',
          'rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-300',
          isDark
            ? 'border border-stone-700/60 bg-gradient-to-br from-stone-900/95 to-stone-800/95 shadow-stone-900/40 hover:shadow-stone-900/60'
            : 'border border-stone-200/60 bg-gradient-to-br from-white/95 to-stone-50/95 shadow-stone-200/40 hover:shadow-2xl hover:shadow-stone-300/50'
        )}
      >
        {/* --- 表单头部 --- */}
        <div
          className={cn(
            'border-b p-8 pb-6',
            isDark ? 'border-stone-700/50' : 'border-stone-200/50'
          )}
        >
          <div className="space-y-4 text-center">
            <div
              className={cn(
                'inline-flex h-16 w-16 items-center justify-center rounded-2xl',
                'shadow-lg',
                isDark
                  ? 'border border-stone-600/50 bg-gradient-to-br from-stone-800 to-stone-700 shadow-stone-900/50'
                  : 'border border-stone-300/50 bg-gradient-to-br from-stone-100 to-stone-200 shadow-stone-200/50'
              )}
            >
              <Workflow
                className={cn(
                  'h-7 w-7',
                  isDark ? 'text-stone-300' : 'text-stone-600'
                )}
              />
            </div>

            <div className="space-y-2">
              <h1
                className={cn(
                  'font-serif text-2xl font-bold',
                  isDark ? 'text-stone-200' : 'text-stone-800'
                )}
              >
                {currentAppInstance?.display_name || t('form.defaultAppName')}
              </h1>
              <p
                className={cn(
                  'mx-auto max-w-md font-serif leading-relaxed',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                {currentAppInstance?.description ||
                  t('form.defaultDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* --- 表单内容区域 --- */}
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* --- 主要查询输入区域 --- */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  'bg-gradient-to-r from-stone-500 to-stone-400'
                )}
              />
              <label
                className={cn(
                  'font-serif text-base font-semibold',
                  isDark ? 'text-stone-200' : 'text-stone-800'
                )}
              >
                {t('form.question.label')}{' '}
                <span className="ml-1 text-red-500">*</span>
              </label>
            </div>

            <div className="group relative">
              <textarea
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleQueryKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder={t('form.question.placeholder')}
                rows={4}
                className={cn(
                  'w-full resize-none rounded-xl border-2 px-5 py-4 font-serif',
                  'backdrop-blur-sm transition-all duration-300',
                  'focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 focus:outline-none',
                  'focus:shadow-lg focus:shadow-stone-500/25',
                  errors.query
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : isDark
                      ? 'border-stone-600 bg-stone-800/80 text-stone-100 group-hover:border-stone-500 placeholder:text-stone-400 focus:bg-stone-800'
                      : 'border-stone-300 bg-white/80 text-stone-900 group-hover:border-stone-400 placeholder:text-stone-500 focus:bg-white'
                )}
                disabled={isProcessing || isWaiting}
              />

              {errors.query && (
                <div
                  className={cn(
                    'mt-3 flex items-center gap-2',
                    isDark ? 'text-red-400' : 'text-red-600'
                  )}
                >
                  <div className="h-1 w-1 rounded-full bg-red-500" />
                  <p className="font-serif text-sm">{errors.query}</p>
                </div>
              )}
            </div>
          </div>

          {/* --- 动态表单字段区域 --- */}
          {hasFormConfig && userInputForm.length > 0 && (
            <div className="space-y-6">
              {/* 分隔线 */}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-px flex-1 bg-gradient-to-r from-transparent to-transparent',
                    isDark ? 'via-stone-600' : 'via-stone-300'
                  )}
                />
                <span
                  className={cn(
                    'rounded-full border px-4 py-2 font-serif text-sm',
                    isDark
                      ? 'border-stone-700 bg-stone-800 text-stone-400'
                      : 'border-stone-200 bg-stone-100 text-stone-600'
                  )}
                >
                  {t('form.additionalInfo')}
                </span>
                <div
                  className={cn(
                    'h-px flex-1 bg-gradient-to-r from-transparent to-transparent',
                    isDark ? 'via-stone-600' : 'via-stone-300'
                  )}
                />
              </div>

              {/* 表单字段网格 */}
              <div className="grid gap-6">
                {userInputForm.map(
                  (formItem: DifyUserInputFormItem, index: number) => {
                    const fieldType = Object.keys(formItem)[0];
                    const fieldConfig =
                      formItem[fieldType as keyof typeof formItem];

                    if (!fieldConfig) return null;

                    return (
                      <div
                        key={`${fieldConfig.variable}-${index}`}
                        className={cn(
                          'group relative rounded-xl p-6 transition-all duration-300',
                          isDark
                            ? 'border border-stone-600/60 bg-gradient-to-br from-stone-800/80 to-stone-700/80 hover:border-stone-500 hover:shadow-lg hover:shadow-stone-900/50'
                            : 'border border-stone-200/60 bg-gradient-to-br from-stone-50/80 to-white/80 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50'
                        )}
                      >
                        {/* 字段装饰线 */}
                        <div
                          className={cn(
                            'absolute top-0 left-6 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-16',
                            isDark
                              ? 'bg-gradient-to-r from-stone-500 to-stone-600'
                              : 'bg-gradient-to-r from-stone-400 to-stone-300'
                          )}
                        />

                        {/* 文件上传字段 */}
                        {fieldType === 'file' || fieldType === 'file-list' ? (
                          <FileUploadField
                            config={fieldConfig}
                            value={formData[fieldConfig.variable]}
                            onChange={value =>
                              handleFieldChange(fieldConfig.variable, value)
                            }
                            error={errors[fieldConfig.variable]}
                            label={fieldConfig.label}
                            instanceId={instanceId}
                            isSingleFileMode={fieldType === 'file'}
                          />
                        ) : (
                          <FormField
                            type={
                              fieldType as
                                | 'text-input'
                                | 'number'
                                | 'paragraph'
                                | 'select'
                            }
                            config={fieldConfig}
                            value={formData[fieldConfig.variable]}
                            onChange={value =>
                              handleFieldChange(fieldConfig.variable, value)
                            }
                            error={errors[fieldConfig.variable]}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* --- 表单操作区域 --- */}
          <div
            className={cn(
              'border-t pt-6',
              isDark ? 'border-stone-700/50' : 'border-stone-200/50'
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* 重置按钮 */}
              <button
                type="button"
                onClick={handleReset}
                disabled={
                  isProcessing ||
                  isWaiting ||
                  (!query &&
                    Object.values(formData).every(
                      v => !v || (Array.isArray(v) && v.length === 0)
                    ))
                }
                className={cn(
                  'flex items-center justify-center gap-3 rounded-xl px-6 py-3',
                  'border-2 font-serif text-sm font-medium backdrop-blur-sm transition-all duration-300',
                  isDark
                    ? 'border-stone-600 bg-stone-800/80 text-stone-300'
                    : 'border-stone-300 bg-white/80 text-stone-700',
                  isProcessing ||
                    isWaiting ||
                    (!query &&
                      Object.values(formData).every(
                        v => !v || (Array.isArray(v) && v.length === 0)
                      ))
                    ? 'cursor-not-allowed opacity-50'
                    : cn(
                        'transform active:scale-[0.98]',
                        isDark
                          ? 'hover:border-stone-500 hover:bg-stone-700 hover:shadow-lg hover:shadow-stone-900/50'
                          : 'hover:border-stone-400 hover:bg-stone-50 hover:shadow-lg hover:shadow-stone-200/50'
                      )
                )}
              >
                <RotateCcw className="h-4 w-4" />
                {t('form.reset')}
              </button>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isProcessing || isWaiting || !canSubmit()}
                className={cn(
                  'flex flex-1 items-center justify-center gap-3 rounded-xl px-8 py-4',
                  'font-serif text-base font-semibold text-white shadow-lg transition-all duration-300',
                  isDark
                    ? 'bg-gradient-to-r from-stone-700 to-stone-600 shadow-stone-900/50'
                    : 'bg-gradient-to-r from-stone-800 to-stone-700 shadow-stone-800/25',
                  isProcessing || isWaiting || !canSubmit()
                    ? 'cursor-not-allowed opacity-50'
                    : cn(
                        'transform hover:scale-[1.02] active:scale-[0.98]',
                        isDark
                          ? 'hover:from-stone-600 hover:to-stone-500 hover:shadow-xl hover:shadow-stone-900/60'
                          : 'hover:from-stone-700 hover:to-stone-600 hover:shadow-xl hover:shadow-stone-800/30'
                      )
                )}
              >
                {isProcessing || isWaiting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t('form.processing')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>{t('form.startConversation')}</span>
                  </>
                )}
              </button>
            </div>

            {/* 表单错误提示 */}
            {Object.keys(errors).length > 0 && (
              <div
                className={cn(
                  'mt-6 rounded-xl border p-4 shadow-lg',
                  isDark
                    ? 'border-red-700/50 bg-gradient-to-r from-red-900/20 to-red-800/20 shadow-red-900/20'
                    : 'border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-red-100/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p
                    className={cn(
                      'font-serif text-sm',
                      isDark ? 'text-red-300' : 'text-red-700'
                    )}
                  >
                    {t('form.checkAndCorrectErrors')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 从表单数据中提取文件
 */
function extractFilesFromFormData(formData: Record<string, any>): any[] {
  const files: any[] = [];

  console.log('[extractFilesFromFormData] 输入的formData:', formData);

  Object.values(formData).forEach(value => {
    if (Array.isArray(value)) {
      // 检查是否是文件数组
      value.forEach(item => {
        if (
          item &&
          typeof item === 'object' &&
          (item.file || item.upload_file_id)
        ) {
          console.log('[extractFilesFromFormData] 找到文件数组中的文件:', item);
          files.push(item);
        }
      });
    } else if (
      value &&
      typeof value === 'object' &&
      (value.file || value.upload_file_id)
    ) {
      // 单个文件对象
      console.log('[extractFilesFromFormData] 找到单个文件对象:', value);
      files.push(value);
    }
  });

  console.log('[extractFilesFromFormData] 提取的文件列表:', files);
  return files;
}
