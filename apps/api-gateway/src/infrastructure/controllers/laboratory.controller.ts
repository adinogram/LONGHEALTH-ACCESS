/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Patch, Get, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { LaboratoryUseCase } from '../../core/use-cases/laboratory/laboratory.use-case';
import { OrderTestDto, UpdateResultsDto } from '../../core/use-cases/laboratory/dto/laboratory.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequiresPermissions, CurrentUser } from '../decorators/auth.decorator';
import { AppPermission } from '../../core/domain/entities/permission.entity';

@Controller('laboratory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LaboratoryController {
  constructor(private readonly labUseCase: LaboratoryUseCase) {}

  /**
   * Electronically orders a laboratory diagnostic test for a patient
   */
  @Post('orders')
  @RequiresPermissions(AppPermission.LAB_TEST_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async order(
    @CurrentUser() user: any,
    @Body() dto: OrderTestDto,
  ): Promise<any> {
    const result = await this.labUseCase.orderTest(user.tenantId, user.id, dto);
    return {
      success: true,
      message: 'Laboratory diagnostic test ordered successfully.',
      data: result,
    };
  }

  /**
   * Commits structured result metrics and keys by lab technicians
   */
  @Patch('reports/:id/results')
  @RequiresPermissions(AppPermission.LAB_TEST_MANAGE)
  async recordResults(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateResultsDto,
  ): Promise<any> {
    const result = await this.labUseCase.updateResults(user.tenantId, user.id, id, dto);
    return {
      success: true,
      message: 'Diagnostic test ranges documented.',
      data: result,
    };
  }

  /**
   * Finalizes and releases laboratory report
   */
  @Patch('reports/:id/release')
  @RequiresPermissions(AppPermission.LAB_REPORT_RELEASE)
  async release(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<any> {
    const result = await this.labUseCase.releaseReport(user.tenantId, user.id, id);
    return {
      success: true,
      message: 'Laboratory report successfully signed off and released.',
      data: result,
    };
  }

  /**
   * Queries and lists clinical lab orders and reports
   */
  @Get('reports')
  @RequiresPermissions(AppPermission.LAB_TEST_MANAGE)
  async list(
    @CurrentUser() user: any,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    const result = await this.labUseCase.listReports(user.tenantId, { patientId, status });
    return {
      success: true,
      data: result,
    };
  }
}
