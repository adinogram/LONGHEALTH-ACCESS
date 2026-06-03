/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppPermission } from '../../core/domain/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<AppPermission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedTenantId = request.headers['x-tenant-id'] || request.query['tenantId'];

    if (!user) {
      throw new ForbiddenException('Access authorization error: Missing authentication context.');
    }

    // 1. Rigorous Tenancy Context Constraint: verify matching corporate tenant workspace
    if (requestedTenantId && user.tenantId !== requestedTenantId) {
      console.warn(`[DEFENSE ALERT] Account ID: ${user.id} tried accessing tenant [${requestedTenantId}] under session tenant [${user.tenantId}]`);
      throw new ForbiddenException('Access authorization error: Tenant context claim clash.');
    }

    // 2. Clear Permission Matrix Evaluation
    const userPermissions: string[] = user.permissions || [];
    const hasSufficientPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasSufficientPermissions) {
      throw new ForbiddenException('Access authorization error: Insufficient privilege matrix credentials.');
    }

    return true;
  }
}
