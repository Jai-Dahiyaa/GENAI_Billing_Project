import { RmqOptions, Transport } from '@nestjs/microservices';

export const getRabbitMQMicroserviceOptions = (queueName: string): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
    queue: queueName,
    queueOptions: {
      durable: true,
    },
    noAck: false, 
  },
});