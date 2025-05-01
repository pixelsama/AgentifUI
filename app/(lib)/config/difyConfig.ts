import { supabase } from './supabaseConfig';

export interface DifyAppConfig {
  apiKey: string;
  apiUrl: string;
}

export const getDifyAppConfig = async (
  appId: string,
  userId?: string,  // 添加用户ID参数用于权限检查
): Promise<DifyAppConfig | null> => {
  // 1. 尝试从数据库获取配置
  try {
    const { data, error } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('provider', 'dify')
      .eq('app_id', appId)
      .eq('enabled', true)
      .single();
      
    if (error || !data) {
      console.error(`配置缺失：Dify应用"${appId}"，将尝试从环境变量获取`);
      // 2. 数据库获取失败，回退到环境变量
      return getFallbackDifyConfig(appId);
    }
    
    return {
      apiKey: data.api_key,
      apiUrl: data.api_url
    };
  } catch (error) {
    console.error(`从数据库获取Dify配置时出错:`, error);
    // 3. 异常时回退到环境变量
    return getFallbackDifyConfig(appId);
  }
};

// 回退到环境变量的方法
const getFallbackDifyConfig = (appId: string): DifyAppConfig | null => {
  const apiKeyEnvVar = `DIFY_APP_${appId.toUpperCase()}_KEY`;
  const apiUrlEnvVar = `DIFY_APP_${appId.toUpperCase()}_URL`;

  const apiKey = process.env[apiKeyEnvVar];
  const apiUrl = process.env[apiUrlEnvVar];

  // 如果没有指定appId的环境变量，尝试使用通用的Dify环境变量
  const fallbackApiKey = apiKey || process.env.DIFY_API_KEY;
  const fallbackApiUrl = apiUrl || process.env.DIFY_API_URL;

  if (!fallbackApiKey || !fallbackApiUrl) {
    console.error(
      `缺少Dify应用"${appId}"的配置。请确保${apiKeyEnvVar}和${apiUrlEnvVar}或通用的DIFY_API_KEY和DIFY_API_URL已设置。`,
    );
    return null;
  }

  return { apiKey: fallbackApiKey, apiUrl: fallbackApiUrl };
};

// 这个函数就是我们为未来接入数据库留的抽象层。
// 将来引入 Supabase 后，我们只需要修改这个函数的内部实现，
// 让它从数据库查询，而调用它的 API 路由代码基本不用变。
