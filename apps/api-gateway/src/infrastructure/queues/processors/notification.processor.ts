/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '@nestjs/common';

// Custom simulation of a BullMQ Processor
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  // In production, decorated with @Processor('clinical-notification-channel')
  async process(job: { id: string; name: string; data: any }): Promise<void> {
    this.logger.log(`[BullMQ-Worker] Worker thread picked up job ID: [${job.id}] on channel: "clinical-notification-channel"`);
    this.logger.log(`[BullMQ-Worker] Parsing execution data for action: ${job.name}`);

    try {
      const { tenantId, appointmentId, patientPhone, messageBody } = job.data;
      
      this.logger.log(`[BullMQ-Worker] Preparing outbound SMS channel transmission metrics [Tenant ID: ${tenantId}]`);
      this.logger.log(`[BullMQ-Worker] Target recipient phone: [${patientPhone}]`);
      
      // Simulate real telephony network dispatch
      this.logger.log(`[BullMQ-Worker] Carrier handshake initialization completed... Dispatch success.`);
      this.logger.log(`[BullMQ-Worker] Payload delivered: "${messageBody}"`);

    } catch (err: any) {
      this.logger.error(`[BullMQ-Worker] Job [${job.id}] execution failed during processing. Attempting standard exponential backoff...`);
      // Re-throw so BullMQ triggers automatic retries configured at queue registration level
      throw err;
    }
  }
}
