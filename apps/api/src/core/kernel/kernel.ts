import type { Container } from "../container/index.js";
import type { EventBus } from "../events/index.js";
import type { HookManager } from "../hooks/index.js";
import type { LifecycleManager } from "../lifecycle/index.js";
import type { ModuleManager } from "../modules/index.js";
import type { PluginManager } from "../plugins/index.js";
import type { Logger } from "pino";
import { env } from "../config/env.js";

import type { IKernel, KernelDiagnostics } from "./kernel.interface.js";

export class Kernel implements IKernel {
  private readonly startTime = Date.now();

  constructor(
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
