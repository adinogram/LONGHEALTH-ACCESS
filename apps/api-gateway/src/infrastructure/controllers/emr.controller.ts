/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Get, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { EmrUseCase } from '../../core/use-cases/emr/emr.use-case';
import { CreatePrescriptionDto } from '../../core/use-cases/emr/dto/emr.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequiresPermissions, CurrentUser } from '../decorators/auth.decorator';
import { AppPermission } from '../../core/domain/entities/permission.entity';

@Controller('emr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmrController {
  constructor(private readonly emrUseCase: EmrUseCase) {}

  /**
   * Electronically issues a new prescription for a patient
   */
  @Post('prescriptions')
  @RequiresPermissions(AppPermission.PRESCRIPTION_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async issue(
    @CurrentUser() user: any,
    @Body() dto: CreatePrescriptionDto,
  ): Promise<any> {
    const result = await this.emrUseCase.issuePrescription(user.tenantId, user.id, dto);
    return {
      success: true,
      message: 'Prescription written and committed to EMR successfully.',
      data: result,
    };
  }

  /**
   * Retrieves detail charts for a single prescription
   */
  @Get('prescriptions/:id')
  @RequiresPermissions(AppPermission.PRESCRIPTION_READ)
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<any> {
    const result = await this.emrUseCase.getPrescription(user.tenantId, user.id, id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Retrieves complete historical prescriptions/diagnoses for select patient
   */
  @Get('patients/:patientId')
  @RequiresPermissions(AppPermission.PRESCRIPTION_READ)
  async findHistory(
    @CurrentUser() user: any,
    @Param('patientId') patientId: string,
  ): Promise<any> {
    const result = await this.emrUseCase.getPatientMedicalHistory(user.tenantId, user.id, patientId);
    return {
      success: true,
      data: result,
    };
  }
}
