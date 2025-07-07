# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development Commands

```bash
# Start development server (Ask before running - developer usually has this running)
pnpm dev

# Type checking (Recommended for validation)
pnpm type-check

# Build project (Safe to run for verification)
pnpm build

# Format code
pnpm format
pnpm format:check
```

### I18n Commands

```bash
# Quick check translation structure consistency
pnpm i18n:check

# Detailed validation of translations
pnpm i18n:validate

# Detect missing translation keys
pnpm i18n:detect
```

## Architecture Overview

AgentifUI is a Next.js 15 App Router application with the following key architectural layers:

### Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: Supabase (Auth + Postgres + Storage)
- **State Management**: Zustand
- **UI**: Tailwind CSS 4, Radix UI components
- **API Integration**: Dify API for LLM services
- **Package Manager**: pnpm

### Key Directory Structure

```
app/                    # Next.js routes and pages
├── api/               # API routes (Dify proxy, auth, admin)
├── admin/             # Admin dashboard pages
├── chat/              # Chat interface pages
├── apps/              # App launcher pages
└── settings/          # User settings pages

components/             # Reusable UI components
├── ui/                # Base UI components (buttons, inputs, etc.)
├── chat/              # Chat-specific components
├── admin/             # Admin-specific components
└── auth/              # Authentication components

lib/                   # Core business logic
├── services/          # Service layer (API calls, data processing)
│   ├── dify/          # Dify API integration services
│   ├── db/            # Database services
│   └── admin/         # Admin services
├── stores/            # Zustand state stores
├── hooks/             # Custom React hooks
├── db/                # Database access layer
└── utils/             # Utility functions

supabase/              # Database migrations and configuration
└── migrations/        # SQL migration files
```

### Core Design Principles

1. **Security-First**: Uses Supabase RLS (Row Level Security) and encrypted API key storage
2. **Layered Architecture**: Clear separation between UI, services, and data layers
3. **Type Safety**: Full TypeScript coverage with strict typing
4. **Internationalization**: Multi-language support with next-intl (zh-CN, en-US, es-ES, zh-TW, ja-JP)
5. **Real-time Updates**: Supabase realtime subscriptions for live data

### Dify Integration Architecture

The Dify API integration follows a 3-layer pattern:

1. **Proxy Layer**: `app/api/dify/[appId]/[...slug]/route.ts` - Handles authentication and request forwarding
2. **Service Layer**: `lib/services/dify/*.ts` - Business logic and API calls
3. **Type Layer**: `lib/services/dify/types.ts` - TypeScript definitions

### State Management

- **Zustand stores** in `lib/stores/` for different domains (chat, sidebar, theme, etc.)
- **Custom hooks** in `lib/hooks/` for complex state logic
- **Real-time sync** via Supabase subscriptions

### Database Layer

- **Access layer**: `lib/db/*.ts` - Direct database operations
- **Service layer**: `lib/services/db/*.ts` - Higher-level database services
- **Migrations**: `supabase/migrations/` - SQL schema and RLS policies

## Development Guidelines

### Before Starting Development

1. **Never run `pnpm dev`** unless explicitly asked - developers usually have this running
2. Use `pnpm type-check` and `pnpm build` for validation
3. Follow the development workflow rule in `.cursor/rules/development-workflow-rule.mdc`

### Code Quality

- Always run `pnpm type-check` before submitting changes
- Use `pnpm format` for code formatting
- Follow the existing code patterns and TypeScript conventions

### Comment Standards

Follow `.cursor/rules/comment-rule.mdc`:

- **Language**: All comments must be in English
- **Purpose**: Explain _why_, not just _what_
- **Format**: Use JSDoc for interfaces/functions, simple comments for logic
- **Style**: Concise and clear

Example JSDoc:

```typescript
/**
 * Send chat message to Dify API with streaming response
 *
 * @param payload - Request payload to send to Dify API
 * @param appId - Dify application ID
 * @returns Promise containing async generator and conversation metadata
 * @throws Error if fetch request fails or API returns error status
 */
```

### I18n Development

- All user-facing text must be internationalized
- Add keys to `messages/zh-CN.json` first (source language)
- Maintain structure consistency across all language files
- Run `pnpm i18n:check` after adding translations
- **NEVER replace existing `t()` calls with hardcoded English text**
- **NEVER use hardcoded strings like "Loading..." - always use translations**
- When adding dynamic translation features, preserve existing translation patterns

### Dify API Integration

- Follow the 3-layer architecture pattern
- Define types in `lib/services/dify/types.ts`
- Implement services in appropriate `lib/services/dify/*.ts` files
- Use the proxy layer for secure API calls

## Git Commit Guidelines

### Commit Message Format

- Follow conventional commit format: `type(scope): description`
- **NEVER include Claude Code footer or co-authorship lines**
- Examples:
  ```
  feat(auth): add SSO login support
  fix(chat): resolve message ordering issue
  refactor(admin): optimize content management UI
  ```

### Prohibited Footer Content

**DO NOT add these lines to any commit:**

```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Important Notes

- **Database**: Uses Supabase with comprehensive RLS policies
- **Authentication**: Supabase Auth with SSO support
- **Styling**: Tailwind CSS 4 with custom theme configuration
- **File Structure**: Follows Next.js 15 App Router conventions
- **Error Handling**: Comprehensive error boundaries and user feedback systems
- **Development Rules**: Follow `.cursor/rules/cursor-rules.mdc` for rule management
