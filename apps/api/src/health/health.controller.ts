import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthReport, HealthService } from './health.service';

// Health probes run on a fixed schedule (Docker HEALTHCHECK, uptime monitor);
// rate limiting them would make a busy container flap between healthy states.
@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health probe reporting database and Redis connectivity.',
  })
  async check(): Promise<HealthReport> {
    const report = await this.healthService.check();

    // Signal degraded state with 503 so orchestrators and uptime monitors react,
    // while still returning the per-component breakdown in the body.
    if (report.status !== 'ok') {
      throw new ServiceUnavailableException(report);
    }

    return report;
  }
}
