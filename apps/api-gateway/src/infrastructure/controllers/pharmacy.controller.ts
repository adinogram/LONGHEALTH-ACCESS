/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Patch, Get, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PharmacyUseCase } from '../../core/use-cases/pharmacy/pharmacy.use-case';
import { AddStockDto, CreatePharmacyOrderDto } from '../../core/use-cases/pharmacy/dto/pharmacy.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequiresPermissions, CurrentUser } from '../decorators/auth.decorator';
import { AppPermission } from '../../core/domain/entities/permission.entity';

@Controller('pharmacy')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PharmacyController {
  constructor(private readonly pharmacyUseCase: PharmacyUseCase) {}

  /**
   * Adds stock batches to medicine inventories
   */
  @Post('inventory/batches')
  @RequiresPermissions(AppPermission.PRESCRIPTION_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async addStock(
    @CurrentUser() user: any,
    @Body() dto: AddStockDto,
  ): Promise<any> {
    const result = await this.pharmacyUseCase.addStockBatch(user.tenantId, user.id, dto);
    return {
      success: true,
      message: 'Pharmaceutical stock batch registered.',
      data: result,
    };
  }

  /**
   * Enrolls an operational dispensing pharmacy invoicing order
   */
  @Post('orders')
  @RequiresPermissions(AppPermission.PRESCRIPTION_READ)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: any,
    @Body() dto: CreatePharmacyOrderDto,
  ): Promise<any> {
    const result = await this.pharmacyUseCase.createPharmacyOrder(user.tenantId, user.id, dto);
    return {
      success: true,
      message: 'Pharmacy order created and queued for preparation.',
      data: result,
    };
  }

  /**
   * Cleans, checks inventory and dispenses active medications
   */
  @Patch('orders/:id/dispense')
  @RequiresPermissions(AppPermission.PRESCRIPTION_READ)
  async dispense(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<any> {
    const result = await this.pharmacyUseCase.dispenseMedications(user.tenantId, user.id, id);
    return {
      success: true,
      message: 'Medication order successfully processed, checked, and dispensed.',
      ...result,
    };
  }

  /**
   * Returns active pharmacy orders list
   */
  @Get('orders')
  @RequiresPermissions(AppPermission.PRESCRIPTION_READ)
  async list(
    @CurrentUser() user: any,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    const result = await this.pharmacyUseCase.listOrders(user.tenantId, { patientId, status });
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Resolves low stock warnings and near-expiration batch logs
   */
  @Get('alerts')
  @RequiresPermissions(AppPermission.PRESCRIPTION_READ)
  async alerts(
    @CurrentUser() user: any,
  ): Promise<any> {
    const result = await this.pharmacyUseCase.getStockAlerts(user.tenantId);
    return {
      success: true,
      data: result,
    };
  }
}
