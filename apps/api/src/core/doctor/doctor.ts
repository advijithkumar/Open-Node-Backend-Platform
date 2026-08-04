/* eslint-disable @typescript-eslint/no-explicit-any */
import os from "node:os";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import type { Kernel } from "../kernel/kernel.js";
import { KERNEL_SERVICES } from "../kernel/kernel.constants.js";

export interface DiagnosticResult {
  status: "healthy" | "warning" | "critical" | "unknown";
  severity: "info" | "low" | "medium" | "high";
  component: string;
  message: string;
  details?: any;
  recommendation?: string;
}

export interface DoctorReport {
  overallStatus: "healthy" | "warning" | "critical" | "unknown";
  timestamp: string;
  results: DiagnosticResult[];
  systemInfo: {
    platform: string;
    arch: string;
    nodeVersion: string;
    uptime: number;
    memory: {
      free: number;
      total: number;
      usagePercentage: number;
    };
  };
}

export class DoctorService {
  /**
   * Run all diagnostic checks.
   */
  async runDiagnostics(): Promise<DoctorReport> {
    const results: DiagnosticResult[] = [];

    // Run each diagnostic check block
    await this.checkBootStatus(results);
    this.checkContainerHealth(results);
    this.checkConfigurationValidity(results);
    this.checkModulesAndPlugins(results);
    await this.checkProvidersHealth(results);
    await this.checkCacheQueueStorageHealth(results);
    await this.checkNotificationFrameworkHealth(results);
    await this.checkEmailFrameworkHealth(results);
    await this.checkAIFrameworkHealth(results);
    await this.checkWorkflowFrameworkHealth(results);
    this.checkDependencyOrdering(results);

    // Compute overall status
    let overallStatus: "healthy" | "warning" | "critical" | "unknown" = "healthy";
    if (results.some((r) => r.status === "critical")) {
      overallStatus = "critical";
    } else if (results.some((r) => r.status === "warning")) {
      overallStatus = "warning";
    }

    const freeMem = os.freemem();
    const totalMem = os.totalmem();

    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      results,
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: os.uptime(),
        memory: {
          free: freeMem,
          total: totalMem,
          usagePercentage: Math.round(((totalMem - freeMem) / totalMem) * 100),
        },
      },
    };
  }

  private async checkBootStatus(results: DiagnosticResult[]): Promise<void> {
    try {
      if (!container.has(KERNEL_SERVICES.KERNEL)) {
        results.push({
          status: "critical",
          severity: "high",
          component: "Kernel",
          message: "Kernel is not registered in the DI Container.",
          recommendation: "Ensure registerCore() is called during bootstrap.",
        });
        return;
      }

      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      const state = kernel.getDiagnostics().state;

      if (state !== "booted") {
        results.push({
          status: "warning",
          severity: "medium",
          component: "Kernel",
          message: `Kernel is in state '${state}', expected 'booted'.`,
          recommendation: "Ensure kernel.boot() completes successfully.",
          details: { state },
        });
      } else {
        results.push({
          status: "healthy",
          severity: "info",
          component: "Kernel",
          message: "Kernel is fully booted and operational.",
          details: { state },
        });
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Kernel",
        message: `Failed to resolve Kernel state: ${err.message}`,
        recommendation: "Check constructor bindings in core bootstrap.",
      });
    }
  }

  private checkContainerHealth(results: DiagnosticResult[]): void {
    const requiredServices = [
      CORE_SERVICES.EVENT_BUS,
      CORE_SERVICES.CONFIG,
      CORE_SERVICES.DISCOVERY,
      CORE_SERVICES.HEALTH,
      CORE_SERVICES.PROVIDER_MANAGER,
      CORE_SERVICES.STORAGE,
      CORE_SERVICES.CACHE,
      CORE_SERVICES.QUEUE,
      CORE_SERVICES.NOTIFICATION,
      CORE_SERVICES.EMAIL,
      CORE_SERVICES.WORKFLOW,
    ];

    const missing: string[] = [];
    for (const service of requiredServices) {
      if (!container.has(service)) {
        missing.push(service);
      }
    }

    if (missing.length > 0) {
      results.push({
        status: "critical",
        severity: "high",
        component: "DI Container",
        message: `Missing core services in container: ${missing.join(", ")}`,
        recommendation: "Verify core bootstrap registers all services in register-core.ts.",
        details: { missing },
      });
    } else {
      results.push({
        status: "healthy",
        severity: "info",
        component: "DI Container",
        message: "All required core services are successfully registered in the DI container.",
      });
    }
  }

  private checkConfigurationValidity(results: DiagnosticResult[]): void {
    try {
      if (!container.has(CORE_SERVICES.CONFIG)) return;
      const configManager = container.resolve<any>(CORE_SERVICES.CONFIG);

      // Verify that ConfigManager returns default values or critical configs are set
      const appName = configManager.get("app.name") || configManager.get("env.APP_NAME");

      if (!appName) {
        results.push({
          status: "warning",
          severity: "low",
          component: "ConfigManager",
          message: "Application configuration parameter 'app.name' is missing.",
          recommendation: "Define APP_NAME in your environment configuration.",
        });
      } else {
        results.push({
          status: "healthy",
          severity: "info",
          component: "ConfigManager",
          message: `Application configuration loaded for '${appName}'.`,
        });
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "ConfigManager",
        message: `ConfigManager evaluation failed: ${err.message}`,
      });
    }
  }

  private checkModulesAndPlugins(results: DiagnosticResult[]): void {
    try {
      if (!container.has(KERNEL_SERVICES.KERNEL)) return;
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      const diagnostics = kernel.getDiagnostics();

      const failedModules = diagnostics.modules.filter((m: any) => !m.enabled);
      if (failedModules.length > 0) {
        results.push({
          status: "warning",
          severity: "medium",
          component: "ModuleManager",
          message: `${failedModules.length} module(s) are disabled or failed to boot: ${failedModules.map((m: any) => m.name).join(", ")}`,
          recommendation: "Check modules configuration and resolve module dependencies.",
          details: { failedModules },
        });
      } else {
        results.push({
          status: "healthy",
          severity: "info",
          component: "ModuleManager",
          message: `All modules (${diagnostics.modules.length}) are loaded and active.`,
        });
      }

      const failedPlugins = diagnostics.plugins.filter((p: any) => !p.enabled);
      if (failedPlugins.length > 0) {
        results.push({
          status: "warning",
          severity: "medium",
          component: "PluginManager",
          message: `${failedPlugins.length} plugin(s) are disabled or failed to boot: ${failedPlugins.map((p: any) => p.name).join(", ")}`,
          recommendation: "Check database/service configurations required by the plugin.",
          details: { failedPlugins },
        });
      } else {
        results.push({
          status: "healthy",
          severity: "info",
          component: "PluginManager",
          message: `All plugins (${diagnostics.plugins.length}) are loaded and active.`,
        });
      }
    } catch {
      // Handled by other tests
    }
  }

  private async checkProvidersHealth(results: DiagnosticResult[]): Promise<void> {
    try {
      if (!container.has(CORE_SERVICES.PROVIDER_MANAGER)) return;
      const providerMgr = container.resolve<any>(CORE_SERVICES.PROVIDER_MANAGER);
      const diags = await providerMgr.getDiagnostics();

      for (const p of diags) {
        if (!p.enabled) {
          results.push({
            status: "warning",
            severity: "low",
            component: `Provider: ${p.name}`,
            message: `Provider '${p.name}' is disabled.`,
            details: p,
          });
          continue;
        }

        const isHealthy = p.health?.status === "healthy";
        if (!isHealthy) {
          results.push({
            status: "critical",
            severity: "high",
            component: `Provider: ${p.name}`,
            message: `Provider '${p.name}' connectivity check failed: ${p.health?.reason || "unhealthy"}`,
            recommendation: `Check host connectivity for ${p.type} backend ${p.name}.`,
            details: p,
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: `Provider: ${p.name}`,
            message: `Provider '${p.name}' (${p.type}) connection check passed.`,
            details: p,
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "ProviderManager",
        message: `Failed to check providers health: ${err.message}`,
      });
    }
  }

  private async checkCacheQueueStorageHealth(results: DiagnosticResult[]): Promise<void> {
    // 1. Storage Health
    try {
      if (container.has(CORE_SERVICES.STORAGE)) {
        const storage = container.resolve<any>(CORE_SERVICES.STORAGE);
        const health = await storage.getHealth();
        if (health.status !== "healthy") {
          results.push({
            status: "critical",
            severity: "high",
            component: "Storage Framework",
            message: `Storage provider '${storage.getDiagnostics().activeProvider}' health check failed: ${health.reason || "unhealthy"}`,
            recommendation: "Verify file permissions or MinIO container health.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "Storage Framework",
            message: `Storage provider '${storage.getDiagnostics().activeProvider}' is healthy.`,
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Storage Framework",
        message: `Failed to inspect Storage health: ${err.message}`,
      });
    }

    // 2. Cache Health
    try {
      if (container.has(CORE_SERVICES.CACHE)) {
        const cache = container.resolve<any>(CORE_SERVICES.CACHE);
        const health = await cache.getManager().getHealth();
        if (health.status !== "healthy") {
          results.push({
            status: "critical",
            severity: "high",
            component: "Cache Framework",
            message: `Cache provider '${cache.getManager().getDiagnostics().activeProvider}' health check failed: ${health.error || "unhealthy"}`,
            recommendation: "Verify redis connection parameters or memory limitations.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "Cache Framework",
            message: `Cache provider '${cache.getManager().getDiagnostics().activeProvider}' is healthy.`,
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Cache Framework",
        message: `Failed to inspect Cache health: ${err.message}`,
      });
    }

    // 3. Queue Health
    try {
      if (container.has(CORE_SERVICES.QUEUE)) {
        const queue = container.resolve<any>(CORE_SERVICES.QUEUE);
        const health = await queue.getHealth();
        if (health.status !== "healthy") {
          results.push({
            status: "critical",
            severity: "high",
            component: "Queue Framework",
            message: `Queue provider '${queue.getDiagnostics().activeProvider}' health check failed: ${health.error || "unhealthy"}`,
            recommendation: "Ensure queue system backend is reachable.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "Queue Framework",
            message: `Queue provider '${queue.getDiagnostics().activeProvider}' is healthy.`,
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Queue Framework",
        message: `Failed to inspect Queue health: ${err.message}`,
      });
    }
  }

  private async checkNotificationFrameworkHealth(results: DiagnosticResult[]): Promise<void> {
    try {
      if (container.has(CORE_SERVICES.NOTIFICATION)) {
        const ns = container.resolve<any>(CORE_SERVICES.NOTIFICATION);
        const health = await ns.getHealth();
        if (health.status !== "healthy") {
          results.push({
            status: "critical",
            severity: "high",
            component: "Notification Framework",
            message: `Notification health check failed: ${health.reason || "unhealthy"}`,
            recommendation: "Ensure at least one notification provider is registered and healthy.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "Notification Framework",
            message: "Notification Framework is healthy.",
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Notification Framework",
        message: `Failed to inspect Notification health: ${err.message}`,
      });
    }
  }

  private async checkEmailFrameworkHealth(results: DiagnosticResult[]): Promise<void> {
    try {
      if (container.has(CORE_SERVICES.EMAIL)) {
        const es = container.resolve<any>(CORE_SERVICES.EMAIL);
        const health = await es.getHealth();
        if (health.status !== "healthy") {
          results.push({
            status: "critical",
            severity: "high",
            component: "Email Framework",
            message: `Email Framework health check failed: ${health.reason || "unhealthy"}`,
            recommendation: "Ensure SMTP configuration settings are correct.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "Email Framework",
            message: "Email Framework is healthy.",
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Email Framework",
        message: `Failed to inspect Email health: ${err.message}`,
      });
    }
  }

  private async checkAIFrameworkHealth(results: DiagnosticResult[]): Promise<void> {
    try {
      if (container.has(CORE_SERVICES.AI)) {
        const ai = container.resolve<any>(CORE_SERVICES.AI);
        const health = await ai.health();
        if (health.status !== "healthy") {
          results.push({
            status: "critical",
            severity: "high",
            component: "AI Framework",
            message: `AI Framework health check failed: ${health.reason || "unhealthy"}`,
            recommendation: "Ensure an active AI provider is registered and responsive.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "AI Framework",
            message: "AI Framework is healthy.",
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "AI Framework",
        message: `Failed to inspect AI health: ${err.message}`,
      });
    }
  }

  private async checkWorkflowFrameworkHealth(results: DiagnosticResult[]): Promise<void> {
    try {
      if (container.has(CORE_SERVICES.WORKFLOW)) {
        const ws = container.resolve<any>(CORE_SERVICES.WORKFLOW);
        if (!ws.registry || typeof ws.execute !== "function") {
          results.push({
            status: "critical",
            severity: "high",
            component: "Workflow Framework",
            message: "Workflow registry or execution engine not fully initialized.",
            recommendation: "Verify WorkflowService registry initialization.",
          });
        } else {
          results.push({
            status: "healthy",
            severity: "info",
            component: "Workflow Framework",
            message: "Workflow Framework is healthy.",
          });
        }
      }
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Workflow Framework",
        message: `Failed to inspect Workflow health: ${err.message}`,
      });
    }
  }

  private checkDependencyOrdering(results: DiagnosticResult[]): void {
    try {
      if (!container.has(KERNEL_SERVICES.KERNEL)) return;
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);

      // Trigger topological sorting to catch missing or circular dependencies
      kernel.plugins.getTopologicallySortedPlugins();
      kernel.modules.getTopologicallySortedModules();

      results.push({
        status: "healthy",
        severity: "info",
        component: "Dependency Orderer",
        message: "No circular or missing module/plugin dependencies detected.",
      });
    } catch (err: any) {
      results.push({
        status: "critical",
        severity: "high",
        component: "Dependency Orderer",
        message: `Dependency resolution failure: ${err.message}`,
        recommendation: "Examine modules/plugins dependencies array definitions.",
      });
    }
  }
}
export default DoctorService;
