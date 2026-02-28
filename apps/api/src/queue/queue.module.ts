import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from './queue.constants';

/**
 * Configures BullMQ with a shared Redis connection and registers all queues.
 *
 * Processors live in their respective domain modules (WaitlistModule)
 * to avoid circular dependencies.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.BOOKING_EXPIRY },
      { name: QUEUE_NAMES.WAITLIST_PROMOTION },
      { name: QUEUE_NAMES.SESSION_REMINDER },
      { name: QUEUE_NAMES.MAINTENANCE },
      { name: QUEUE_NAMES.BATCH_REFUND },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
