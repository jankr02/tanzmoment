import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // required for Stripe webhook signature verification
  });

  // Behind a reverse proxy, rate limiting must key on the real client IP from
  // X-Forwarded-For rather than the proxy's socket IP; otherwise every client
  // shares one throttle bucket. Opt in per deployment via TRUST_PROXY (a hop
  // count like "1", or "true"); off by default so a spoofable header is not
  // trusted when the API is exposed directly.
  const trustProxy = process.env['TRUST_PROXY'];
  if (trustProxy) {
    const hops = Number(trustProxy);
    app.set('trust proxy', Number.isFinite(hops) ? hops : trustProxy === 'true');
  }

  app.use(
    helmet({
      // Swagger UI at /api-docs relies on inline scripts/styles, which a default
      // CSP would block. The API only serves JSON plus that docs page, so a
      // page-level CSP adds little here (the Angular frontend ships its own).
      contentSecurityPolicy: false,
      // Allow the frontend (different origin) to embed uploaded images from
      // /uploads; helmet's default same-origin policy would block them.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.useStaticAssets(join(process.cwd(), 'apps/api/uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS for frontend
  app.enableCors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:4200',
    credentials: true,
  });

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Tanzmoment API')
    .setDescription(
      'API für die Tanzmoment Plattform – Tanzkurse verwalten und buchen'
    )
    .setVersion('1.0')
    .addTag('Courses', 'Kursverwaltung und -suche')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
}

bootstrap();
