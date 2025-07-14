# AgentifUI - Environment Setup Guide

This document outlines all the tools, installation steps, and configurations required to run and develop AgentifUI from source.

---

## ✅ Prerequisites

Ensure the following tools are installed before continuing:

| Tool           | Minimum Version | Recommended Version | Install Source                           | Verify Command       |
| -------------- | --------------- | ------------------- | ---------------------------------------- | -------------------- |
| Node.js        | 18.x            | 22.15.0             | https://nodejs.org / nvm                 | `node --version`     |
| pnpm           | 9.x             | 10.11.0             | `npm install -g pnpm`                    | `pnpm --version`     |
| Git            | 2.30.0          | 2.39.5              | https://git-scm.com / `brew install git` | `git --version`      |
| Supabase CLI   | 1.0.0           | latest              | `brew install supabase/tap/supabase`     | `supabase --version` |
| PM2 (optional) | latest          | -                   | `npm install -g pm2`                     | `pm2 --version`      |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/ifLabX/AgentifUI.git
cd AgentifUI

# Install dependencies
pnpm install
```

---

## ⚙️ Environment Variables

Create your `.env.local` file based on the template:

```bash
cp .env.example .env.local
```

Then fill in required variables. For production deployments, make sure to configure real values from your Supabase project and application domain.

See `.env.example` for full documentation on each variable.
Note: `.env.local` is required for all deployments. Missing or misconfigured values may cause the app to fail at startup.

---

## 🔑 API Key Encryption

To generate a secure API_ENCRYPTION_KEY:

```bash
openssl rand -hex 32
```

Use the result as the value for `API_ENCRYPTION_KEY` in `.env.local`.

---

## 🔗 Supabase CLI Setup

```bash
# Log in to your Supabase account
supabase login

# Link your local directory to a Supabase project
supabase link

# Push database migrations
supabase db push
```

---

## 🧪 Development

Start the local development server:

```bash
pnpm run dev
```

Visit the application at your configured `NEXT_PUBLIC_APP_URL` after `pnpm run dev` starts successfully.

---

## 🚀 Deployment (Production or Staging)

For production, set the correct environment variables in `.env.local`, build the app, and launch with PM2:

```bash
pnpm run deploy
```

PM2 will use `ecosystem.config.js` for process management.

---

## ✅ Validation Checklist

Ensure the following commands succeed:

- [ ] `node --version`
- [ ] `pnpm --version`
- [ ] `git --version`
- [ ] `supabase --version`
- [ ] `supabase login`
- [ ] `pnpm install`
- [ ] `pnpm run dev`
- [ ] `pnpm run deploy` (for production)

---

## 💡 Notes

- Supabase CLI uses Docker for local environments (`http://localhost:54321`)
- The `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the frontend
- `.env.local` should never be committed to version control
- For database reset: `supabase db reset && supabase db push`

---

## 📚 Related Docs

- `.env.example` — Full environment variable schema
- `README.md` — Project overview
- `CONTRIBUTING.md` — Contribution guide
- `supabase-docs.md` — Supabase schema and migration info

---

For questions or issues, please open a GitHub Issue or consult the Supabase documentation.

**Happy coding!**

```

```
