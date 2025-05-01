# LLM-EduHub 开发贡献指南

这篇文档将指导你如何设置LLM-EduHub的开发环境，包括数据库配置、认证系统和运行应用程序的步骤。

## 前置要求

开始前，请确保你的系统上已安装：

- Node.js 18+
- npm 9+
- Docker和Docker Compose（用于Supabase本地开发）
- Git
- Supabase CLI (全局安装: `npm install -g supabase`)

## 环境设置步骤

### 1. 克隆代码库

```bash
# 克隆代码库
git clone [https://github.com/lyzno1/llm-eduhub.git](https://github.com/lyzno1/llm-eduhub.git)
cd llm-eduhub

# 安装依赖
npm install
````

### 2\. (可选) 启动本地Supabase实例 (用于本地测试/验证)

如果你希望在本地完全模拟数据库环境进行测试（注意：团队协作主要基于共享的云端数据库），可以执行：

```bash
# 初始化并启动本地Supabase (首次可能需要初始化)
# supabase init # 如果 supabase 目录不存在
supabase start
```

启动后，记下输出的 `API URL`, `anon key`, `service_role key` 等信息，用于配置本地环境变量。

**注意:** 本地实例主要用于**验证迁移脚本**或**离线开发**，团队的**主要数据源和结构同步目标是共享的云端数据库**。

### 3\. 设置环境变量

创建 `.env.local` 文件（该文件不会被Git跟踪）：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件。你需要填入**团队共享的 Supabase Cloud 开发项目**的 URL 和 Anon Key。本地测试时可填入 `supabase start` 输出的值。

```ini
# Supabase Cloud (共享开发环境) 配置 - 从项目设置中获取
NEXT_PUBLIC_SUPABASE_URL="<你的共享云项目的URL>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<你的共享云项目的Anon Key>"

# (可选) Supabase Service Role Key (仅后端安全环境使用，切勿提交Git)
# SUPABASE_SERVICE_ROLE_KEY="<你的共享云项目的Service Role Key>"

# (可选) 本地测试用配置 - 如果你运行了 supabase start
# NEXT_PUBLIC_SUPABASE_URL=[http://127.0.0.1:54321](http://127.0.0.1:54321)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
# SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Dify配置
DIFY_API_KEY=your_dify_api_key
DIFY_API_URL=[https://api.dify.ai](https://api.dify.ai)

# 网站URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4\. 链接本地 CLI 到云端项目 (关键步骤)

**每个团队成员**都需要执行此操作，将本地 CLI 指向共享的云端数据库，以便应用迁移：

```bash
# 登录 Supabase CLI (如果尚未登录)
supabase login

# 链接到云端项目 (项目ID可在项目设置中找到)
supabase link --project-ref <你的云端项目ID>

# 输入创建云端项目时设置的数据库密码 (安全保管，勿提交Git)
```

### 5\. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用程序。

## 数据库结构和数据 (参考)

(此部分描述本地操作，供参考，团队协作以云端为准)

### 数据库迁移

本地 `supabase start` 会自动应用 `supabase/migrations/` 目录下的所有迁移。

如果你在本地测试时需要重置数据库：

```bash
supabase db reset
```

这将删除本地数据库对象，重新应用所有迁移，并加载 `supabase/seed.sql` 数据。

### 访问本地 Supabase Studio

本地 Studio 地址: [http://127.0.0.1:54323](http://127.0.0.1:54323) (如果运行了 `supabase start`)

### 创建自己的迁移 (本地流程示例)

本地修改结构 -\> `supabase migration new <名称>` -\> 编辑 SQL -\> `supabase db reset` (重置并应用) 或 `supabase migration up` (仅应用新迁移)。**注意：最终目标是将迁移文件提交 Git 并应用到云端。**

## SSO配置开发

### 配置Google SSO（用于测试）

1.  访问[Google Cloud Console](https://console.cloud.google.com/)
2.  创建一个新项目
3.  在"API和服务" \> "凭据"中，创建一个OAuth客户端ID
4.  添加授权重定向URI：`http://localhost:3000/api/auth/callback/google`
5.  复制生成的Client ID和Client Secret
6.  **(重要)** 如果需要在 Supabase 中存储这些凭证（例如用于后端逻辑），**不应**直接写 SQL 更新。应考虑通过安全的方式（如环境变量或安全的配置管理）注入到需要它们的服务中。如果仅用于前端配置，则通过环境变量传递给前端。直接修改数据库中的 `sso_providers` 表通常不推荐用于管理敏感凭证。

## 代码贡献工作流

### 分支管理

1.  从`main`分支创建功能分支

<!-- end list -->

```bash
git checkout main
git pull
git checkout -b feature/your-feature-name
```

2.  提交你的更改

<!-- end list -->

```bash
git add .
git commit -m "feat(scope): 你的提交信息"
```

3.  推送到远程仓库

<!-- end list -->

```bash
git push origin feature/your-feature-name
```

4.  创建合并请求(Pull Request)

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

## Supabase 团队协作开发规范 (V1.0 - 2025/05/01)

本节规范团队在使用 Supabase Cloud 进行共享开发时的核心流程。

### A. 核心策略与原则

1.  **环境策略:**
      * **开发:** 使用 **Supabase Cloud Free Tier** 作为共享开发数据库。
      * **最终部署:** 目标为**私有化部署 (Self-Hosted)**。
      * **验证:** 项目后期需搭建自建 Staging 环境 (Docker) 模拟生产，用于测试。
2.  **基本原则:**
      * 数据库**结构变更 (Schema)** 必须通过 **Supabase CLI 迁移文件** (`supabase/migrations/`) 进行代码化管理。
      * **Git** 是数据库结构定义和种子数据 (`supabase/seed.sql`) 的**唯一真实来源 (Single Source of Truth)**。
      * 优先保证自动化、可追溯性，并确保结构定义的一致性。

### B. 初始环境设置 (每个开发者)

1.  **获取权限:** 确保已接受邀请加入项目的 Supabase **组织 (Organization)**。
2.  **本地配置:**
      * 确保安装并登录 Supabase CLI (`supabase login`)。
      * 在克隆的 Git 仓库根目录，执行 `supabase link --project-ref <云端项目ID>`，并按提示输入**数据库密码** (需安全保管)。
      * 配置 `.env.local` 文件，填入共享云端项目的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。敏感密钥（Service Role Key, DB Password）切勿提交到 Git。

### C. 日常开发 - 数据库结构变更

1.  **同步代码:** 开始任何变更前，执行 `git pull` 获取最新代码。
2.  **创建分支:** `git checkout -b feature/your-feature-name`。
3.  **创建迁移文件:** `supabase migration new <描述性迁移名称>`。
4.  **编写 SQL:** **编辑**新生成的位于 `supabase/migrations/` 目录下的 `.sql` 文件，添加 DDL 语句 (CREATE/ALTER TABLE, CREATE POLICY, etc.)。
5.  **本地验证 (可选):** 如需本地测试，可运行 `supabase start` 启动本地实例，然后运行 `supabase migration up` 应用新迁移进行验证。（注意：这不会影响云端数据库）。
6.  **提交 Git:** 将**新的迁移文件** (`supabase/migrations/` 目录下) 连同相关应用代码一起 `git add .`, `git commit`, `git push`。

### D. 应用变更到共享云端数据库

1.  **时机与负责人:** 团队需约定应用迁移到云端的时机（例如：合并 PR 后）和负责人（例如：Tech Lead 或提交者）。
2.  **操作流程:**
      * 确保本地代码为最新 (`git pull`)。
      * 执行 `supabase migration up`。
      * **说明:** 此命令会连接到**已链接的 Supabase Cloud 项目**，检查哪些本地存在的迁移文件尚未在云端执行，然后按顺序执行这些新的迁移。

### E. 初始/测试数据管理

1.  **种子文件:** 使用 `supabase/seed.sql` 定义和管理共享的初始数据或基础测试数据。
2.  **版本控制:** `seed.sql` 文件必须纳入 **Git** 管理。
3.  **应用:**
      * **本地:** `supabase db reset` 会自动应用所有迁移并执行 `seed.sql`。
      * **云端/Staging:** 通常需要手动连接数据库并执行 `seed.sql` 内容，或编写特定脚本来填充。

### F. 协作与冲突处理

1.  **频繁同步:** 强烈建议**频繁地** `git pull` 和 `git push`，以减少合并冲突和迁移冲突的窗口期。
2.  **沟通:** 进行可能影响他人的数据库结构变更前，提前与团队成员沟通。
3.  **迁移冲突:** 若 `supabase migration up` 应用到云端时失败（通常因为与他人同时修改了相同对象），**禁止修改已被 Git 记录的旧迁移文件**。应与相关人员沟通，并通过创建**新的迁移文件**来修正问题。

### G. 重要规范与禁止事项

1.  **必须:** 所有对数据库**结构**的修改都必须通过创建、提交和应用**迁移文件**来完成。
2.  **禁止:** **严禁**直接通过 Supabase Studio (项目仪表盘的图形界面) 对**云端开发数据库**进行任何**结构性**修改（可以管理数据）。
3.  **禁止:** **严禁**修改已合并到主开发分支或已在云端应用的迁移文件的内容。如有错误，应创建新迁移来修正。
4.  **禁止:** 在 Git 仓库中提交任何敏感信息，特别是 Supabase 数据库密码和 Service Role Key。

### H. 部署准备 (后期阶段)

1.  **搭建 Staging:** 在项目后期，需在独立服务器上使用 Docker 部署一套**自建 Supabase 环境**作为 Staging 环境。
2.  **完整测试:** 在 Staging 环境中：
      * 应用所有 Git 中的迁移文件 (`supabase migration up` 或同等操作)。
      * 部署应用程序。
      * 进行全面的功能和集成测试，确保与私有化部署环境的兼容性。

## 常见问题解答

### Q: Supabase启动失败怎么办？

A: 首先检查Docker是否正在运行。然后尝试以下命令：

```bash
supabase stop
docker system prune -a  # 清理未使用的Docker资源
supabase start
```

### Q: 如何在开发中添加新的SSO提供商？

A: 如果是配置信息（如 Client ID/Secret），推荐通过安全的环境变量注入应用后端，而不是硬编码或直接写入数据库。如果需要在数据库中记录支持的提供商列表（非敏感信息），则应通过**迁移文件**添加记录到相应表（如 `sso_providers`，如果存在这样的表）。

### Q: 如何添加测试数据？

A: 对于**通用的、所有开发者都需要**的初始数据，修改 `supabase/seed.sql` 并提交到 Git。对于**个人测试**或**一次性数据**，可以使用本地 Supabase Studio 或连接本地数据库进行添加。对于**共享云端数据库**的测试数据，可在 Supabase Cloud Studio 手动添加，或编写一次性脚本执行（注意不要影响他人）。

## 资源链接

  - [Next.js文档](https://nextjs.org/docs)
  - [Supabase文档](https://supabase.com/docs)
  - [Supabase CLI参考](https://supabase.com/docs/reference/cli/usage)

<!-- end list -->

```
```