# pitad

A running and fitness app (iOS and Android): GPS tracking, analytics, training plans, pacing, social features.

Built incrementally in phases. See `docs/ROADMAP.md`.

## Stack

- **Mobile:** React Native, Expo SDK 58, Expo Router, TypeScript (strict)
- **API:** NestJS, PostgreSQL + PostGIS, Prisma, Redis, BullMQ (coming in later phases)
- **Tooling:** npm workspaces, Docker Compose, GitHub Actions

## Repository layout

```
apps/
  mobile/       Expo app
  api/          NestJS API (Phase 1, next)
packages/
  config/       Shared tsconfig presets
  shared/       Types and constants used by both apps
infra/docker/   Local PostgreSQL/PostGIS and Redis
docs/           Roadmap, conventions
```

## Quick start

See `docs/SETUP.md`. Development rules are in `docs/CONVENTIONS.md`.