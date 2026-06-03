/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class UserSessionEntity {
  id: string;
  userId: string;
  tokenHash: string;
  deviceIp?: string | null;
  userAgent?: string | null;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserSessionEntity>) {
    Object.assign(this, partial);
  }

  // Pure domain constraint: check if the session token is active and has not expired
  isValid(currentDate: Date = new Date()): boolean {
    return this.isActive && this.expiresAt.getTime() > currentDate.getTime();
  }
}
