/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsUUID, IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID(4, { message: 'Patient ID must be a standard RFC4122 Version 4 UUID' })
  @IsNotEmpty({ message: 'Patient ID is a required field' })
  patientId: string;

  @IsUUID(4, { message: 'Doctor ID must be a standard RFC4122 Version 4 UUID' })
  @IsNotEmpty({ message: 'Doctor ID is a required field' })
  doctorId: string;

  @IsDateString({}, { message: 'Appointment Date must be a valid ISO 8601 extended timestamp string' })
  @IsNotEmpty({ message: 'Appointment date and scheduled slot are required' })
  appointmentDate: string;

  @IsString({ message: 'Chief Complaint must be a text description string' })
  @IsNotEmpty({ message: 'Primary complaint or pre-screening reason required' })
  @MaxLength(1000, { message: 'Chief Complaint cannot exceed 1000 characters' })
  complaint: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Presenting symptoms must keep beneath 500 characters' })
  symptoms?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Initial physical check notes must keep beneath 2000 characters' })
  notes?: string;
}
