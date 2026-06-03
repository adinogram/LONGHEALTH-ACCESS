/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Patch, Get, Body, Param, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { PatientUseCase } from '../../core/use-cases/patient/patient.use-case';
import { CreatePatientDto, UpdatePatientDto } from '../../core/use-cases/patient/dto/patient.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequiresPermissions, CurrentUser } from '../decorators/auth.decorator';
import { AppPermission } from '../../core/domain/entities/permission.entity';

@Controller('patients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientController {
  constructor(private readonly patientUseCase: PatientUseCase) {}

  /**
   * Registers a patient within the isolation tenant
   */
  @Post()
  @RequiresPermissions(AppPermission.PATIENT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @CurrentUser() user: any,
    @Body() dto: CreatePatientDto,
  ): Promise<any> {
    const result = await this.patientUseCase.registerPatient(user.tenantId, user.id, dto);
    return {
      success: true,
      message: 'Patient profile recorded successfully.',
      data: result,
    };
  }

  /**
   * Modifies an active clinical patient folder
   */
  @Patch(':id')
  @RequiresPermissions(AppPermission.PATIENT_UPDATE)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<any> {
    const result = await this.patientUseCase.updatePatient(user.tenantId, user.id, id, dto);
    return {
      success: true,
      message: 'Patient clinical file updated successfully.',
      data: result,
    };
  }

  /**
   * Retrieves fine-grained patient clinical chart records
   */
  @Get(':id')
  @RequiresPermissions(AppPermission.PATIENT_READ)
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<any> {
    const result = await this.patientUseCase.findPatientById(user.tenantId, user.id, id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Queries and lists database patient clinical files with paginations
   */
  @Get()
  @RequiresPermissions(AppPermission.PATIENT_READ)
  async list(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<any> {
    const result = await this.patientUseCase.listPatients(user.tenantId, { status, search, skip, take });
    return {
      success: true,
      ...result,
    };
  }
}
