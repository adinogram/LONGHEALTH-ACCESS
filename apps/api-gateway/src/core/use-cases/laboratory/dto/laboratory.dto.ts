/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum LabReportStatusDto {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  FINAL = 'FINAL',
}

export class OrderTestDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId: string;

  @IsString()
  @IsNotEmpty({ message: 'Test ID is required' })
  testId: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;
}

export class UpdateResultsDto {
  @IsObject({ message: 'Result data must be a key-value json range object' })
  @IsNotEmpty()
  resultData: Record<string, any>;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsEnum(LabReportStatusDto, { message: 'Status must be PROCESSING or REVIEW' })
  status: LabReportStatusDto;
}
