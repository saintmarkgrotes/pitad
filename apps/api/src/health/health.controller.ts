import { Controller, Get } from '@nestjs/common';
import type { ApiSuccess } from '@pitad/shared';

import { HealthService, type HealthStatus } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): ApiSuccess<HealthStatus> {
    return { data: this.healthService.getStatus() };
  }
}