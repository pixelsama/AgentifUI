'use client';

import { useApiConfigStore } from '@lib/stores/api-config-store';
import { toast } from 'sonner';

// --- 创建实例的保存处理逻辑 ---
export const handleCreateInstance = async (
  data: any,
  providers: any[],
  addInstance: Function,
  setIsProcessing: (value: boolean) => void,
  handleClearSelection: () => void
) => {
  setIsProcessing(true);

  // --- 提取setAsDefault状态和其他数据 ---
  const { setAsDefault, ...instanceData } = data;

  // --- 使用用户选择的提供商 ---
  const providerId = data.selectedProviderId;
  if (!providerId) {
    toast.error('请选择服务提供商');
    setIsProcessing(false);
    return;
  }

  // 验证选择的提供商是否有效
  const selectedProvider = providers.find(p => p.id === providerId);
  if (!selectedProvider) {
    toast.error('选择的服务提供商无效');
    setIsProcessing(false);
    return;
  }

  if (!selectedProvider.is_active) {
    toast.error('选择的服务提供商未激活');
    setIsProcessing(false);
    return;
  }

  try {
    const newInstance = await addInstance(
      {
        ...instanceData,
        provider_id: providerId,
      },
      data.apiKey
    );

    toast.success('应用实例创建成功');

    // --- 如果选择了设为默认，则在创建成功后设置为默认应用 ---
    if (setAsDefault && newInstance?.id) {
      try {
        await useApiConfigStore.getState().setDefaultInstance(newInstance.id);
        toast.success('应用实例已设为默认应用');
      } catch (error) {
        console.error('设置默认应用失败:', error);
        toast.warning('应用创建成功，但设置默认应用失败');
      }
    }

    handleClearSelection();
  } catch (error) {
    console.error('创建失败:', error);
    toast.error('创建应用实例失败');
  } finally {
    setIsProcessing(false);
  }
};

// --- 更新实例的保存处理逻辑 ---
export const handleUpdateInstance = async (
  selectedInstance: any,
  data: any,
  updateInstance: Function,
  setIsProcessing: (value: boolean) => void,
  handleClearSelection: () => void
) => {
  setIsProcessing(true);

  try {
    await updateInstance(selectedInstance.id, data, data.apiKey);
    toast.success('应用实例更新成功');
    handleClearSelection();
  } catch (error) {
    console.error('更新失败:', error);
    toast.error('更新应用实例失败');
  } finally {
    setIsProcessing(false);
  }
};
