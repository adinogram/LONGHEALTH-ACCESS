/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Body, Headers } from '@nestjs/common';
import { RiskScoringUseCase, CalculatedRiskProfile } from '../../core/use-cases/advanced/risk-scoring.use-case';
import { MaceRiskCalculationDto, LaceIndexCalculationDto } from '../../core/use-cases/advanced/dto/risk-scoring.dto';

@Controller('clinical-risk')
export class RiskScoringController {
  constructor(
    private readonly riskUseCase: RiskScoringUseCase,
  ) {}

  /**
   * Endpoint rendering MACE 10-year risk percentages.
   */
  @Post('mace')
  async computeMaceScore(
    @Headers('x-tenant-id') tenantId: string = 'tenant-demo-longhealth',
    @Body() dto: MaceRiskCalculationDto,
  ): Promise<CalculatedRiskProfile> {
    return this.riskUseCase.computeMaceHazard(tenantId, dto);
  }

  /**
   * Endpoint rendering LACE readmission hazard indices.
   */
  @Post('lace')
  async computeLaceScore(
    @Headers('x-tenant-id') tenantId: string = 'tenant-demo-longhealth',
    @Body() dto: LaceIndexCalculationDto,
  ): Promise<CalculatedRiskProfile> {
    return this.riskUseCase.computeLaceHazard(tenantId, dto);
  }
}
