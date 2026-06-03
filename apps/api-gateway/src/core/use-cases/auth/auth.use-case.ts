/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { LoginDto, MfaVerifyDto, TokenRefreshDto } from './dto/auth.dto';
import { CryptoUtils } from './utils/crypto.utils';
import { DEFAULT_PERMISSION_MATRIX } from '../../domain/entities/permission.entity';

@Injectable()
export class AuthUseCase {
  private readonly logger = new Logger(AuthUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
  ) {}

  /**
   * Orchestrates secure multi-tenant user authentication step
   */
  async login(
    tenantId: string,
    dto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    this.logger.log(`Authentication request received in corporate boundary for matching account ${dto.email}`);

    // Resolve user profile by tenant sandbox boundary
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (!user || !user.isActive) {
      this.logger.warn(`Rejected entry attempt: invalid matching account credentials or inactive state [User: ${dto.email}]`);
      throw new UnauthorizedException('Authentication credentials error: Identity mismatch or account locked.');
    }

    // Verify cryptographic salted PBKDF2 hash
    const isValid = CryptoUtils.verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      this.logger.warn(`Rejected entry attempt: credential mismatch for account ${dto.email}`);
      throw new UnauthorizedException('Authentication credentials error: Identity mismatch or account locked.');
    }

    // Capture security context and audit log access
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        operatorId: user.id,
        action: 'AUTHENTICATION_ATTEMPT',
        targetResource: `users/${user.id}/sessions`,
        requestIp: ip,
        userAgent,
        originalPayload: { email: dto.email },
      },
    });

    // Check Multi-Factor Authentication requirement
    if (user.mfaEnabled) {
      this.logger.log(`MFA checkpoint triggered. Redirecting client routing for user ID: ${user.id}`);
      
      const tempToken = CryptoUtils.signJwt(
        {
          userId: user.id,
          tenantId: user.tenantId,
          type: 'mfa_verification_pending',
        },
        300, // 5 minutes expiration limit
      );

      return {
        mfaRequired: true,
        tempToken,
      };
    }

    // Standard credential session creation
    return this.createSecureSession(user, ip, userAgent);
  }

  /**
   * Verifies an MFA 6-digit passcode to finalize user authentication session
   */
  async verifyMfa(
    dto: MfaVerifyDto,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    const claims = CryptoUtils.verifyJwt(dto.tempToken);
    
    if (!claims || claims.type !== 'mfa_verification_pending') {
      throw new ForbiddenException('Identification context violation: verification token has expired or is invalid.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: claims.userId as string },
    });

    if (!user || !user.isActive || !user.mfaSecret) {
      throw new UnauthorizedException('MFA verification failure: account state is compromised or locked.');
    }

    // Perform secure TOTP sliding check
    const isTotpValid = CryptoUtils.verifyMfaToken(user.mfaSecret, dto.code);
    if (!isTotpValid) {
      this.logger.warn(`Rejected MFA validation submission: incorrect TOTP code check for account ID: ${user.id}`);
      throw new UnauthorizedException('MFA verification failure: passcode is incorrect.');
    }

    // Commit completion auditing logs
    await this.prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        operatorId: user.id,
        action: 'AUTHENTICATION_MFA_SUCCESS',
        targetResource: `users/${user.id}/sessions`,
        requestIp: ip,
        userAgent,
      },
    });

    return this.createSecureSession(user, ip, userAgent);
  }

  /**
   * Triggers generation of dynamic TOTP key and custom OTP Auth URI for device binding
   */
  async enableMfa(tenantId: string, userId: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Account reference mismatch inside selected isolation tenant.');
    }

    const secret = CryptoUtils.generateMfaSecret();
    const otpAuthUri = `otpauth://totp/LONGHEALTH:${user.email}?secret=${secret}&issuer=LONGHEALTH&period=30`;

    // Commit newly generated secret to the db as pending checkpoint state
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return {
      success: true,
      secret,
      otpAuthUri,
    };
  }

  /**
   * Verifies the binder passcode to activate user MFA security ruleset
   */
  async confirmMfa(
    tenantId: string,
    userId: string,
    code: string,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA Setup configuration violation: trigger config call first.');
    }

    const isCodeValid = CryptoUtils.verifyMfaToken(user.mfaSecret, code);
    if (!isCodeValid) {
      throw new BadRequestException('MFA activation failure: verification token is incorrect.');
    }

    // Activate MFA boundaries
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    // Create auditing trail records
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        operatorId: userId,
        action: 'MFA_ACTIVATED_SECURITY',
        targetResource: `users/${userId}/mfa_settings`,
        requestIp: ip,
        userAgent,
      },
    });

    return {
      success: true,
      message: 'MFA security controls successfully bound to account profile.',
    };
  }

  /**
   * Renews Access Token mapping verification claims against active Refresh Token profiles
   */
  async refresh(dto: TokenRefreshDto, ip: string, userAgent: string): Promise<any> {
    const claims = CryptoUtils.verifyJwt(dto.refreshToken);
    if (!claims || claims.type !== 'refresh_token') {
      throw new UnauthorizedException('Authentication session expired: Refresh token is incorrect or timed out.');
    }

    const tokenHash = CryptoUtils.hashSha256(dto.refreshToken);

    // Validate active session database record
    const session = await this.prisma.userSession.findFirst({
      where: {
        tokenHash,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user || !session.user.isActive || new Date().getTime() > session.expiresAt.getTime()) {
      throw new UnauthorizedException('Authentication session expired: session was removed or expired.');
    }

    // Resolve customized permissions assigned to user role
    const assignedPermissions = DEFAULT_PERMISSION_MATRIX[session.user.role] || [];

    // Compile refreshed Access Token envelope
    const accessToken = CryptoUtils.signJwt(
      {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        email: session.user.email,
        role: session.user.role,
        permissions: assignedPermissions,
        type: 'access_token',
      },
      3600, // Access Token lives for 1 hour
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  /**
   * Revokes and invalidates active session tokens
   */
  async logout(token: string, userId: string): Promise<any> {
    const claims = CryptoUtils.verifyJwt(token);
    
    if (claims && claims.userId === userId) {
      const accessTokenHash = CryptoUtils.hashSha256(token);
      
      // Blacklist token signature inside high-speed Redis database for immediate gateway enforcement
      await this.cache.set(`blacklist:token:${accessTokenHash}`, 'true', 3600);
    }

    // Deactivate matching session database contexts
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return { success: true, message: 'Authentication session logged out.' };
  }

  /**
   * Returns listings of active user connections and devices for session audit screens
   */
  async listActiveSessions(tenantId: string, userId: string): Promise<any[]> {
    const records = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map(s => ({
      id: s.id,
      deviceIp: s.deviceIp,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  }

  /**
   * Revokes fine-grained session instance (e.g. user terminating lost device connection)
   */
  async revokeSession(
    tenantId: string,
    operatorId: string,
    targetSessionId: string,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: targetSessionId,
      },
    });

    if (!session) {
      throw new NotFoundException('Selected session record is inactive or missing.');
    }

    // Verify operation tenant boundaries
    const targetUser = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!targetUser || targetUser.tenantId !== tenantId) {
      throw new ForbiddenException('Access authorization error: boundary context clash.');
    }

    // Terminate matching session
    await this.prisma.userSession.update({
      where: { id: targetSessionId },
      data: { isActive: false },
    });

    // Commit termination auditing logs
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        operatorId,
        action: 'REVOKE_DEVICE_SESSION',
        targetResource: `users/${session.userId}/sessions/${targetSessionId}`,
        requestIp: ip,
        userAgent,
      },
    });

    return {
      success: true,
      message: 'Connection session invalidated successfully.',
    };
  }

  /**
   * Compiles secure authentication tokens and registers connection session
   */
  private async createSecureSession(user: any, ip: string, userAgent: string): Promise<any> {
    const assignedPermissions = DEFAULT_PERMISSION_MATRIX[user.role] || [];

    // 1. Sign standard Access Token with complete Permissions Matrix block
    const accessToken = CryptoUtils.signJwt(
      {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        permissions: assignedPermissions,
        type: 'access_token',
      },
      3600, // Access Token lives for 1 hour
    );

    // 2. Sign dynamic matching Refresh Token
    const refreshToken = CryptoUtils.signJwt(
      {
        userId: user.id,
        type: 'refresh_token',
      },
      60 * 60 * 24 * 7, // Refresh Token has 7 days lifecycle limit
    );

    // 3. Register transaction hashes inside database for lifecycle checks
    const tokenHash = CryptoUtils.hashSha256(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Maintain concurrent session limits by invalidating oldest active sessions when limit reached (safety standard)
    const activeSessionCount = await this.prisma.userSession.count({
      where: { userId: user.id, isActive: true },
    });

    if (activeSessionCount >= 5) {
      // Invalidate oldest session
      const oldestSession = await this.prisma.userSession.findFirst({
        where: { userId: user.id, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (oldestSession) {
        await this.prisma.userSession.update({
          where: { id: oldestSession.id },
          data: { isActive: false },
        });
      }
    }

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceIp: ip,
        userAgent,
        expiresAt,
        isActive: true,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        permissions: assignedPermissions,
      },
    };
  }
}
