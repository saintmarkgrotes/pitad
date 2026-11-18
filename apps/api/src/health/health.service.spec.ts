import { describe, expect, it } from 'vitest';

import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('reports ok with a non-negative uptime and an ISO timestamp', () => {
    const status = new HealthService().getStatus();

    expect(status.status).toBe('ok');
    expect(status.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(new Date(status.timestamp).toISOString()).toBe(status.timestamp);
  });
});
