/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export enum InvoiceStatusDto {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum PaymentMethodDto {
  CASH = 'CASH',
  CARD = 'CARD',
  WIRE = 'WIRE',
  INSURANCE = 'INSURANCE',
}

export enum ClaimStatusDto {
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsNumber()
  @Min(0)
  tax: number;
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amountPaid: number;

  @IsEnum(PaymentMethodDto, { message: 'Method must be CASH, CARD, WIRE, or INSURANCE' })
  paymentMethod: PaymentMethodDto;
}

export class SubmitClaimDto {
  @IsString()
  @IsNotEmpty({ message: 'Insurance provider name is required' })
  providerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Policy number is required' })
  policyNumber: string;

  @IsString()
  @IsOptional()
  groupNumber?: string;

  @IsNumber()
  @Min(0.01)
  claimedAmount: number;
}

export class ReconcileClaimDto {
  @IsEnum(ClaimStatusDto)
  status: ClaimStatusDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  approvedAmount?: number;
}
