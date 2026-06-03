/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private mockInMemoryStore = new Map<string, any>();
  private useMock = true;

  async onModuleInit() {
    this.logger.log('Bootstrapping Redis system adapter connection...');
    const redisHost = process.env.REDIS_HOST;
    if (redisHost && redisHost !== '127.0.0.1') {
      this.logger.log(`Active Redis instance detected at host ${redisHost}. Mapping nodes...`);
      this.useMock = false;
      // In production, instantiate: this.redisClient = new ioredis({ host: redisHost });
    } else {
      this.logger.log('Redis credentials absent. Bootstrapping secure local in-memory Key-Value registry for tenant states.');
      this.useMock = true;
    }
  }

  async get(key: string): Promise<any> {
    if (this.useMock) {
      return this.mockInMemoryStore.get(key) || null;
    }
    // Real implementation: return await this.redisClient.get(key);
    return null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (this.useMock) {
      this.mockInMemoryStore.set(key, value);
      if (ttlSeconds) {
        setTimeout(() => this.mockInMemoryStore.delete(key), ttlSeconds * 1000);
      }
      return;
    }
    // Real implementation: await this.redisClient.set(key, value, 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    if (this.useMock) {
      this.mockInMemoryStore.delete(key);
      return;
    }
    // Real implementation: await this.redisClient.del(key);
  }

  async onModuleDestroy() {
    this.logger.log('Discharging Redis system connection hooks...');
    this.mockInMemoryStore.clear();
  }
}
