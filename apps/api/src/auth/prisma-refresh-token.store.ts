import type { RefreshTokenRecord, RefreshTokenStore } from '@nestjs/authentication';
import { AuthenticationStorage } from '@nestjs/authentication';
import { Injectable, Logger } from '@nestjs/common';
import type { Prisma, RefreshToken } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Database row -> the shape the package expects.
function toRecord(row: RefreshToken): RefreshTokenRecord {
  return {
    id: row.id,
    familyId: row.familyId,
    userId: row.userId,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    familyExpiresAt: row.familyExpiresAt,
    ...(row.usedAt ? { usedAt: row.usedAt } : {}),
    ...(isJsonObject(row.claims) ? { claims: row.claims } : {}),
  };
}

@Injectable()
export class PrismaRefreshTokenStore implements RefreshTokenStore {
  private readonly logger = new Logger(PrismaRefreshTokenStore.name);

  constructor(
    private readonly prisma: PrismaService,
    storage: AuthenticationStorage,
  ) {
    // Tell the package to keep refresh tokens in this class instead of in memory.
    storage.registerSource({ refreshTokens: this });
  }

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const row = await this.prisma.refreshToken.findUnique({ where: { id } });
    return row ? toRecord(row) : undefined;
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: record.id,
        familyId: record.familyId,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        familyExpiresAt: record.familyExpiresAt,
        usedAt: record.usedAt,
        claims: record.claims as Prisma.InputJsonObject | undefined,
      },
    });

    // Keep the table bounded: families past their hard expiry can never be used again.
    // "Now" is the new token's createdAt, because the package says time comes from its clock.
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { familyExpiresAt: { lt: record.createdAt } },
      });
    } catch (error) {
      this.logger.warn(`Expired refresh token cleanup failed: ${String(error)}`);
    }
  }

  // ONE conditional UPDATE: of several concurrent calls, exactly one sees count === 1.
  // The losers are a token reuse, and the package revokes the whole family.
  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id, usedAt: null },
      data: { usedAt: at },
    });
    return count === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revoked: true },
    });
  }

  // A family is revoked if ANY of its rows is flagged, so a successor saved after
  // the revocation is still covered.
  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const row = await this.prisma.refreshToken.findFirst({
      where: { familyId, revoked: true },
      select: { id: true },
    });
    return row !== null;
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }
}
