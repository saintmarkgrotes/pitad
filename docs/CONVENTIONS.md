# Development conventions

## TypeScript

- Strict mode everywhere (`packages/config/tsconfig.base.json`), plus `noUncheckedIndexedAccess`.
- Application code is `.ts` / `.tsx` only. JavaScript is allowed only for tooling configs that require it (for example `eslint.config.mjs`).
- No `any`. If unavoidable, add a comment on the same line explaining why, and prefer `unknown` plus a type guard.
- No non-null assertions (`!`) and avoid `as` casts. Validate external data (API responses, storage, location events) with Zod instead.
- API contracts live in `packages/shared`. Both apps import from there; never duplicate a type.

## Architecture rules

- Business logic never lives in a controller or a screen component.
- GPS math (distance, pace, filtering, splits) lives in `packages/geo-core` as pure functions, with no React Native or NestJS imports, so it is easy to unit test.
- Geospatial SQL lives in one repository class per module. No raw SQL in services.

## Git

- Branches: `main` (stable), `develop` (integration), `feature/*`, `fix/*`, `hotfix/*`.
- Commit format: `type(scope): summary`, with types `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.
- One logical change per commit, committed once it is tested.
- Nothing is pushed or merged to a remote without explicit approval.

## Definition of done for a phase

TypeScript checks, lint and relevant tests pass; docs are updated; micro commits are made; a Phase Completion Report is written; development then stops until approved.

## Cost policy

Before adding any external service, API or dependency, write down: what it does, whether it has a free tier, its limits, whether an open-source alternative exists, and whether this phase actually needs it. No paid service is activated without approval.