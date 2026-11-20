import { AuthenticationModule } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { JwtAuth } from './jwt-auth.provider.js';
import { PrismaRefreshTokenStore } from './prisma-refresh-token.store.js';

const JWT_ISSUER = 'pitad-api';
const JWT_AUDIENCE = 'pitad-mobile';

@Module({
  imports: [
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        accessToken: {
          key: config.get('JWT_SECRET', { infer: true }),
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
          ttl: '15m', // short: a stolen access token stops working quickly
        },
        // Each refresh token lasts 30 days and works once. A login "family" can
        // rotate for at most 90 days, then the user signs in again.
        refreshToken: { ttl: '30d', absoluteTtl: '90d' },
      }),
    }),
  ],
  providers: [PrismaRefreshTokenStore, JwtAuth],
})
export class AuthModule {}
