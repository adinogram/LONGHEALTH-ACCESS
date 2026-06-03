/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Body, Get, UseGuards, Req, Headers, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthUseCase } from '../../core/use-cases/auth/auth.use-case';
import { LoginDto, MfaVerifyDto, TokenRefreshDto } from '../../core/use-cases/auth/dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, Public } from '../decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  /**
   * Secure entry authenticate endpoint supporting tenanted users
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: LoginDto,
    @Req() req: any,
  ): Promise<any> {
    const activeTenant = tenantId || 'tenant_greenwood'; // Local/default fallback for seed testing
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Tenant Browser Agent';

    return await this.authUseCase.login(activeTenant, dto, clientIp, userAgent);
  }

  /**
   * Completes login utilizing sliding TOTP verification code
   */
  @Public()
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @Body() dto: MfaVerifyDto,
    @Req() req: any,
  ): Promise<any> {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Tenant Browser Agent';

    return await this.authUseCase.verifyMfa(dto, clientIp, userAgent);
  }

  /**
   * Prompts TOTP seed setup for active user
   */
  @UseGuards(JwtAuthGuard)
  @Post('enable-mfa')
  async enableMfa(
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.authUseCase.enableMfa(user.tenantId, user.id);
  }

  /**
   * Confirms verify check bound matching code to lock-in active MFA policies
   */
  @UseGuards(JwtAuthGuard)
  @Post('confirm-mfa')
  @HttpCode(HttpStatus.OK)
  async confirmMfa(
    @CurrentUser() user: any,
    @Body('code') code: string,
    @Req() req: any,
  ): Promise<any> {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Tenant Browser Agent';

    return await this.authUseCase.confirmMfa(
      user.tenantId,
      user.id,
      code,
      clientIp,
      userAgent,
    );
  }

  /**
   * Renews Access Tokens mapping verification against active sessions
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: TokenRefreshDto,
    @Req() req: any,
  ): Promise<any> {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Tenant Browser Agent';

    return await this.authUseCase.refresh(dto, clientIp, userAgent);
  }

  /**
   * Clears session indicators on current device
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: any,
    @CurrentUser() user: any,
  ): Promise<any> {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : '';
    
    return await this.authUseCase.logout(token, user.id);
  }

  /**
   * Returns current user identity properties
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUser() user: any,
  ): Promise<any> {
    return {
      success: true,
      user,
    };
  }

  /**
   * Returns complete historical session connections
   */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async listActiveSessions(
    @CurrentUser() user: any,
  ): Promise<any> {
    const sessions = await this.authUseCase.listActiveSessions(user.tenantId, user.id);
    return {
      success: true,
      sessions,
    };
  }

  /**
   * Performs fine-grained termination of lost session tokens
   */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<any> {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Tenant Browser Agent';

    return await this.authUseCase.revokeSession(
      user.tenantId,
      user.id,
      id,
      clientIp,
      userAgent,
    );
  }
}
