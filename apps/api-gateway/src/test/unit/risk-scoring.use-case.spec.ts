/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RiskScoringUseCase } from '../../core/use-cases/advanced/risk-scoring.use-case';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('RiskScoringUseCase (Unit Tests)', () => {
  let useCase: RiskScoringUseCase;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskScoringUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<RiskScoringUseCase>(RiskScoringUseCase);
  });

  describe('computeMaceHazard', () => {
    it('should calculate high cardiovascular hazard score and grade for diabetic smoker profile', async () => {
      const result = await useCase.computeMaceHazard('tenant-1', {
        age: 65,
        systolicBP: 155,
        totalCholesterol: 240,
        hdlCholesterol: 35,
        hasDiabetes: true,
        isSmoker: true,
      });

      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.grade).toBe('CRITICAL');
      expect(result.directive).toContain('cardiology');
    });

    it('should score lower hazard grade for younger non-diabetic profile', async () => {
      const result = await useCase.computeMaceHazard('tenant-1', {
        age: 38,
        systolicBP: 115,
        totalCholesterol: 180,
        hdlCholesterol: 55,
        hasDiabetes: false,
        isSmoker: false,
      });

      expect(result.score).toBeLessThanOrEqual(25);
      expect(result.grade).toBe('LOW');
    });
  });

  describe('computeLaceHazard', () => {
    it('should compute high readmission probability for critical comorbidity inpatient configurations', async () => {
      const result = await useCase.computeLaceHazard('tenant-1', {
        lengthOfStay: 8,
        isAcuteAdmission: true,
        comorbiditiesIndex: 4,
        emergencyVisitsCount: 3,
      });

      // points: L=4+3=7, A=3, C=4, E=3 => Total LACE=17/19
      expect(result.score).toBeGreaterThan(85);
      expect(result.grade).toBe('CRITICAL');
      expect(result.directive).toContain('discharge');
    });
  });
});
