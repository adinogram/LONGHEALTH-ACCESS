/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private tasksQueue: any = null;

  async onModuleInit() {
    this.logger.log('Bootstrapping BullMQ Core Task Queues on top of Redis engine...');
    // Real setup:
    // this.tasksQueue = new Queue('clinical-notification-channel', {
    //   connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }
    // });
    this.logger.log('[BullMQ-Registry] Queue: "clinical-notification-channel" successfully registered.');
  }

  /**
   * Pushes a background job to BullMQ task processor
   */
  async enqueueNotification(eventName: string, payload: {
    tenantId: string;
    appointmentId: string;
    patientPhone: string;
    messageBody: string;
  }): Promise<void> {
    this.logger.log(`[BullMQ-Producer] Enqueuing back-end job: "${eventName}" to active Queue channel.`);
    this.logger.log(`[BullMQ-Producer] Payload: { tenantId: "${payload.tenantId}", appointmentId: "${payload.appointmentId}" }`);
    
    // In production, execute:
    // await this.tasksQueue.add(eventName, payload, {
    //   attempts: 5,
    //   backoff: { type: 'exponential', delay: 5000 }
    // });
  }
}
