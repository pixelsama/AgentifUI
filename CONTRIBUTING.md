# Contributing to AgentifUI (ifLabX community)

First off, **thank you** for taking the time to contribute!

Because AgentifUI uses a dual-licensing model (Apache 2.0 Community
Edition + proprietary Enterprise Edition), **all external contributors
must sign our Contributor License Agreement (CLA)**. The CLA ensures
Example Corp can distribute your code under both licenses.

## 1 – Sign the CLA

- Visit <https://cla.iflabx.com> and follow the on-screen steps.
- You’ll receive email confirmation; keep a copy for your records.
- Pull-request checks will fail if the CLA bot cannot verify your
  signature.

## 2 – Fork → Branch → Pull Request

1. Fork `ifLabX/AgentifUI` to your account.
2. Create a feature branch off `main`.
3. Write code & tests; run `make test`.
4. Push and open a PR; follow the PR template.

## 3 – Coding Standards

- **TypeScript/React**: `Prettier` + `ESLint` with automatic formatting
- **Code Formatting**: Run `pnpm run format` to format all files
- **Pre-commit Hooks**: Husky automatically formats staged files on commit
- **Editor Setup**: VSCode with Prettier extension for real-time formatting
- **Commit Messages**: Follow conventional format: `feat:`, `fix:`, `docs:`, `style:` prefixes

### Development Commands

```bash
# Format all files
pnpm run format

# Check formatting without changes
pnpm run format:check

# Fix ESLint issues and format
pnpm run code:fix

# Run linting only
pnpm run lint
pnpm run lint:fix
```

### Code Quality Tools

- **Prettier**: Automatic code formatting for TS/TSX/JSON/MD/CSS
- **ESLint**: Code quality and consistency checks
- **Husky**: Git hooks for pre-commit formatting
- **lint-staged**: Performance optimization for large codebases

## 4 – Third-party Code

- Only Apache 2.0 / MIT / BSD-style dependencies are accepted.
- Add new dependencies to `THIRD_PARTY_LICENSES` via
  `make license-report`.

By submitting code, you agree it may become part of future proprietary
releases of AgentifUI under the terms of the CLA.
