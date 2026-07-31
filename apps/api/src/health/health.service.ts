import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue';

export type ComponentStatus = 'up' | 'down';

export interface HealthReport {
  status: 'ok' | 'error';
  info: { database: ComponentStatus; redis: ComponentStatus };
  uptime: number;
  timestamp: string;
}

/**
 * A dependency that hangs (e.g. Redis unreachable but ioredis silently queuing
 * commands) must not stall the probe: cap every check so the endpoint always
 * answers well within the Docker HEALTHCHECK timeout.
 */
const PING_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    // Reuse the application's own BullMQ Redis connection rather than opening a
    // second socket, so the probe reflects the connection the app depends on.
    @InjectQueue(QUEUE_NAMES.MAINTENANCE)
    private readonly maintenanceQueue: Queue,
  ) {}

  async check(): Promise<HealthReport> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const healthy = database === 'up' && redis === 'up';

    return {
      status: healthy ? 'ok' : 'error',
      info: { database, redis },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<ComponentStatus> {
    try {
      await this.withTimeout(this.prisma.$queryRaw`SELECT 1`, 'database');
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<ComponentStatus> {
    try {
      // Acquiring the client can itself block while the connection is down, so
      // the timeout must cover both the acquisition and the ping.
      await this.withTimeout(
        (async () => {
          const client = await this.maintenanceQueue.client;
          await client.ping();
        })(),
        'redis',
      );
      return 'up';
    } catch {
      return 'down';
    }
  }

  private withTimeout<T>(operation: Promise<T>, label: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${label} health check timed out`)),
        PING_TIMEOUT_MS,
      );
    });
    return Promise.race([operation, timeout]).finally(() =>
      clearTimeout(timer),
    );
  }
}
