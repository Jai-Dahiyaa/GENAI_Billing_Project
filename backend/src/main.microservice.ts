import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { RABBITMQ_QUEUES } from './common/rabbitmq/rabbitmq.constants';
import { AppWorkerModule } from './modules/app.worker.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const logger = new Logger('MicroserviceBootstrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppWorkerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: RABBITMQ_QUEUES.BILLING_EVENTS,
      queueOptions: { durable: true },
      noAck: true,
    },
  });

  await app.listen();
  logger.log('Billing Microservice is UP and Listening to RabbitMQ...');
}
bootstrap();