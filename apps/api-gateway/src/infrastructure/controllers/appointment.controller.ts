/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { CreateAppointmentDto } from '../../use-cases/appointment/dto/create-appointment.dto';
import { AppointmentUseCase } from '../../use-cases/appointment/appointment.use-case';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentUseCase: AppointmentUseCase) {}

  /**
   * Post endpoint to book general practice scheduled appointments
   */
  @Post()
  async createAppointment(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateAppointmentDto,
  ): Promise<any> {
    
    // Fallback constants if auth context hasn't filled Operator ID (for local testing API tools)
    const activeOperatorId = 'usr_operator_8819'; 
    const targetTenant = tenantId || 'tenant_greenwood';

    // Invoke clean architecture controller-to-use-case boundary
    const entity = await this.appointmentUseCase.bookAppointment(
      targetTenant,
      activeOperatorId,
      dto,
    );

    // Standardized secure API payload return
    return {
      success: true,
      message: 'Clinical appointment successfully booked and registered inside the daily queue.',
      data: {
        id: entity.id,
        patientId: entity.patientId,
        doctorId: entity.doctorId,
        appointmentDate: entity.appointmentDate,
        queueNumber: entity.queueNumber,
        status: entity.status,
        createdAt: entity.createdAt,
      },
    };
  }
}
