# pitad API: agent notes

NestJS 12 modular monolith. Part of the npm-workspaces monorepo; the shared contract lives in `packages/shared` (`@pitad/shared`).

## Rules

- **ESM only.** Relative imports use the `.js` extension even though the file is `.ts` (`import { X } from './x.js'`). No `__dirname` or `require`.
- **Build:** plain `tsc` to `dist`. `@pitad/shared` must be built first; root scripts do this (`npm run build:shared`).
- **Tests:** Vitest, with `*.spec.ts` next to the code. **Lint:** oxlint (`--type-aware`).
- **Config:** read env only through `ConfigService<Env, true>`. Add new variables to the Zod schema in `src/config/env.ts` and to `.env.example`. Never commit real secrets.
- **Responses:** return `ApiSuccess<T>` / `ApiPage<T>` / `ApiError` from `@pitad/shared`. Routes live under `API_PREFIX` (`/api/v1`).
- **Validation:** validate every external input with Zod 4 (`import * as z from 'zod'`).
- **Database:** Prisma 7 (pinned stable; do not upgrade to 8 RC). The generated client in `src/generated/prisma` is git-ignored; run `npm run prisma:generate` after schema changes. PostGIS columns use `Unsupported()` plus raw SQL in repositories.
- **Migrations:** `npm run prisma:migrate`. Never edit an applied migration.
- **Cost:** free-tier and open-source only. Ask before adding any hosted or paid service.
- **Privacy:** never log passwords, tokens, or raw GPS coordinates.

## Before finishing

Run from the repo root: `npm run lint && npm run typecheck && npm run test`.
