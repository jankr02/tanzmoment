import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CoursesModule } from '../courses/courses.module';
import { ContactModule } from '../contact/contact.module';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../email/email.module';
import { AdminModule } from '../admin/admin.module';
import { NewsModule } from '../news/news.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { UploadsModule } from '../uploads/uploads.module';
import { emailConfig } from '../config/email.config';
import { validateEnv } from '../config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      load: [emailConfig],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute window
        limit: 60, // 60 requests per IP per window
      },
    ]),
    PrismaModule,
    AuthModule,
    CoursesModule,
    ContactModule,
    BookingsModule,
    PaymentsModule,
    EmailModule,
    NewsModule,
    NewsletterModule,
    AdminModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
