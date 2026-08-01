/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Health Types
 * =====================================================
 */

export interface HealthCheckResult {
  success: boolean;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
}
