import type { Container } from "../container/index.js";
import type { EventBus } from "../events/index.js";
import type { HookManager } from "../hooks/index.js";
import type { LifecycleManager } from "../lifecycle/index.js";
import type { ModuleManager, ModuleDiagnostics } from "../modules/index.js";
import type { PluginManager, PluginDiagnostics } from "../plugins/index.js";
import type { Logger } from "pino";

export interface KernelDiagnostics {
  uptime: number;
  environment: string;
  state: string;
  modules: ModuleDiagnostics[];
  plugins: PluginDiagnostics[];
}

export interface IKernel {
  readonly container: Container;
  readonly events: EventBus;
  readonly hooks: HookManager;
  readonly lifecycle: LifecycleManager;
  readonly modules: ModuleManager;
  readonly plugins: PluginManager;
  readonly logger: Logger;

  useExtension(extension: (kernel: IKernel) => void): void;
  getDiagnostics(): KernelDiagnostics;
}