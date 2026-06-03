/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Medicine ID is required' })
  medicineId: string;

  @IsString()
  @IsNotEmpty({ message: 'Dosage instructions are required' })
  dosage: string;

  @IsString()
  @IsNotEmpty({ message: 'Frequency is required' })
  frequency: string;

  @IsInt()
  @Min(1)
  durationDayCount: number;

  @IsString()
  @IsNotEmpty({ message: 'Route of administration is required' })
  route: string;

  @IsInt()
  @Min(1)
  quantityRequired: number;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId: string;

  @IsString()
  @IsNotEmpty({ message: 'Diagnosis description is required' })
  diagnosis: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ RusticStyleMessage: true, each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
