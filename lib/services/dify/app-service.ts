import { getProviderByName } from '@lib/db';

/**
 * 获取所有可用的Dify应用
 */
export async function getAllDifyApps(): Promise<Array<{id: string, name: string}>> {
  try {
    // 获取Dify提供商
    const providerResult = await getProviderByName('Dify');
    if (!providerResult.success || !providerResult.data) {
      throw new Error('未找到Dify提供商');
    }

    // 获取所有Dify服务实例
    const { createClient } = await import('@lib/supabase/client');
    const supabase = createClient();
    
    const { data: instances, error } = await supabase
      .from('service_instances')
      .select('instance_id, display_name, name')
      .eq('provider_id', providerResult.data.id)
      .order('display_name');
      
    if (error) {
      throw error;
    }
    
    return instances?.map(instance => ({
      id: instance.instance_id,
      name: instance.display_name || instance.name
    })) || [];
    
  } catch (error) {
    console.error('获取Dify应用列表失败:', error);
    throw error;
  }
} 