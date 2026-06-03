/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString, IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * Data Transfer Object for validating and transferring Raw Symptom Inputs to the AI Reasoner node.
 */
export class SymptomAssessmentDto {
  @IsNotEmpty({ message: 'Presented symptoms text narrative is required.' })
  @IsString({ message: 'Presented symptoms must be formatted as raw text.' })
  symptoms: string;

  @IsNotEmpty({ message: 'Patient age is required for triage baseline calculation.' })
  @IsNumber({}, { message: 'Patient age must be an integer coefficient.' })
  @Min(0, { message: 'Age cannot occupy a negative scale.' })
  @Max(120, { message: 'Age cannot exceed standard biological boundaries.' })
  age: number;

  @IsNotEmpty({ message: 'Biological sex designation is required.' })
  @IsString()
  gender: 'MALE' | 'FEMALE' | 'OTHER';

  @IsOptional()
  @IsString()
  history?: string;
}

/**
 * Data Transfer Object representing incoming raw clinician voice transcription audio streams.
 */
export class VoiceNoteTranscriptionDto {
  @IsNotEmpty({ message: 'Voice Note transcription transcript text is required.' })
  @IsString()
  transcript: string;

  @IsOptional()
  @IsString()
  operatorRole?: string;
}
