/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Post, Patch, Get, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { BillingUseCase } from '../../core/use-cases/billing/billing.use-case';
import { CreateInvoiceDto, RecordPaymentDto, SubmitClaimDto, ReconcileClaimDto } from '../../core/use-cases/billing/dto/billing.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequiresPermissions, CurrentUser } from '../decorators/auth.decorator';
import { AppPermission } from '../../core/domain/entities/permission.entity';

@Controller('billing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BillingController {
  constructor(private readonly billingUseCase: BillingUseCase) {}

  /**
   * Generates a new invoice for services rendered
   */
  @Post('invoices')
  @RequiresPermissions(AppPermission.BILLING_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateInvoiceDto,
  ): Promise<any> {
    const result = await this.billingUseCase.createInvoice(user.tenantId, user.id, dto);
    return {
      success: true,
      message: 'Billing invoice generated successfully.',
      data: result,
    };
  }

  /**
   * Records payment transactions against patient invoices
   */
  @Post('invoices/:id/payments')
  @RequiresPermissions(AppPermission.BILLING_MANAGE)
  async recordPayment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ): Promise<any> {
    const result = await this.billingUseCase.recordPayment(user.tenantId, user.id, id, dto);
    return {
      success: true,
      message: 'Payment credited successfully.',
      data: result,
    };
  }

  /**
   * Submits an insurance claim against an active invoice
   */
  @Post('invoices/:id/claims')
  @RequiresPermissions(AppPermission.BILLING_MANAGE)
  async submitClaim(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SubmitClaimDto,
  ): Promise<any> {
    const result = await this.billingUseCase.submitInsuranceClaim(user.tenantId, user.id, id, dto);
    return {
      success: true,
      message: 'Insurance claim dispatched and submitted.',
      data: result,
    };
  }

  /**
   * Resolves, approves, or rejects an outstanding insurance claim
   */
  @Patch('claims/:claimId/reconcile')
  @RequiresPermissions(AppPermission.BILLING_MANAGE)
  async reconcile(
    @CurrentUser() user: any,
    @Param('claimId') claimId: string,
    @Body() dto: ReconcileClaimDto,
  ): Promise<any> {
    const result = await this.billingUseCase.reconcileClaim(user.tenantId, user.id, claimId, dto);
    return {
      success: true,
      message: 'Insurance claim processed and accounts balanced.',
      data: result,
    };
  }

  /**
   * Retrieves outstanding and historical invoices
   */
  @Get('invoices')
  @RequiresPermissions(AppPermission.BILLING_READ)
  async list(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
  ): Promise<any> {
    const result = await this.billingUseCase.listInvoices(user.tenantId, { status, patientId });
    return {
      success: true,
      data: result,
    };
  }
}
