import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 does not load .env by itself. The CLI runs from apps/api
// (npm workspace scripts set the working directory), so the repo-root
// .env is two folders up.
dotenv.config({ path: '../../.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});