# LLM-EduHub 开发贡献指南

这篇文档将指导你如何设置LLM-EduHub的开发环境，包括数据库配置、认证系统和运行应用程序的步骤。

## 前置要求

开始前，请确保你的系统上已安装：

- Node.js 18+
- npm 9+
- Docker和Docker Compose（用于Supabase本地开发）
- Git

## 环境设置步骤

### 1. 克隆代码库

```bash
# 克隆代码库
git clone https://github.com/lyzno1/llm-eduhub.git
cd llm-eduhub

# 安装依赖
npm install
```

### 2. 安装Supabase CLI

Supabase CLI用于管理本地开发数据库和迁移。

```bash
# 使用npm安装
npm install -g supabase

# 验证安装
supabase --version
```

### 3. 启动本地Supabase实例

```bash
# 初始化并启动本地Supabase
supabase start
```

启动后，你会看到类似以下的输出：

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
        anon key: eyJh...
service_role key: eyJh...
```

请记录这些URL和密钥，你将在后续步骤中需要它们。

### 4. 设置环境变量

创建`.env.local`文件（该文件不会被Git跟踪）：

```bash
cp .env.example .env.local
```

然后编辑`.env.local`文件，填入必要的环境变量：

```
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...  # 使用Supabase start输出的anon key
SUPABASE_SERVICE_ROLE_KEY=eyJh...  # 使用Supabase start输出的service_role key

# Dify配置
DIFY_API_KEY=your_dify_api_key
DIFY_API_URL=https://api.dify.ai

# 网站URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用程序。

## 数据库结构和数据

### 数据库迁移

当你启动Supabase时，所有迁移文件会自动应用。这些迁移文件位于`supabase/migrations/`目录下，按时间戳排序。

如果你需要重置数据库或重新应用所有迁移：

```bash
supabase db reset
```

这将：
1. 删除所有数据库对象
2. 重新应用所有迁移
3. 加载种子数据（来自`supabase/seed.sql`）

### 访问Supabase Studio

你可以通过浏览器访问本地Supabase Studio来管理数据库：

[http://127.0.0.1:54323](http://127.0.0.1:54323)

在Studio中，你可以：
- 查看和编辑表数据
- 执行SQL查询
- 管理认证设置
- 查看存储桶和文件
- 测试API

### 创建自己的迁移

当你需要对数据库结构进行更改时，应该创建新的迁移文件：

```bash
supabase migration new your_migration_name
```

这将在`supabase/migrations/`目录下创建一个新的SQL文件。编辑该文件，添加你的数据库更改，然后运行：

```bash
supabase db reset
```

## SSO配置开发

### 配置Google SSO（用于测试）

1. 访问[Google Cloud Console](https://console.cloud.google.com/)
2. 创建一个新项目
3. 在"API和服务" > "凭据"中，创建一个OAuth客户端ID
4. 添加授权重定向URI：`http://localhost:3000/api/auth/callback/google`
5. 复制生成的Client ID和Client Secret
6. 在Supabase中更新SSO提供商配置：

```sql
UPDATE sso_providers 
SET 
  client_id = '实际Google Client ID', 
  client_secret = '实际Google Client Secret'
WHERE 
  name = 'Google Workspace';
```

## 代码贡献工作流

### 分支管理

1. 从`main`分支创建功能分支
```bash
git checkout main
git pull
git checkout -b feature/your-feature-name
```

2. 提交你的更改
```bash
git add .
git commit -m "feat(scope): 你的提交信息"
```

3. 推送到远程仓库
```bash
git push origin feature/your-feature-name
```

4. 创建合并请求(Pull Request)

### 提交消息规范

我们使用约定式提交(Conventional Commits)规范：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更改
- `style:` 代码风格调整（不影响功能）
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 添加测试
- `chore:` 构建过程或工具变动

例如：
```
feat(auth): 添加Google Workspace SSO认证支持
```

## 常见问题解答

### Q: Supabase启动失败怎么办？
A: 首先检查Docker是否正在运行。然后尝试以下命令：
```bash
supabase stop
docker system prune -a  # 清理未使用的Docker资源
supabase start
```

### Q: 如何在开发中添加新的SSO提供商？
A: 通过SQL在`sso_providers`表中添加记录，然后在`domain_sso_mappings`表中关联域名。也可以使用Supabase Studio的表编辑器。

### Q: 如何添加测试数据？
A: 你可以修改`supabase/seed.sql`文件添加更多初始数据，或者使用Studio手动添加记录。

## 资源链接

- [Next.js文档](https://nextjs.org/docs)
- [Supabase文档](https://supabase.com/docs)
- [Supabase CLI参考](https://supabase.com/docs/reference/cli/usage) 