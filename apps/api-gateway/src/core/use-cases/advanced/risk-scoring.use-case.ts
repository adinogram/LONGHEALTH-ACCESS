/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { MaceRiskCalculationDto, LaceIndexCalculationDto } from './dto/risk-scoring.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface CalculatedRiskProfile {
  score: number;
  grade: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  coefficientLog: string;
  directive: string;
}

@Injectable()
export class RiskScoringUseCase {
  private readonly logger = new Logger(RiskScoringUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Computes Framingham Cardiovascular Hazard Coefficient for 10-year MACE estimation.
   */
  async computeMaceHazard(
    tenantId: string,
    dto: MaceRiskCalculationDto,
  ): Promise<CalculatedRiskProfile> {
    this.logger.log(`Evaluating cardiovascular hazard coefficients on Patient. Age: ${dto.age}`);

    let coefficient = 4;
    
    // 1. Age Hazard Gradient
    if (dto.age > 40) {
      coefficient += (dto.age - 40) * 0.75;
    }

    // 2. Haemodynamic Hazard
    if (dto.systolicBP > 120) {
      coefficient += (dto.systolicBP - 120) * 0.85;
    }

    // 3. Biochemical Hazard (Cholesterol Ratio)
    const ratio = dto.totalCholesterol / dto.hdlCholesterol;
    if (ratio > 3.5) {
      coefficient += (ratio - 3.5) * 5.2;
    }

    // 4. Diabetes Comorbidity Modifier
    if (dto.hasDiabetes) {
      coefficient += 22;
    }

    // 5. Environmental Vasoconstrictor (Smoking)
    if (dto.isSmoker) {
      coefficient += 18;
    }

    const calculatedScore = Math.min(Math.round(coefficient), 100);

    let grade: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let directive = 'Routine healthcare followups. Encourage caloric balance and physical movement.';

    if (calculatedScore >= 25 && calculatedScore < 50) {
      grade = 'MODERATE';
      directive = 'Optimize hyperlipidemia parameters. Initiate HMG-CoA Reductase inhibitors (statins) if necessary.';
    } else if (calculatedScore >= 50 && calculatedScore < 75) {
      grade = 'HIGH';
      directive = 'Urgent non-invasive cardiovascular stress Echo study advisable. Intensive hypertension regulation.';
    } else if (calculatedScore >= 75) {
      grade = 'CRITICAL';
      directive = 'High imminent cardiovascular thread. Refer for cardiology clinical consult immediately. Start double anti-platelet treatment.';
    }

    return {
      score: calculatedScore,
      grade,
      coefficientLog: `Framingham-Mace v1.0. AgeOffset: ${dto.age-40}, SBP-Dev: ${dto.systolicBP-120}, LipidRatio: ${ratio.toFixed(2)}`,
      directive,
    };
  }

  /**
   * Calculates the 30-Day readmission hazard index for discharged inpatients using LACE metrics.
   */
  async computeLaceHazard(
    tenantId: string,
    dto: LaceIndexCalculationDto,
  ): Promise<CalculatedRiskProfile> {
    this.logger.log(`Performing LACE index calculation inside Tenant: ${tenantId}`);

    // L: Length of stay score
    let l_score = Math.min(dto.lengthOfStay, 4);
    if (dto.lengthOfStay > 4) {
      l_score += Math.min(dto.lengthOfStay - 4, 3);
    }

    // A: Acute admission type (3 points as per standard validation framework)
    const a_score = dto.isAcuteAdmission ? 3 : 0;

    // C: Charlson Comorbidity Index value (points match index literally)
    const c_score = Math.min(dto.comorbiditiesIndex, 6);

    // E: Emergency room visits in past 6 months (max 4)
    const e_score = Math.min(dto.emergencyVisitsCount, 4);

    const totalLacePoints = l_score + a_score + c_score + e_score;
    // Standard conversion of LACE points (max 19) to probability percentage
    const probabilityPercentage = Math.round((totalLacePoints / 19) * 100);

    let grade: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let directive = 'Safe to complete standard outpatient discharge plans.';

    if (totalLacePoints >= 5 && totalLacePoints < 9) {
      grade = 'MODERATE';
      directive = 'Post-discharge callback within 72 hours. Ensure patient obtains all prescribed therapies.';
    } else if (totalLacePoints >= 9 && totalLacePoints < 12) {
      grade = 'HIGH';
      directive = 'Mandatory transitional care plan required. Arrange for medication box delivery and home rehab followups.';
    } else if (totalLacePoints >= 12) {
      grade = 'CRITICAL';
      directive = 'Extreme post-discharge complication hazard detected. Keep patient in observational unit or coordinate home nursing diagnostics.';
    }

    return {
      score: probabilityPercentage,
      grade,
      coefficientLog: `LACE-Index Score: ${totalLacePoints}/19. Components: L=${l_score}, A=${a_score}, C=${c_score}, E=${e_score}`,
      directive,
    };
  }
}
