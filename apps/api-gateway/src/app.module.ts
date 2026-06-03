/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppointmentController } from './infrastructure/controllers/appointment.controller';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PatientController } from './infrastructure/controllers/patient.controller';
import { EmrController } from './infrastructure/controllers/emr.controller';
import { BillingController } from './infrastructure/controllers/billing.controller';
import { LaboratoryController } from './infrastructure/controllers/laboratory.controller';
import { PharmacyController } from './infrastructure/controllers/pharmacy.controller';

import { AppointmentUseCase } from './core/use-cases/appointment/appointment.use-case';
import { AuthUseCase } from './core/use-cases/auth/auth.use-case';
import { PatientUseCase } from './core/use-cases/patient/patient.use-case';
import { EmrUseCase } from './core/use-cases/emr/emr.use-case';
import { BillingUseCase } from './core/use-cases/billing/billing.use-case';
import { LaboratoryUseCase } from './core/use-cases/laboratory/laboratory.use-case';
import { PharmacyUseCase } from './core/use-cases/pharmacy/pharmacy.use-case';

import { PrismaService } from './infrastructure/database/prisma.service';
import { RedisService } from './infrastructure/redis/redis.service';
import { QueueService } from './infrastructure/queues/queue.service';
import { CustomLoggerService } from './infrastructure/logger/custom-logger.service';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';

@Module({
  imports: [],
  controllers: [
    AppointmentController, // Inbound REST Routing mapping adapters
    AuthController,
    PatientController,
    EmrController,
    BillingController,
    LaboratoryController,
    PharmacyController,
  ],
  providers: [
    // 1. Core Use Cases (Application Domain Layer)
    AppointmentUseCase,
    AuthUseCase,
    PatientUseCase,
    EmrUseCase,
    BillingUseCase,
    LaboratoryUseCase,
    PharmacyUseCase,

    // 2. Database & Cache Drivers (Infrastructure Layer adapters)
    PrismaService,
    RedisService,
    QueueService,
    CustomLoggerService,

    // 3. Security guards
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    PrismaService,
    RedisService,
    QueueService,
    CustomLoggerService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Register global tenant resolver context extraction middlewares here
  }
}
