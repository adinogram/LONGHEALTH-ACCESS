/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

/**
 * Data Transfer Object for quantitative Major Adverse Cardiac Events (MACE) estimation.
 */
export class MaceRiskCalculationDto {
  @IsNotEmpty({ message: 'Patient age parameter is mandatory.' })
  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(80)
  @Max(250)
  systolicBP: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  @Max(400)
  totalCholesterol: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(15)
  @Max(120)
  hdlCholesterol: number;

  @IsNotEmpty()
  @IsBoolean()
  hasDiabetes: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isSmoker: boolean;
}

/**
 * Data Transfer Object representing parameters for LACE 30-Day Hospital Readmission hazard index.
 */
export class LaceIndexCalculationDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(90)
  lengthOfStay: number;

  @IsNotEmpty()
  @IsBoolean()
  isAcuteAdmission: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  comorbiditiesIndex: number; // Charlson Comorbidity Index value

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  emergencyVisitsCount: number; // Emergency room visits in past 6 months
}
