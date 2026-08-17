import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DirectDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DirectDbService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    const client = await this.pool.connect();
    client.release();
    this.logger.log('Direct PostgreSQL Pool connected successfully');
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Direct PostgreSQL Pool connection closed');
  }
}