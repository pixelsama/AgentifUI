好的，这是该开发工具链指南的中文翻译。

这份文档详细说明了 AgentifUI 项目的开发工具、自动化流程和质量保证体系，旨在帮助贡献者高效地编写出高质量、风格一致且易于维护的代码。

---

## 📋 AgentifUI 开发者工具链指南 (中文翻译)

### 概述

本指南全面介绍了 AgentifUI 的开发工具链和自动化质量保证体系。作为一名贡献者，您将通过这些工具来确保代码的质量、一致性和可维护性。

---

### 🔧 核心开发工具

#### TypeScript 配置

**配置文件**: `tsconfig.json`

**核心特性**:

- ✅ **严格模式**: 通过严格的编译器设置实现全面的类型安全。
- ✅ **路径映射**: 使用 `@/*`, `@lib/*`, `@components/*` 等别名实现清晰的模块导入。
- ✅ **Next.js 集成**: 为 Next.js 15 的 App Router 进行了优化。
- ✅ **Jest 支持**: 集成了测试环境所需的类型定义。

**您会用到的命令**:

```bash
pnpm type-check     # 运行 TypeScript 编译器进行类型检查，但不生成 JS 文件
```

#### ESLint 配置

**配置文件**: `eslint.config.mjs`

**双重 Linting 策略**:

1.  **Oxlint** (主要 - 速度极快)
    - 基于 Rust 的 linter，性能卓越。
    - 运行时间仅需毫秒级，而非秒级。
    - 快速捕捉常见问题。

2.  **ESLint** (次要 - 功能全面)
    - 传统的 JavaScript/TypeScript 代码检查工具。
    - 包含 Next.js 特定规则。
    - 与 TypeScript 深度集成。

**您会用到的命令**:

```bash
pnpm lint            # 同时运行 Oxlint 和 ESLint (推荐)
pnpm lint:fast       # 仅运行 Oxlint (用于快速检查)
pnpm lint:eslint     # 仅运行 ESLint
pnpm lint:errors     # 只显示错误，不显示警告
pnpm lint:complexity # 检查代码复杂度 (最大值为 15)
pnpm fix:eslint      # 自动修复 ESLint 发现的问题
```

#### Prettier 代码格式化

**配置文件**: `.prettierrc.json`

**特性**:

- 🎨 **自动导入排序**: 按照 React → Next.js → 外部库 → 内部模块的顺序排序。
- 🎨 **Tailwind Class 排序**: 自动对 Tailwind CSS 的类名进行排序。
- 🎨 **统一代码风格**: 80 字符行宽、单引号、使用分号。
- 🎨 **智能忽略**: 自动忽略构建产物、数据库迁移文件和自动生成的文件。

**您会用到的命令**:

```bash
pnpm format         # 格式化所有文件
pnpm format:check   # 检查文件是否需要格式化
pnpm format:files   # 格式化指定文件
```

---

### 🔄 自动化 Git 钩子 (Husky)

#### Pre-commit 钩子 (`.husky/pre-commit`)

**当您提交代码时会发生什么**:

1.  **🔍 TypeScript 检查**
    - 验证所有 TypeScript 文件。
    - 如果存在类型错误，提交将被中止。

2.  **🎨 Lint-Staged 格式化**
    - 仅对暂存区（staged）的文件运行 Prettier。
    - 对暂存区的 JS/TS 文件运行 ESLint 并自动修复。
    - 自动将格式化后的改动添加到暂存区。

3.  **🧪 条件化测试**
    - 智能执行测试。
    - 仅对暂存区内匹配 `.test.` 或 `.spec.` 模式的测试文件运行测试。
    - 如果本次提交没有涉及测试文件，则跳过测试步骤。

#### Commit Message 钩子 (`.husky/commit-msg`)

**提交信息验证**:
使用 `commitlint` 工具进行验证。

**要求格式** (约定式提交 Conventional Commits):

```
type(scope): subject

示例:
✅ feat(auth): add SSO login support (功能(登录): 增加 SSO 登录支持)
✅ fix(chat): resolve message ordering issue (修复(聊天): 解决消息排序问题)
✅ refactor(admin): optimize content management UI (重构(管理后台): 优化内容管理界面)
❌ added new feature (错误示例: 增加了新功能)
❌ fix bug (错误示例: 修复 bug)
```

**支持的类型**:

- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 代码重构
- `style`: 代码风格改动
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建过程或工具变动

---

### 🧪 测试框架

**配置文件**: `jest.config.js`, `jest.setup.js`

**Jest 配置特性**:

- 🧪 **React Testing Library**: 提供组件测试的实用工具。
- 🧪 **全面的模拟 (Mocks)**: 预设了 Next.js router、navigation、intl、images 等模块的模拟。
- 🧪 **路径映射**: 与主应用共享相同的导入路径别名。
- 🧪 **覆盖率报告**: 生成详细的测试覆盖率指标。
- 🧪 **JSDOM 环境**: 提供类浏览器的测试环境。

**预配置的 Mocks**:

- `next/router` 和 `next/navigation`
- `next/image` 和 `next/link`
- `next-intl` (用于国际化)
- `IntersectionObserver` 和 `ResizeObserver`
- 全局 `fetch` API

**您会用到的命令**:

```bash
pnpm test          # 运行所有测试
pnpm test:watch    # 以观察模式运行测试
pnpm test:coverage # 运行测试并生成覆盖率报告
pnpm test:ci       # 运行为 CI 环境优化的测试
```

---

### 🏗️ 构建和开发工具

#### Next.js 配置 (`next.config.ts`)

**核心特性**:

1.  **打包文件分析**:
    ```bash
    ANALYZE=true pnpm build    # 生成打包文件体积分析报告
    ```
2.  **独立构建 (Standalone Builds)**:
    ```bash
    pnpm build:standalone     # 创建一个自包含的、可用于部署的构建版本
    ```
3.  **开发环境优化**:
    - 跨域请求处理
    - 热模块替换 (HMR)
    - 使用 `--inspect` 进入调试模式
4.  **生产环境优化**:
    - 自动移除 `console.log` (保留 `error` 和 `warn`)
    - 为服务器端依赖配置 Webpack externals
    - 修复与 Supabase WebSocket 的兼容性问题

#### Tailwind CSS 配置 (`tailwind.config.js`)

**自定义特性**:

- 🎨 **暗黑模式**: 支持基于 class 的暗黑模式。
- 🎨 **排版**: 带有备用方案的全局 serif 字体系统。
- 🎨 **自定义动画**: 包括滑动、淡入淡出、弹跳、闪烁等效果。
- 🎨 **滚动条插件**: 支持自定义滚动条样式。

---

### 🌍 国际化 (i18n) 工具

#### 验证脚本

**基于 Python 的验证工具**:

```bash
pnpm i18n:check      # 快速检查所有语言文件结构的一致性
pnpm i18n:validate   # 对翻译内容进行详细验证
pnpm i18n:detect     # 检测代码中缺失的翻译 key
```

**这些脚本会检查**:

- 📝 所有语言的翻译 key 结构是否一致。
- 📝 任何语言文件中是否有缺失的翻译。
- 📝 代码库中是否存在未被使用的翻译 key。
- 📝 语言文件（JSON）是否存在格式错误。

---

### ⚡ 开发者工作流

#### 日常开发流程

1.  **启动开发环境**:
    ```bash
    pnpm dev         # 启动并开启调试模式
    # 或
    pnpm dev:clean   # 启动但不开启调试
    ```
2.  **编写代码**:
    - 在完整的 TypeScript 支持下编辑代码。
    - 如果 IDE 已配置，保存时会自动格式化。
    - 实时类型检查。
3.  **提交前验证**:
    ```bash
    pnpm type-check  # 手动进行类型检查
    pnpm lint        # 手动进行代码检查
    pnpm test        # 手动运行测试
    ```
4.  **提交代码**:
    ```bash
    git add .
    git commit -m "feat(scope): description"
    # 自动运行 pre-commit 钩子:
    # - TypeScript 检查
    # - Prettier 格式化
    # - ESLint 修复
    # - 测试执行 (如果暂存区有测试文件)
    # - 提交信息验证
    ```

---

### 🔍 质量门禁

#### 提交质量门禁

**提交前验证**:

- ✅ TypeScript 编译通过
- ✅ 所有暂存文件均已正确格式化
- ✅ 满足所有 ESLint 规则
- ✅ 暂存的测试文件全部通过
- ✅ 提交信息遵循约定式规范

#### 构建质量门禁

**CI/生产环境要求**:

- ✅ 无 TypeScript 错误
- ✅ 所有测试通过
- ✅ 构建成功完成
- ✅ 无严重级别的 linting 错误
- ✅ 打包文件体积在限制范围内

---

### 🛠️ 故障排查

#### 常见问题

**1. Pre-commit 钩子执行失败**

```bash
# 若是 TypeScript 错误
pnpm type-check        # 查看具体错误信息

# 若是格式化问题
pnpm format            # 修复格式
git add .              # 重新暂存格式化后的文件

# 若是测试失败
pnpm test [file]       # 运行指定的测试文件
```

**2. 构建错误**

```bash
# 清除 Next.js 缓存
rm -rf .next

# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 检查 TypeScript 问题
pnpm type-check
```

---

### 🤝 贡献指南

在为 AgentifUI 贡献代码时，请遵循以下准则：

1.  **在推送代码前务必运行类型检查**。
2.  **严格遵守提交信息规范**。
3.  为新功能**编写测试用例**。
4.  在添加新功能时**更新相关文档**。
5.  **尊重自动化格式化**——不要和 Prettier “对着干”。
6.  **使用项目提供的脚本**，而不是手动调用工具。

这套工具链旨在**帮助您更快地编写出更优秀的代码**——请拥抱自动化，专注于构建卓越的功能！🚀
