import type { JwtClaims } from '@nestjs/authentication';
import { AuthenticationRegistry, JwtBearerProvider } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './auth.types.js';

// Reads "Authorization: Bearer <jwt>", lets the package verify the signature,
// expiry, issuer and audience, then asks us who the token belongs to.
@Injectable()
export class JwtAuth extends JwtBearerProvider<AuthUser> {
  constructor(
    private readonly prisma: PrismaService,
    registry: AuthenticationRegistry,
  ) {
    super(); // verifies with the same key the module's `accessToken` option signs with
    registry.registerProvider(this, { order: 1 });
  }

  // Returning null (a deleted user) rejects the token, even if it is still valid.
  protected override async validate(claims: JwtClaims): Promise<AuthUser | null> {
    if (!claims.sub) return null;
    return this.prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, email: true },
    });
  }
}
