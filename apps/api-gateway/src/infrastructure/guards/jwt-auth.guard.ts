/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CryptoUtils } from '../../core/use-cases/auth/utils/crypto.utils';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked with @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication credentials error: Missing or malformed access token.');
    }

    const token = authHeader.split(' ')[1];
    const payload = CryptoUtils.verifyJwt(token);

    if (!payload || payload.type !== 'access_token') {
      throw new UnauthorizedException('Authentication credentials error: Access token has expired or is invalid.');
    }

    // Inspect real-time blacklist inside Redis cache memory context
    const tokenHash = CryptoUtils.hashSha256(token);
    const isBlacklisted = await this.redis.get(`blacklist:token:${tokenHash}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Authentication credentials error: Token has been revoked.');
    }

    // Bind authenticated context parameters directly to Express request
    request.user = {
      id: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
    };

    return true;
  }
}
