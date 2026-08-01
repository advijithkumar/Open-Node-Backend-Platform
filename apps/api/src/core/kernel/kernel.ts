/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Container } from "../container/index.js";
import type { Express } from "express";
import type { EventBus } from "../events/index.js";
import type { HookManager } from "../hooks/index.js";
import type { LifecycleManager } from "../lifecycle/index.js";
import type { ModuleManager } from "../modules/index.js";
import type { PluginManager } from "../plugins/index.js";
import type { Logger } from "pino";
import { env } from "../config/env.js";
import { CORE_SERVICES } from "../container/service.constants.js";

import type { IKernel, KernelDiagnostics } from "./kernel.interface.js";

export class Kernel implements IKernel {
  // expose router manager via a convenient getter
  get router() {
    // Resolve lazily from the container – avoids circular ctor deps
    return this.container.resolve<any>(CORE_SERVICES.ROUTER);
  }
  get health() {
    return this.container.resolve<any>(CORE_SERVICES.HEALTH);
  }
  get storage() {
    return this.container.resolve<any>(CORE_SERVICES.STORAGE);
  }
  get cache() {
    return this.container.resolve<any>(CORE_SERVICES.CACHE);
  }
  get queue() {
    return this.container.resolve<any>(CORE_SERVICES.QUEUE);
  }
  get scheduler() {
    return this.container.resolve<any>(CORE_SERVICES.SCHEDULER);
  }
  get ai() {
    return this.container.resolve<any>(CORE_SERVICES.AI);
  }
  get provider() {
    return this.container.resolve<any>(CORE_SERVICES.PROVIDER_MANAGER);
  }
  get config() {
    return this.container.resolve<any>(CORE_SERVICES.CONFIG);
  }
  get discovery() {
    return this.container.resolve<any>(CORE_SERVICES.DISCOVERY);
  }

  private readonly startTime = Date.now();

  constructor(
    public readonly app: Express,
    public readonly container: Container,
    public readonly events: EventBus,
    public readonly hooks: HookManager,
    public readonly lifecycle: LifecycleManager,
    public readonly modules: ModuleManager,
    public readonly plugins: PluginManager,
    public readonly logger: Logger
  ) {}

  useExtension(extension: (kernel: IKernel) => void): void {
    this.logger.info("Executing Kernel extension...");
    extension(this);
  }

  getDiagnostics(): KernelDiagnostics {
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: env.NODE_ENV,
      state: this.lifecycle.getState(),
      modules: this.modules.getDiagnostics(),
      plugins: this.plugins.getDiagnostics(),
    };
  }
}
