# Development Tools Guide

This document provides a comprehensive guide to the development tools and code quality systems used in AgentifUI.

## 🛠 Tool Overview

| Tool            | Purpose                              | Auto-run              |
| --------------- | ------------------------------------ | --------------------- |
| **Prettier**    | Code formatting (TS/TSX/JSON/MD/CSS) | ✅ On save, On commit |
| **ESLint**      | Code quality & consistency checks    | ✅ On commit          |
| **Husky**       | Git hooks management                 | ✅ Automatic          |
| **lint-staged** | Run tools only on staged files       | ✅ On commit          |
| **TypeScript**  | Type checking                        | Manual                |

## 📋 Available Commands

### Code Formatting

```bash
# Format entire project
pnpm run format

# Check if files need formatting (CI/CD friendly)
pnpm run format:check

# Format and fix linting issues in one command
pnpm run code:fix
```

### Code Quality

```bash
# Run ESLint checks
pnpm run lint

# Fix auto-fixable ESLint issues
pnpm run lint:fix

# TypeScript type checking
npx tsc --noEmit

# Build project (includes type checking)
pnpm run build
```

## ⚙️ Configuration Files

### `.prettierrc.json`

- Code formatting rules (indentation, quotes, semicolons, etc.)
- Import sorting configuration
- Tailwind CSS class sorting
- Plugin configurations

### `.prettierignore`

- Files and directories excluded from formatting
- Build outputs, dependencies, generated files
- Temporary exclusions for problematic files

### `.husky/pre-commit`

- Git pre-commit hook
- Automatically runs lint-staged on commit
- Prevents commits with formatting issues

### `package.json` - lint-staged

- Configures which tools run on which file types
- TypeScript files: ESLint + Prettier
- Other files: Prettier only

### `.vscode/settings.json`

- VSCode workspace settings
- Default formatter configuration
- Format on save settings
- Language-specific formatter assignments

## 🔄 Automated Workflows

### 1. Development (VSCode)

- **On Save**: Prettier formats the current file
- **On Paste**: Prettier formats pasted content
- **Real-time**: ESLint shows warnings/errors

### 2. Git Commit

- **Pre-commit Hook**: Husky runs lint-staged
- **Staged Files Only**: Only formats files you're committing
- **Auto-fix**: ESLint auto-fixes issues when possible
- **Format**: Prettier formats all staged files
- **Backup**: Git stash saves original state

### 3. CI/CD (Recommended)

```bash
# In your CI pipeline
pnpm run format:check  # Fail if formatting needed
pnpm run lint         # Fail on linting errors
npx tsc --noEmit      # Fail on type errors
pnpm run build        # Fail on build errors
```

## 🎯 Best Practices

### For Developers

1. **Install VSCode Extensions**:
   - Prettier - Code formatter
   - ESLint
   - Tailwind CSS IntelliSense

2. **Use Project Commands**:
   - Run `pnpm run format` for entire project
   - Use `pnpm run code:fix` before committing
   - Let VSCode auto-format on save

3. **Trust the Automation**:
   - Let Husky handle pre-commit formatting
   - Don't manually format before committing
   - Focus on code logic, let tools handle style

### For Teams

1. **Consistent Setup**:
   - All developers use same VSCode settings
   - Shared Prettier and ESLint configurations
   - Automated enforcement via Git hooks

2. **Code Review Focus**:
   - No need to review formatting issues
   - Focus on logic, architecture, and functionality
   - Formatting is automatically consistent

## 🚨 Troubleshooting

### Prettier Not Working in VSCode

1. **Check Extension**: Install "Prettier - Code formatter" extension
2. **Check Settings**: Verify `.vscode/settings.json` is correct
3. **Reload VSCode**: Sometimes settings need a restart
4. **Check File Type**: Ensure file type is supported

### Pre-commit Hook Failing

```bash
# If hook fails, check what's wrong
pnpm run format:check
pnpm run lint

# Fix issues manually
pnpm run code:fix

# Try commit again
git commit -m "your message"
```

### Formatting Conflicts

```bash
# If you have formatting conflicts
git stash                    # Save your changes
pnpm run format             # Format everything
git stash pop               # Restore your changes
# Resolve any merge conflicts
```

### Performance Issues

```bash
# For large projects, lint-staged only processes staged files
# If you need to format everything:
pnpm run format

# To check specific files:
pnpm dlx prettier --check "src/**/*.{ts,tsx}"
```

## 📁 File Support

| File Type | Prettier | ESLint | Auto-format |
| --------- | -------- | ------ | ----------- |
| `.ts`     | ✅       | ✅     | ✅          |
| `.tsx`    | ✅       | ✅     | ✅          |
| `.js`     | ✅       | ✅     | ✅          |
| `.jsx`    | ✅       | ✅     | ✅          |
| `.json`   | ✅       | ❌     | ✅          |
| `.md`     | ✅       | ❌     | ✅          |
| `.css`    | ✅       | ❌     | ✅          |
| `.scss`   | ✅       | ❌     | ✅          |
| `.yaml`   | ✅       | ❌     | ✅          |
| `.html`   | ✅       | ❌     | ✅          |

## 🔧 Customization

### Adding New File Types

1. **Update `.prettierrc.json`** if special formatting needed
2. **Update `package.json` lint-staged** to include new patterns
3. **Update `.vscode/settings.json`** for editor support

### Excluding Files

1. **Add to `.prettierignore`** to exclude from formatting
2. **Add to `.eslintignore`** to exclude from linting
3. **Update lint-staged patterns** if needed

### Changing Rules

1. **Prettier rules**: Edit `.prettierrc.json`
2. **ESLint rules**: Edit `eslint.config.mjs`
3. **Test changes**: Run `pnpm run format:check` and `pnpm run lint`

## 📚 Additional Resources

- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [VSCode Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
