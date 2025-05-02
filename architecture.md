# LLM-EduHub架构设计文档

## 1. 整体架构概览

```
┌─────────────────┐      ┌───────────────────┐      ┌─────────────────┐      ┌─────────────┐
│                 │      │                   │      │                 │      │             │
│  前端应用层       │──────▶   Next.js API层   │──────▶   服务集成层      │──────▶  数据存储层  │
│  React + TS     │      │   路由和中间件      │      │  Supabase API   │      │ PostgreSQL  │
│  Tailwind CSS   │◀─────│                   │◀─────│  Dify API       │◀─────│ (Supabase)  │
│                 │      │                   │      │                 │      │             │
└─────────────────┘      └───────────────────┘      └─────────────────┘      └─────────────┘
```

LLM-EduHub采用现代化的四层架构设计，结合Next.js App Router的最佳实践，实现前端、API、服务集成和数据存储的无缝衔接。这种分层设计确保了关注点分离，使系统更易于维护和扩展。

## 2. 前端架构

### 技术栈
- **框架**: React 18+
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS
- **构建工具**: Next.js (App Router)
- **状态管理**: Zustand
- **工具库**: Lucide Icons, clsx/cn

### 目录结构设计
```
llm-eduhub/
  ├── .cursor/            # Cursor IDE配置文件
  │   └── rules/          # 项目特定规则和文档
  ├── .next/              # Next.js构建输出
  ├── .vscode/            # VSCode配置文件
  ├── app/                # 应用源代码（App Router模式）
  │   ├── api/            # API路由
  │   │   ├── auth/       # 认证相关API
  │   │   │   ├── identify/ # 用户身份识别
  │   │   │   └── sso/    # 单点登录
  │   │   └── dify/       # Dify API集成
  │   │       └── [appId]/[...slug]/ # 动态路由处理
  │   ├── about/          # About页面路由
  │   ├── chat/           # 聊天页面路由
  │   ├── login/          # 登录页面路由
  │   ├── register/       # 注册页面路由
  │   └── page.tsx        # 首页路由
  ├── components/         # 组件目录
  │   ├── ui/             # 通用UI组件
  │   ├── auth/           # 认证相关组件
  │   ├── chat/           # 聊天相关组件
  │   ├── home/           # 首页相关组件
  │   ├── layouts/        # 布局组件
  │   │   ├── Header.tsx
  │   │   ├── Footer.tsx
  │   │   └── ...
  │   └── sidebar/        # 侧边栏组件
  │       ├── index.tsx        # 侧边栏主组件
  │       ├── sidebar-container.tsx # 侧边栏容器
  │       ├── sidebar-header.tsx # 侧边栏头部
  │       ├── sidebar-content.tsx # 侧边栏内容
  │       ├── sidebar-footer.tsx # 侧边栏底部
  │       ├── sidebar-button.tsx # 侧边栏按钮
  │       ├── sidebar-chat-list.tsx # 聊天列表
  │       ├── sidebar-app-list.tsx # 应用列表
  │       ├── sidebar-backdrop.tsx # 移动设备背景遮罩
  │       ├── sidebar-chat-icon.tsx # 聊天图标
  │       └── ... 
  ├── hooks/              # 自定义React钩子
  │   └── use-mobile.ts   # 移动设备检测
  ├── lib/                # 工具和配置
  │   ├── config/         # 配置文件
  │   ├── hooks/          # 共享钩子函数
  │   │   └── use-theme.ts # 主题钩子
  │   ├── stores/         # 状态管理
  │   │   ├── sidebar-store.ts # 侧边栏状态
  │   │   └── theme-store.ts   # 主题状态
  │   └── utils/          # 工具函数
  ├── public/             # 静态资源
  ├── scripts/            # 开发、部署等实用脚本
  │   ├── test_dify_proxy_advanced.py # 高级Dify代理测试脚本
  │   └── test_dify_proxy_streaming.py # Dify流式代理测试脚本
  ├── styles/             # 全局样式
  ├── supabase/           # Supabase配置和迁移
  │   ├── .branches/      # 分支管理
  │   ├── .temp/          # 临时文件
  │   └── migrations/     # 数据库迁移
  ├── .env.local          # 本地环境变量
  ├── .gitignore          # Git忽略配置
  ├── CONTRIBUTING.md     # 贡献指南
  ├── eslint.config.mjs   # ESLint配置
  ├── middleware.ts       # Next.js中间件
  ├── next-env.d.ts       # Next.js TypeScript声明
  ├── next.config.ts      # Next.js配置
  ├── package-lock.json   # 依赖锁定文件
  ├── package.json        # 项目依赖和脚本
  ├── postcss.config.mjs  # PostCSS配置
  ├── README.md           # 项目文档
  ├── tailwind.config.js  # Tailwind配置
  └── tsconfig.json       # TypeScript配置
```

> **注意**：新的目录结构中，`components`和`lib`目录已移至项目根目录，不再使用括号命名法，这样可以更好地组织代码并简化导入路径。

### 组件架构

#### 聊天模块组件结构
```
components/
  ├── chat/              # 聊天相关组件
  │   ├── chat-loader.tsx       # 消息列表渲染组件
  │   ├── chat-input-backdrop.tsx # 输入框背景层
  │   └── welcome-screen.tsx    # 欢迎界面组件
  └── chat-input/        # 聊天输入组件
      └── index.tsx      # 聊天输入框主组件
```

#### 聊天组件职责划分

1. **ChatLoader**
   - 负责渲染消息列表
   - 处理消息布局和样式
   - 支持用户/AI消息差异化展示
   - 使用统一宽度类保持一致性

2. **ChatInputBackdrop**
   - 提供输入框背景遮罩
   - 防止消息穿透到输入框
   - 保持与其他组件统一宽度

3. **WelcomeScreen**
   - 展示初始欢迎界面
   - 提供用户引导信息
   - 支持暗色模式适配

4. **ChatInput**
   - 复合组件设计模式
   - 包含子组件：
     - ChatButton: 功能按钮
     - ChatTextInput: 文本输入区
     - ChatButtonArea: 按钮布局
     - ChatTextArea: 文本区域
     - ChatContainer: 容器组件

### 响应式设计架构

#### 宽度管理系统
```typescript
// lib/hooks/use-chat-width.ts
export function useChatWidth() {
  const isMobile = useMobile()
  const widthClass = isMobile ? "max-w-full" : "max-w-3xl"
  const paddingClass = isMobile ? "px-2" : "px-4"
  return { widthClass, paddingClass, isMobile }
}
```

#### 统一宽度应用
- ChatLoader、ChatInput、ChatInputBackdrop 共用相同宽度类
- 移动端自适应全宽
- 桌面端最大宽度限制

## 3. 状态管理

### 聊天状态管理
```typescript
// lib/stores/chat-input-store.ts
interface ChatState {
  isWelcomeScreen: boolean
  setIsWelcomeScreen: (isWelcome: boolean) => void
  isDark: boolean
  toggleDarkMode: () => void
}
```

### 钩子函数设计
```
lib/hooks/
  ├── use-chat-interface.ts  # 聊天界面逻辑封装
  ├── use-chat-width.ts      # 统一宽度管理
  ├── use-mobile.ts          # 移动设备检测
  └── use-theme.ts           # 主题管理
```

## 4. API层设计

### API路由结构
```
app/
  ├── api/
  │   ├── auth/                     # 认证相关API
  │   │   ├── identify/             # 用户身份识别
  │   │   └── sso/                  # 单点登录
  │   ├── dify/                     # Dify API集成
  │   │   └── [appId]/[...slug]/    # 动态路由处理
  │   └── ...                       # 其他API路由
  └── ...
```

### 中间件设计
中间件主要分为两类：

1. **Edge中间件**：位于项目根目录的`middleware.ts`文件，运行在Edge运行时环境，在路由解析前处理所有传入请求。主要负责：
   - 认证状态验证
   - 基本的请求检查
   - 路由重定向
   - CORS配置
   - 请求频率限制

2. **API路由中间件**：在具体API路由处理函数内部使用的逻辑组件，负责：
   - API密钥管理和验证
   - 请求参数验证
   - 详细请求日志
   - 错误处理和格式化

## 5. 数据存储设计

### Supabase表结构

```
├── auth.users                 # Supabase内置用户表
│   ├── id
│   ├── email
│   ├── created_at
│   └── ...
├── user_profiles              # 用户资料
│   ├── user_id (FK -> auth.users.id)
│   ├── display_name
│   ├── avatar_url
│   └── ...
├── chat_sessions              # 聊天会话
│   ├── id
│   ├── user_id (FK -> auth.users.id)
│   ├── title
│   ├── created_at
│   └── ...
├── chat_messages              # 聊天消息
│   ├── id
│   ├── session_id (FK -> chat_sessions.id)
│   ├── role (user/assistant)
│   ├── content
│   ├── created_at
│   └── ...
├── model_providers            # 模型提供商
│   ├── id
│   ├── name
│   ├── api_base
│   └── ...
└── api_keys                   # API密钥管理
    ├── id
    ├── provider_id (FK -> model_providers.id)
    ├── key_value (加密存储)
    ├── usage_count
    └── ...
```

### 存储策略
- 敏感数据（如API密钥）使用Supabase提供的行级安全性(RLS)和服务器端加密
- 大型数据（如聊天历史）考虑分页加载和增量同步
- 实时功能（如聊天）利用Supabase的实时订阅功能

## 6. 认证流程

### 认证方式
- Supabase内置认证（邮箱/密码）
- OAuth社交登录（GitHub, Google等）
- 企业SSO集成

### 认证流程图
```
用户 → 登录请求 → Next.js API(auth/...) → Supabase Auth → JWT令牌
  ↓
保存令牌 → 客户端状态更新 → 受保护资源访问 → API中间件验证
```

## 7. AI模型集成

### Dify API集成
- 使用代理模式将前端请求安全地转发到Dify API
- 在代理层处理API密钥管理和请求转换
- 支持流式响应和错误处理

### 多模型供应商架构
```
客户端请求 → Next.js API → 模型路由层 → Dify API / 其他模型提供商
                             ↑
                        模型配置管理
                        API密钥管理
```

**模型路由决策逻辑**：
- 基于用户在界面中的明确选择
- 考虑配置的使用限额和成本控制
- 根据请求特性选择最适合的模型（如需要流式响应的对话选用支持流式的模型）
- 提供自动故障转移能力，当首选模型不可用时切换到备选模型

### 模型调用优化
- 实现请求缓存减少重复调用
- 添加重试机制处理临时故障
- 实现模型回退策略确保可用性

## 8. 部署和扩展策略

### 部署选项
- **开发环境**: 本地开发服务器
- **测试环境**: Vercel预览部署
- **生产环境**: Vercel或其他云服务提供商

### 扩展考虑
- 使用Edge Functions提高全球性能
- 实现细粒度缓存策略减少API调用
- 考虑无服务器数据库连接池管理大量连接

## 9. 安全性考虑

### 数据安全
- API密钥等敏感信息仅在服务器端处理
- 实现请求来源验证防止未授权访问
- 定期轮换密钥和令牌

### 输入验证
- 对所有API输入实施严格验证
- 实现内容过滤防止潜在的LLM注入攻击，具体策略包括：
  - 使用输入清理库（如DOMPurify）处理用户输入
  - 实施输入长度和格式限制
  - 移除或转义潜在的指令注入模式
  - 实现提示模板隔离，避免用户输入直接拼接到系统提示中
  - 对模型输出进行后处理，检测并过滤不适当内容
- 限制请求大小和频率

## 10. 后续开发路线图

### 近期计划
- 完善基础组件库
- 实现核心认证流程
- 建立Dify API代理的完整功能

### 中期目标
- 添加用户资料和偏好设置
- 实现高级聊天功能（历史、保存等）
- 添加多模型切换能力

### 长期愿景
- 构建高级分析仪表板
- 实现企业级权限管理
- 支持自定义模型微调和部署

## 11. 参考资源

- Next.js App Router文档
- Supabase文档中的身份验证和数据库指南
- Dify API文档和集成示例
- Tailwind CSS设计系统最佳实践

这份架构文档提供了LLM-EduHub项目的整体设计蓝图，应根据项目进展和需求变化定期更新。
