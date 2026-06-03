/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalAIUseCase } from '../../core/use-cases/advanced/clinical-ai.use-case';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('ClinicalAIUseCase (Unit Tests)', () => {
  let useCase: ClinicalAIUseCase;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      patient: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalAIUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<ClinicalAIUseCase>(ClinicalAIUseCase);
  });

  describe('evaluateSymptomProfile', () => {
    it('should classify symptoms containing chest/pressure/radiation as a CRITICAL cardiac threat', async () => {
      const result = await useCase.evaluateSymptomProfile('tenant-1', {
        symptoms: 'Heaviness in my chest radiating down my left arm with squeezing pressure',
        age: 62,
        gender: 'MALE',
        history: 'Diabetic, smoker',
      });

      expect(result.triageUrgency).toBe('CRITICAL');
      expect(result.clinicalSpecialist).toContain('Cardiology');
      expect(result.differentialDiagnoses).toContain('Acute Coronary Syndrome (ICD-10 I24.9)');
      expect(result.recommendedTests).toContain('12-Lead Electrocardiogram');
    });

    it('should classify symptoms without cardiac markers as a MODERATE triage priority', async () => {
      const result = await useCase.evaluateSymptomProfile('tenant-1', {
        symptoms: 'Throb headache localized in my frontal area with visual glare sensitivities',
        age: 28,
        gender: 'FEMALE',
        history: 'None',
      });

      expect(result.triageUrgency).toBe('MODERATE');
      expect(result.clinicalSpecialist).toContain('Neurology');
      expect(result.differentialDiagnoses).toContain('Migraine, unspecified (ICD-10 G43.9)');
    });
  });

  describe('parseDictationToSoap', () => {
    it('should compile structured SOAP content for orthopedic/arthritis dictations', async () => {
      const result = await useCase.parseDictationToSoap('tenant-1', {
        transcript: 'Patient has had grinding and soreness in both knees, worse in the morning. Minimal effusion noted, flex limited to 115.',
      });

      expect(result.urgency).toBe('LOW');
      expect(result.icdCode).toBe('M17.0 (Bilateral Primary Osteoarthritis)');
      expect(result.subjective).toContain('soreness');
      expect(result.assessment).toContain('Osteoarthritis');
      expect(result.plan).toContain('Celecoxib');
    });
  });
});
