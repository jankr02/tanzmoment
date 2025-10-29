import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS für Frontend
  app.enableCors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:4200',
    credentials: true,
  });

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Tanzmoment API')
    .setDescription('API für die Tanzmoment Plattform – Tanzkurse verwalten und buchen')
    .setVersion('1.0')
    .addTag('Courses', 'Kursverwaltung und -suche')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
}

bootstrap();
