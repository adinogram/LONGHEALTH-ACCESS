/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';
import { CustomLoggerService } from './infrastructure/logger/custom-logger.service';

async function bootstrap() {
  const logger = new Logger('NestBootstrap');
  
  // Create NestJS app with Clean Architecture structures
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(), // HIPAA aligned system logging
  });

  // Global prefix for API endpoints
  app.setGlobalPrefix('api');

  // Enforce rigid request payload validation using class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // strip non-declared attributes
    forbidNonWhitelisted: true,  // throw error on unexpected attributes
    transform: true,            // auto-convert objects to designated DTO classes
    disableErrorMessages: false // enable descriptive errors for developers
  }));

  // Enforce global structured error filtering
  app.useGlobalFilters(new GlobalExceptionFilter(new CustomLoggerService()));

  // Setup CORS rules for trusted tenant browser portals
  app.enableCors({
    origin: '*', // In production, replace with specific hospital subdomain whitelist
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Tenant-ID',
    credentials: true,
  });

  const PORT = process.env.NEST_PORT || 3001;
  await app.listen(PORT, '0.0.0.5'); // Listen for RPC gateway ingress on private VPC interface
  
  logger.log(`[LONGHEALTH-Nest-Core] Clean Architecture backend booted on port ${PORT}`);
}

bootstrap();
