# API 密钥管理

本文档介绍如何配置和管理 API 密钥。

## 概述

AgentifUI 支持多种 API 提供商（如 Dify、OpenAI 等）的密钥管理。系统将敏感信息安全存储在数据库中，并提供管理界面进行配置。

## 功能特性

- **安全存储**：使用加密技术保护 API 密钥
- **多提供商支持**：支持各种 API 提供商
- **配置缓存**：提高访问性能
- **回退机制**：支持环境变量配置

## 配置方法

### 1. 环境变量配置

在 `.env.local` 文件中设置：

```env
# API 密钥加密主密钥
API_ENCRYPTION_KEY=your_random_32_byte_hex_string
```

### 2. 数据库迁移

运行迁移命令创建必要的数据库表：

### 3. 管理界面配置

通过管理界面 `/admin/api-config` 可以：

- 添加新的 API 提供商
- 配置服务实例
- 管理 API 密钥
- 设置默认配置

## 使用方法

### 在代码中获取配置

```typescript
import { getDifyAppConfig } from '@lib/config/dify-config';

// 获取 Dify 配置
const config = await getDifyAppConfig(appId);
if (config) {
  const { apiKey, apiUrl } = config;
  // 使用配置调用 API
}
```

### 在 React 组件中使用

```tsx
import { useDifyConfig } from '@lib/hooks/use-api-config';

function ChatComponent() {
  const { config, isLoading, error } = useDifyConfig(appId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!config) return <div>Configuration not found</div>;

  // 使用 config.apiKey 和 config.apiUrl
  return <div>{/* 组件内容 */}</div>;
}
```

## 安全注意事项

1. **保护主密钥**：确保 `API_ENCRYPTION_KEY` 安全存储
2. **定期轮换**：定期更新 API 密钥
3. **访问控制**：限制对敏感配置的访问权限

## 故障排除

- 如果配置无法加载，系统会自动回退到环境变量
- 检查管理界面中的配置是否正确
- 确认 API 密钥有效且未过期
