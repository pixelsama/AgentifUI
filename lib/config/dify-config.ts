// --- BEGIN COMMENT ---
// 移除无效的导入语句，因为 supabase-config.ts 已被删除
// --- END COMMENT ---
// import { createServiceClient } from './supabase-config' // 移除，后续可能用Prisma或其他方式获取

export interface DifyAppConfig {
  apiKey: string;
  apiUrl: string;
}

// --- BEGIN COMMENT ---
// 从环境变量或数据库（未来可能）安全地获取Dify应用的配置信息。
// 目前优先从环境变量读取全局配置。
// 未来可以扩展为基于 appId 或 userId 从数据库获取特定配置。
// --- END COMMENT ---
export const getDifyAppConfig = async (
  appId: string, // 保留 appId 参数，为未来扩展性
  userId?: string,  // 保留 userId 参数，为未来可能的权限检查
): Promise<DifyAppConfig | null> => {
  // --- BEGIN COMMENT ---
  // TODO: 实现从数据库或其他配置源按 appId 获取配置的逻辑
  // 例如，使用 Prisma 查询特定于应用或用户的 Dify API Key 和 URL
  // const prisma = new PrismaClient();
  // const userAppConfig = await prisma.difyConfig.findUnique({ where: { userId_appId: { userId, appId } } });
  // if (userAppConfig) return { apiKey: userAppConfig.apiKey, apiUrl: userAppConfig.apiUrl };
  //
  // 目前暂时使用全局环境变量作为回退或主要来源
  // --- END COMMENT ---
  const apiKey = process.env.DIFY_API_KEY;
  const apiUrl = process.env.DIFY_API_URL;

  if (!apiKey || !apiUrl) {
    console.error("Dify API Key or API URL is not configured in environment variables.");
    // --- BEGIN COMMENT ---
    // 未来可以尝试从数据库加载配置, 例如调用下面 getFallbackDifyConfig
    // 或者直接查询数据库中的默认配置
    // --- END COMMENT ---
    
    // 调用回退配置函数，如果存在
    return getFallbackDifyConfig(appId); 
  }

  return {
    apiKey,
    apiUrl,
  };
};


// --- BEGIN COMMENT ---
// 提供一个备用的Dify配置获取方式，例如用于特定应用或默认值。
// 目前返回 null，表示如果没有环境变量则配置失败。
// 未来可以实现从默认配置表或固定值加载。
// --- END COMMENT ---
const getFallbackDifyConfig = (appId: string): DifyAppConfig | null => {
  console.warn(`[Dify Config] Fallback configuration requested for appId: ${appId}, but no fallback logic is implemented.`);
  // --- BEGIN COMMENT ---
  // 示例: 未来可能从数据库或其他配置源加载后备配置
  // Example: if (appId === 'default-chat') return { apiKey: 'default_key_abc', apiUrl: 'https://default.dify.ai/api' };
  // --- END COMMENT ---
  return null; 
};

// 这个函数就是我们为未来接入数据库留的抽象层。
// 将来引入 Supabase 后，我们只需要修改这个函数的内部实现，
// 让它从数据库查询，而调用它的 API 路由代码基本不用变。
