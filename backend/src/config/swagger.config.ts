import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Multi-Branch Billing & POS SaaS API')
    .setDescription(
      'Complete Production-Grade API documentation for Multi-Branch Inventory, Billing, Udhaar Khata, and Analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Token here',
        in: 'header',
      },
      'JWT-auth', // Authentication name for Swagger UI
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Endpoint setup: http://localhost:5000/api-docs
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Browser refresh par bhi JWT token nahi hatega
    },
    customSiteTitle: 'Billing SaaS API Docs',
  });
}