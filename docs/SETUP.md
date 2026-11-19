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

Build the shared package, generate the Prisma client and apply the migrations (the database from step 2 must be running):

```bash
npm run build:shared
npm run prisma:generate -w @pitad/api
npm run prisma:migrate -w @pitad/api
```

The shared package's `dist` and the generated Prisma client (`apps/api/src/generated/`) are git-ignored, so `tsc` fails until you run these.

Start the API:

```bash
npm run start:dev -w @pitad/api     # from the repo root
```

Check it: `GET http://localhost:3000/api/v1/health`.

To reach it from a phone, use your computer's LAN IP instead of `localhost`, and allow Node through the Windows firewall when prompted.

## Troubleshooting

- **Port 5432 already in use:** change `POSTGRES_PORT` in `.env`.
- **Compose says a variable is missing:** you did not copy `.env.example` to `.env`.
- **Metro can't resolve `@pitad/shared`:** run `npx expo start --clear` from `apps/mobile`, then check `npm why react-native` for duplicate versions.
- **Phone cannot reach the API:** use your computer's LAN IP, not `localhost`.
- **`tsc` reports TS2307 / TS2882 for `.css` imports:** `expo-env.d.ts` is generated and git-ignored. Run `npx expo start` once in `apps/mobile` (then stop it) and re-run `tsc`.
