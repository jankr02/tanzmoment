import { Module } from '@nestjs/common';
import { QueueModule } from '../queue';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

// PrismaService is provided globally; QueueModule exposes the BullMQ queues so
// the probe can reach the shared Redis connection.
@Module({
  imports: [QueueModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
