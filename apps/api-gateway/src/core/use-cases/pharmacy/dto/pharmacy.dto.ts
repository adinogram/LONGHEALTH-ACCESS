/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsEnum, IsNumber, IsDateString } from 'class-validator';

export enum OrderStatusDto {
  IN_PREPARATION = 'IN_PREPARATION',
  READY = 'READY',
  COLLECTED = 'COLLECTED',
  RETURNED = 'RETURNED',
}

export class AddStockDto {
  @IsString()
  @IsNotEmpty({ message: 'Medicine ID is required' })
  medicineId: string;

  @IsString()
  @IsNotEmpty({ message: 'Batch number is required' })
  batchNumber: string;

  @IsDateString({}, { message: 'Manufacture date must be a valid date' })
  manufactureDate: string;

  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  expiryDate: string;

  @IsInt()
  @Min(0)
  stockQty: number;

  @IsInt()
  @Min(0)
  safetyStockQty: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsNumber()
  @Min(0.01)
  retailPrice: number;

  @IsString()
  @IsOptional()
  locationIndex?: string;
}

export class CreatePharmacyOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId: string;

  @IsString()
  @IsOptional()
  prescriptionId?: string;

  @IsNumber()
  @Min(0)
  totalCost: number;
}
