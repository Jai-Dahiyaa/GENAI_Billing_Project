import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { winstonLogger } from './config/logger.config';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConsoleLogger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

class CleanBootstrapLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    if (context === 'RouterExplorer' || context === 'RoutesResolver') {
      return; 
    }
    super.log(message, context);
  }
}

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    logger: new CleanBootstrapLogger(),
  });
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
  } else {
    app.use(morgan('combined'));
  }

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use(cookieParser());

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (message: string) => {
          winstonLogger.info(message.trim());
        },
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  logger.log(`Billing System Backend running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger Documentation available at: http://localhost:${port}/api-docs`);
}

bootstrap();
