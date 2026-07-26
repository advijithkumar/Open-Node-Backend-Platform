import type { IHealthManager } from "./health.interface.js";
import type { HealthCheck, HealthCheckResult } from "./health.types.ts";

/**
 * Central manager for async health checks.
 * Modules and plugins register their specific checks here.
 */
export class HealthManager implements IHealthManager {
  private readonly checks: HealthCheck[] = [];

  /** Register a new health‑check */
  register(name: string, check: () => Promise<HealthCheckResult>): void {
    this.checks.push({ name, check });
  }

  /** Run every registered check and return a map `name → result` */
  async runAll(): Promise<Record<string, HealthCheckResult>> {
    const out: Record<string, HealthCheckResult> = {};
    for (const { name, check } of this.checks) {
      try {
        out[name] = await check();
      } catch (e) {
        out[name] = { success: false, message: (e as Error).message };
      }
    }
    return out;
  }

  /** Diagnostic information – just the names of the checks */
  getDiagnostics(): string[] {
    return this.checks.map((c) => c.name);
  }
}
