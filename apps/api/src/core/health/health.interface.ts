/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Health Interface
 * =====================================================
 */

import type { HealthCheckResult } from "./health.types.ts";

export interface IHealthManager {
  register(name: string, check: () => Promise<HealthCheckResult>): void;
  runAll(): Promise<Record<string, HealthCheckResult>>;
  getDiagnostics(): string[];
}
