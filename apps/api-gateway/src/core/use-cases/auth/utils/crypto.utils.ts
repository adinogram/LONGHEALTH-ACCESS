/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from 'crypto';

export class CryptoUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'healthgate_secure_corporate_key_32_bytes_long_required_123';

  /**
   * Generates a secure salt-hashed password using PBKDF2
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies verification credentials against pbkdf2 signature
   */
  static verifyPassword(password: string, passwordHash: string): boolean {
    if (!passwordHash.includes(':')) {
      // Fallback for raw/md5 style hashes if database has outdated test seeds
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      return hash === passwordHash || password === passwordHash;
    }
    const [salt, originalHash] = passwordHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return verifyHash === originalHash;
  }

  /**
   * Decodes Base32 to standard buffer bytes (needed for RFC 6238 TOTP)
   */
  private static base32ToBuffer(base32: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let cleanString = base32.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    let length = cleanString.length;
    let bits = 0;
    let value = 0;
    let index = 0;
    const buffer = Buffer.alloc(Math.floor((length * 5) / 8));

    for (let i = 0; i < length; i++) {
      const idx = alphabet.indexOf(cleanString.charAt(i));
      if (idx === -1) {
        throw new Error('Invalid base32 character in MFA seed.');
      }
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        buffer[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }
    return buffer;
  }

  /**
   * Generates a TOTP (Google Authenticator) 6-digit passcode for a counter
   */
  private static generateTotpForCounter(secret: string, counter: number): string {
    const keyBuf = this.base32ToBuffer(secret);
    const counterBuf = Buffer.alloc(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
      counterBuf[i] = tmp & 0xff;
      tmp = tmp >> 8;
    }

    const hmac = crypto.createHmac('sha1', keyBuf);
    hmac.update(counterBuf);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const otp = code % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Verifies a 6-digit TOTP code with time-drift accommodation
   */
  static verifyMfaToken(secret: string, userToken: string, driftWindowCount = 1): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(currentTime / 30);

    for (let i = -driftWindowCount; i <= driftWindowCount; i++) {
      const generated = this.generateTotpForCounter(secret, currentCounter + i);
      if (generated === userToken) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generates a random Base32 TOTP secret string
   */
  static generateMfaSecret(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    const bytes = crypto.randomBytes(16);
    for (let i = 0; i < bytes.length; i++) {
      result += alphabet[bytes[i] % alphabet.length];
    }
    return result;
  }

  /**
   * Signs custom payload fields into custom secured JWT representation
   */
  static signJwt(payload: Record<string, any>, expirySeconds: number): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expirySeconds;
    const body = { ...payload, iat, exp };
    const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url');

    const basicPayload = `${encodedHeader}.${encodedBody}`;
    const signature = crypto.createHmac('sha256', this.JWT_SECRET).update(basicPayload).digest('base64url');

    return `${basicPayload}.${signature}`;
  }

  /**
   * Verifies and strips JWT signature, returning structured claims block
   */
  static verifyJwt(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [header, body, signature] = parts;
      const computedSignature = crypto.createHmac('sha256', this.JWT_SECRET).update(`${header}.${body}`).digest('base64url');

      if (signature !== computedSignature) {
        return null;
      }

      const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedBody.exp && decodedBody.exp < currentTime) {
        return null; // Token expired
      }

      return decodedBody;
    } catch (_) {
      return null;
    }
  }

  /**
   * Calculates SHA-256 string footprint
   */
  static hashSha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
