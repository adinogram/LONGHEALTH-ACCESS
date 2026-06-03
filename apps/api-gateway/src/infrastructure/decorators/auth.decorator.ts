/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AppPermission } from '../../core/domain/entities/permission.entity';

// Key identifiers
export const IS_PUBLIC_KEY = 'isPublic';
export const PERMISSIONS_KEY = 'permissions';

/**
 * Public route decorator allowing bypass of JwtAuthGuard restrictions
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Fine-grained authority rule constraint decorator checking the permission matrix
 */
export const RequiresPermissions = (...permissions: AppPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Parameter resolver capturing active authenticated user session details
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
