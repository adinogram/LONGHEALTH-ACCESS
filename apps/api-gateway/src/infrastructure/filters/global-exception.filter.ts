/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Resolve system error status mapping
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Standardize developer descriptions
    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal clinical server anomaly. Please report tracking ID to network administrators.';

    const traceId = `req-trace-${Math.random().toString(36).substring(2, 11)}`;

    // Compile HIPAA safe metrics logs (exclude PII from logs)
    this.logger.error(
      `[Exception-Triggered] Code: [${status}] Exception: "${message}" | Trace: ${traceId} | Path: ${request.url}`,
      exception.stack
    );

    // Standardised corporate JSON response envelope
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId: traceId,
      message: message,
      error: status === HttpStatus.INTERNAL_SERVER_ERROR 
        ? 'InternalServerError' 
        : exception.name || 'ApplicationException',
      tenantId: request.headers['x-tenant-id'] || 'public_resolver',
    });
  }
}
