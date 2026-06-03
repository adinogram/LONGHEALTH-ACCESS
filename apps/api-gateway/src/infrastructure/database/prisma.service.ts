/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Invoke parent credentials lazy fetcher
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing connection driver mapping to central multi-tenant PostgreSQL...');
    try {
      if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://mock') {
        await this.$connect();
        this.logger.log('PostgreSQL database driver connection successfully established.');
      } else {
        this.logger.warn('DATABASE_URL is undefined or placeholder. Operating inside lazy schema projection environment.');
      }
    } catch (err: any) {
      this.logger.error(`FATAL: Database connection failure. Detail context: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from core PostgreSQL engine...');
    await this.$disconnect();
  }
}
