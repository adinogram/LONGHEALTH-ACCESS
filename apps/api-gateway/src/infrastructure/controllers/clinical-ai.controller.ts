/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ClinicalAIUseCase, SymptomAssessmentResult, SoapCompilationResult } from '../../core/use-cases/advanced/clinical-ai.use-case';
import { SymptomAssessmentDto, VoiceNoteTranscriptionDto } from '../../core/use-cases/advanced/dto/clinical-ai.dto';

@Controller('clinical-ai')
export class ClinicalAIController {
  constructor(
    private readonly aiUseCase: ClinicalAIUseCase,
  ) {}

  /**
   * Endpoint representing the AI-driven Symptom Assistant triage router.
   */
  @Post('symptoms')
  async assessSymptoms(
    @Headers('x-tenant-id') tenantId: string = 'tenant-demo-longhealth',
    @Body() dto: SymptomAssessmentDto,
  ): Promise<SymptomAssessmentResult> {
    return this.aiUseCase.evaluateSymptomProfile(tenantId, dto);
  }

  /**
   * Endpoint executing automatic dictation-to-SOAP translation.
   */
  @Post('voice-record')
  async translateVoiceDictation(
    @Headers('x-tenant-id') tenantId: string = 'tenant-demo-longhealth',
    @Body() dto: VoiceNoteTranscriptionDto,
  ): Promise<SoapCompilationResult> {
    return this.aiUseCase.parseDictationToSoap(tenantId, dto);
  }
}
