import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import type { IssuedTokens, TokenPair } from '@nestjs/authentication';
import type { ApiSuccess } from '@pitad/shared';
import { AuthService } from './auth.service.js';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type LoginInput,
  type RefreshInput,
  type RegisterInput,
} from './auth.schemas.js';
import type { AuthUser } from './auth.types.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

// @Public() opens a route; everything else needs a valid access token.
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
  ): Promise<ApiSuccess<IssuedTokens>> {
    return { data: await this.auth.register(body) };
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
  ): Promise<ApiSuccess<IssuedTokens>> {
    return { data: await this.auth.login(body) };
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput,
  ): Promise<ApiSuccess<TokenPair>> {
    return { data: await this.auth.refresh(body.refreshToken) };
  }

  // Public because the refresh token itself is the credential: the app can sign
  // out even after its access token has expired.
  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput): Promise<void> {
    await this.auth.logout(body.refreshToken);
  }

  // The only protected route for now. It proves the bearer guard works.
  @Get('me')
  me(@CurrentUser() user: AuthUser): ApiSuccess<AuthUser> {
    return { data: user };
  }
}
