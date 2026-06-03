/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // route is public or lacks custom constraints
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // populated by JwtStrategy
    const requestedTenantId = request.headers['x-tenant-id'];

    if (!user) {
      throw new ForbiddenException('Access authorization error: Missing authentication credentials token.');
    }

    // 1. Core Tenant Assert Check: verify user context matches request tenant header
    if (user.tenantId !== requestedTenantId) {
      this.loggerAuditTrailBlock(user.id, user.tenantId, requestedTenantId);
      throw new ForbiddenException('Access authorization error: Tenant isolation context claim mismatch.');
    }

    // 2. Validate Role level matching
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Access authorization error: Insufficient clinical credentials for requested action.');
    }

    return true;
  }

  private loggerAuditTrailBlock(userId: string, userTe: string, reqTe: string) {
    console.warn(`[SECURITY ALERT] User Account ${userId} belonging to Tenant [${userTe}] attempted access to Tenant [${reqTe}]`);
  }
}
