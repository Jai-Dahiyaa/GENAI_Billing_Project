import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { getValkeyConfig } from '../../config/valkey.config';

@Injectable()
export class CacheManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheManagerService.name);
  private client: Redis;

  async onModuleInit() {
    const config = getValkeyConfig();
    this.client = new Redis(config);

    this.client.on('connect', () => {
      this.logger.log('Valkey/Redis Cache Client Initialized');
    });

    this.client.on('ready', () => {
      this.logger.log('Valkey/Redis Cache connected and ready to serve requests');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Valkey/Redis Connection Error: ${err.message}`);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Valkey/Redis Cache connection gracefully closed');
    }
  }
}