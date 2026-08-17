import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CLIENTS, RABBITMQ_QUEUES } from './rabbitmq.constants';
import { EmailJobs } from '../../jobs/email.jobs';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: RABBITMQ_CLIENTS.MAIN_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: RABBITMQ_QUEUES.BILLING_EVENTS,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [EmailJobs],
  exports: [ClientsModule, EmailJobs],
})
export class RabbitMQModule {}