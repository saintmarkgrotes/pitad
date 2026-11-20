import { Controller, Get } from '@nestjs/common';
import type { ApiSuccess } from '@pitad/shared';
import { Public } from '@nestjs/authentication';

import { HealthService, type HealthStatus } from './health.service.js';
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): ApiSuccess<HealthStatus> {
    return { data: this.healthService.getStatus() };
  }
}
