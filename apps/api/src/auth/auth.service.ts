import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { IssuedTokens, TokenPair } from '@nestjs/authentication';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async register(input: RegisterInput): Promise<IssuedTokens> {
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.createUser(input, passwordHash);
    return this.issueFor(user.id);
  }

  async login(input: LoginInput): Promise<IssuedTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, passwordHash: true },
    });

    // Passing undefined for an unknown email makes the hasher check a dummy hash,
    // so an unknown email and a wrong password take the same time and give the same answer.
    const valid = await this.hasher.verify(input.password, user?.passwordHash);
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // If the hashing cost was raised since this hash was stored, upgrade it now
    // while we hold the plaintext password.
    if (this.hasher.needsRehash(user.passwordHash)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await this.hasher.hash(input.password) },
      });
    }

    return this.issueFor(user.id);
  }

  refresh(refreshToken: string): Promise<TokenPair> {
    // Spends the token and returns its successor. A reused token revokes the whole family.
    return this.tokens.refresh(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    // Revokes this device's token family. The result is ignored on purpose:
    // the response must not reveal whether a token existed.
    await this.tokens.revoke(refreshToken);
  }

  private issueFor(userId: string): Promise<IssuedTokens> {
    return this.tokens.issue(userId, { method: 'password', claims: { amr: ['pwd'] } });
  }

  private async createUser(input: RegisterInput, passwordHash: string): Promise<{ id: string }> {
    try {
      // One create with nested writes: user, profile and settings are saved together
      // or not at all, so there is never a user without a profile.
      return await this.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          profile: { create: { displayName: input.displayName } },
          settings: { create: {} }, // every column has a default (metric, private)
        },
        select: { id: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
  }
}
