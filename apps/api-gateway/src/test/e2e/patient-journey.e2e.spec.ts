/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ClinicalAIController } from '../../infrastructure/controllers/clinical-ai.controller';
import { RiskScoringController } from '../../infrastructure/controllers/risk-scoring.controller';
import { ClinicalAIUseCase } from '../../core/use-cases/advanced/clinical-ai.use-case';
import { RiskScoringUseCase } from '../../core/use-cases/advanced/risk-scoring.use-case';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('Patient Critical Lifecycle (End-to-End)', () => {
  let app: INestApplication;

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Patient Cardiac Journey E2E Flow: Admission Triage -> Risk Scoring -> Dictation Wrap', async () => {
    // Step 1: Patient Admission & AI Symptom Classification
    const triageResponse = await request(app.getHttpServer())
      .post('/clinical-ai/symptoms')
      .set('x-tenant-id', 'tenant-e2e-hospital-1')
      .send({
        symptoms: 'Crushing central chest pain radiating to left jaw, patient is clammy and hypotensive',
        age: 58,
        gender: 'FEMALE',
        history: 'Angioplasty with stent in 2021',
      });

    expect(triageResponse.status).toBe(201);
    expect(triageResponse.body.triageUrgency).toBe('CRITICAL');
    expect(triageResponse.body.clinicalSpecialist).toContain('Cardiology');

    // Step 2: Inpatient Cardiovascular Risk Scoring Computation
    const maceResponse = await request(app.getHttpServer())
      .post('/clinical-risk/mace')
      .set('x-tenant-id', 'tenant-e2e-hospital-1')
      .send({
        age: 58,
        systolicBP: 135,
        totalCholesterol: 210,
        hdlCholesterol: 42,
        hasDiabetes: true,
        isSmoker: false,
      });

    expect(maceResponse.status).toBe(201);
    expect(maceResponse.body.grade).toBe('CRITICAL');
    expect(maceResponse.body.score).toBeGreaterThan(60);

    // Step 3: Clinician Dictation Voice Note Compile SOAP summary
    const scribeResponse = await request(app.getHttpServer())
      .post('/clinical-ai/voice-record')
      .set('x-tenant-id', 'tenant-e2e-hospital-1')
      .send({
        transcript: 'Patient checked in with acute back pain and thoracic squeezing. Administered nitrates PO. Discharged to intensive coronary screening ward.',
      });

    expect(scribeResponse.status).toBe(201);
    expect(scribeResponse.body.icdCode).toBe('I20.0 (Unstable Angina)');
    expect(scribeResponse.body.suggestedSpecialist).toBe('Cardiology Triage Department');
  });
});
