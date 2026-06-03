/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Must be a valid corporate health email address format' })
  @IsNotEmpty({ message: 'Email is a required credential parameter' })
  email: string;

  @IsString({ message: 'Password must be valid text string' })
  @IsNotEmpty({ message: 'Password is a required credential parameter' })
  password: string;
}

export class MfaVerifyDto {
  @IsString()
  @IsNotEmpty({ message: 'MFA signature validation code is required' })
  @Length(6, 6, { message: 'MFA passcode must be exactly 6 digits long' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Session transaction token is required' })
  tempToken: string;
}

export class TokenRefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token cannot be empty' })
  refreshToken: string;
}

export class MfaEnableDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
