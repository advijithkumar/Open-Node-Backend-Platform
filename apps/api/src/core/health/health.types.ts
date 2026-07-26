/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Health Types
 * =====================================================
 */

export interface HealthCheckResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
}
