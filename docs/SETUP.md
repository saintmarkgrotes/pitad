# First-time setup

Requirements: Node.js, npm, Docker. The Expo app (SDK 58) lives in `apps/mobile`.

## 1. Install

```bash
cp .env.example .env        # then change POSTGRES_PASSWORD (and DATABASE_URL to match)
npm install                 # from the repo root: installs every workspace
```

## 2. Database and cache

```bash
npm run db:up
docker compose -f infra/docker/docker-compose.yml --env-file .env ps   # both should be "healthy"
```

Check PostGIS is available:

```bash
docker exec -it pitad-postgres psql -U pitad -d pitad -c "CREATE EXTENSION IF NOT EXISTS postgis; SELECT postgis_version();"
```

## 3. Run the mobile app

Run Expo commands from `apps/mobile`:

```bash
cd apps/mobile
npx expo start
npx expo lint
npx tsc --noEmit
```

Add Expo-managed packages with `npx expo install <package>` from `apps/mobile`. Add workspace packages (such as `@pitad/shared`) by editing `package.json` and running `npm install` from the root.

## 4. Run the API (NestJS)

After cloning or pulling schema changes, generate the Prisma client and apply migrations:

```bash
npm run prisma:generate -w @pitad/api
npm run prisma:migrate -w @pitad/api
```

The generated client (`apps/api/src/generated/`) is git-ignored, so `tsc` fails until you run `prisma:generate`.

## Troubleshooting

- **Port 5432 already in use:** change `POSTGRES_PORT` in `.env`.
- **Compose says a variable is missing:** you did not copy `.env.example` to `.env`.
- **Metro can't resolve `@pitad/shared`:** run `npx expo start --clear` from `apps/mobile`, then check `npm why react-native` for duplicate versions.
- **Phone cannot reach the API:** use your computer's LAN IP, not `localhost`.
