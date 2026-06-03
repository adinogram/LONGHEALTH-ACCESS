/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum GenderDto {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum BloodGroupDto {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
}

export enum PatientStatusDto {
  OUTPATIENT = 'OUTPATIENT',
  INPATIENT = 'INPATIENT',
  OBSERVATION = 'OBSERVATION',
  DISCHARGED = 'DISCHARGED',
}

export class CreatePatientDto {
  @IsEmail({}, { message: 'Must be a valid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString({}, { message: 'Date of birth must be a valid ISO-8601 date string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dateOfBirth: string;

  @IsEnum(GenderDto, { message: 'Gender must be MALE, FEMALE, or OTHER' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: GenderDto;

  @IsEnum(BloodGroupDto, { message: 'Blood group must be a valid ABO type' })
  @IsOptional()
  bloodGroup?: BloodGroupDto;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(PatientStatusDto, { message: 'Patient status must be OUTPATIENT, INPATIENT, OBSERVATION, or DISCHARGED' })
  @IsOptional()
  status?: PatientStatusDto;
}

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(GenderDto)
  @IsOptional()
  gender?: GenderDto;

  @IsEnum(BloodGroupDto)
  @IsOptional()
  bloodGroup?: BloodGroupDto;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(PatientStatusDto)
  @IsOptional()
  status?: PatientStatusDto;
}
