import type { AuthenticationStorage, RefreshTokenRecord } from '@nestjs/authentication';
import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { PrismaClient } from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PrismaRefreshTokenStore } from './prisma-refresh-token.store.js';

// Tests run with apps/api as the working directory, so the root .env is two levels up.
config({ path: '../../.env' });

const TEST_EMAIL_SUFFIX = '@contract-test.invalid';

// These tests need the real database, so they only run when asked:
//   RUN_DB_TESTS=1 npm run test -w @pitad/api
// A plain `npm run test` skips them, which keeps it working without Docker.
const runDbTests = process.env['RUN_DB_TESTS'] === '1';

// The contract invents user ids like "user-<uuid>", but users.id is a uuid column.
// This turns any string into a stable, valid UUID: the same input gives the same output.
function uuidFor(contractUserId: string): string {
  const h = createHash('sha256').update(contractUserId).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

describe.skipIf(!runDbTests)('PrismaRefreshTokenStore contract', () => {
  let prisma: PrismaClient;

  // Remembers which contract id each generated UUID stands for, to translate back.
  const originalIds = new Map<string, string>();

  beforeAll(() => {
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
    });
  });

  afterAll(async () => {
    // Deleting the test users also deletes their tokens (ON DELETE CASCADE).
    await prisma.user.deleteMany({ where: { email: { endsWith: TEST_EMAIL_SUFFIX } } });
    await prisma.$disconnect();
  });

  // refresh_tokens has a foreign key to users, so a user row must exist before a token
  // is saved. This subclass creates it, and translates ids in and out so the contract
  // always sees the ids it made up.
  class StoreUnderTest extends PrismaRefreshTokenStore {
    override async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
      const dbUserId = uuidFor(record.userId);
      originalIds.set(dbUserId, record.userId);
      await prisma.user.upsert({
        where: { id: dbUserId },
        update: {},
        create: {
          id: dbUserId,
          email: `${dbUserId}${TEST_EMAIL_SUFFIX}`,
          passwordHash: 'not-a-real-hash',
        },
      });
      await super.saveRefreshToken({ ...record, userId: dbUserId });
    }

    override async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
      const record = await super.getRefreshToken(id);
      return record
        ? { ...record, userId: originalIds.get(record.userId) ?? record.userId }
        : undefined;
    }

    override async revokeUserRefreshTokens(userId: string): Promise<void> {
      await super.revokeUserRefreshTokens(uuidFor(userId));
    }
  }

  const noopStorage = { registerSource: () => undefined } as unknown as AuthenticationStorage;

  const cases = authenticationStoreContract(
    () => ({
      refreshTokens: new StoreUnderTest(prisma as unknown as PrismaService, noopStorage),
    }),
    { contracts: ['refreshTokens'], concurrent: true },
  );

  for (const testCase of cases) {
    it(testCase.name, () => testCase.run());
  }
});
