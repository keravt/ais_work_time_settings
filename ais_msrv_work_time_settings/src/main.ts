import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';


async function bootstrap() {

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_ADDRESS],
      queue: process.env.RABBITMQ_WORK_TIME_SETTINGS_QUEUE,
      queueOptions: {
        durable: false
      },
    },
  })

  app.listen()
}
bootstrap();
