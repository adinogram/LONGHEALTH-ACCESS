/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ClinicalAIController } from '../../infrastructure/controllers/clinical-ai.controller';
import { RiskScoringController } from '../../infrastructure/controllers/risk-scoring.controller';
import { ClinicalAIUseCase } from '../../core/use-cases/advanced/clinical-ai.use-case';
import { RiskScoringUseCase } from '../../core/use-cases/advanced/risk-scoring.use-case';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('Clinical Gateway (API & Integration Tests)', () => {
  let app: INestApplication;
  let clinicalAIUseCase: ClinicalAIUseCase;
  let riskScoringUseCase: RiskScoringUseCase;

  beforeAll(async () => {
    const mockPrisma = {};
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClinicalAIController, RiskScoringController],
      providers: [
        ClinicalAIUseCase,
        RiskScoringUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    clinicalAIUseCase = moduleFixture.get<ClinicalAIUseCase>(ClinicalAIUseCase);
    riskScoringUseCase = moduleFixture.get<RiskScoringUseCase>(RiskScoringUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clinical-ai/symptoms', () => {
    it('should return 201 Created and triage decision for chest pressure input', async () => {
      const response = await request(app.getHttpServer())
        .post('/clinical-ai/symptoms')
        .set('x-tenant-id', 'tenant-clinical-test')
        .send({
          symptoms: 'Substernal chest tightening radiating outwards, sweating',
          age: 52,
          gender: 'MALE',
          history: 'High LDL levels',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('triageUrgency', 'CRITICAL');
      expect(response.body).toHaveProperty('clinicalSpecialist');
      expect(response.body.differentialDiagnoses).toContain('Acute Coronary Syndrome (ICD-10 I24.9)');
    });

    it('should return 400 Bad Request if mandatory demographic age is out of bounds', async () => {
      const response = await request(app.getHttpServer())
        .post('/clinical-ai/symptoms')
        .send({
          symptoms: 'Migraine and blurred vision',
          age: 150, // Out of limits
          gender: 'FEMALE',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /clinical-risk/mace', () => {
    it('should calculate Framingham MACE score integrations', async () => {
      const response = await request(app.getHttpServer())
        .post('/clinical-risk/mace')
        .set('x-tenant-id', 'tenant-clinical-test')
        .send({
          age: 50,
          systolicBP: 140,
          totalCholesterol: 220,
          hdlCholesterol: 40,
          hasDiabetes: true,
          isSmoker: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('grade');
      expect(response.body.score).toBeGreaterThan(30);
    });
  });
});
