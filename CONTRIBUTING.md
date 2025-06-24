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

- **Python**: `black` + `isort`  
- **TypeScript/JS**: `eslint` with our preset  
- Commit messages: `feat:`, `fix:`, `docs:` prefixes.

## 4 – Third-party Code

- Only Apache 2.0 / MIT / BSD-style dependencies are accepted.  
- Add new dependencies to `THIRD_PARTY_LICENSES` via
  `make license-report`.

By submitting code, you agree it may become part of future proprietary
releases of AgentifUI under the terms of the CLA.
