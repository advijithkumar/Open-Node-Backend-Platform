import type { Kernel } from "../kernel/index.js";
import type { IModule } from "./module.interface.js";

export interface ModuleDiagnostics {
  name: string;
  version: string;
  enabled: boolean;
  dependencies: string[];
  hasRoutes: boolean;
}

export class ModuleManager {
  private readonly modules = new Map<string, IModule>();
  private readonly disabledModules = new Set<string>();

  register(module: IModule): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module "${module.name}" is already registered.`);
    }
    this.modules.set(module.name, module);
  }

  async load(module: IModule, kernel: Kernel): Promise<void> {
    this.register(module);
    await module.register?.(kernel);
    await module.boot?.(kernel);
  }

  async loadAll(kernel: Kernel): Promise<void> {
    const sortedModules = this.getTopologicallySortedModules();

    for (const mod of sortedModules) {
      if (this.disabledModules.has(mod.name)) {
        kernel.logger.info(`Skipping disabled module: ${mod.name}`);
        continue;
      }
      await mod.register?.(kernel);
    }

    for (const mod of sortedModules) {
      if (this.disabledModules.has(mod.name)) continue;
      await mod.boot?.(kernel);
      kernel.logger.info(`Module loaded successfully: ${mod.name} v${mod.version}`);
    }
  }

  disable(name: string): void {
    this.disabledModules.add(name);
  }

  enable(name: string): void {
    this.disabledModules.delete(name);
  }

  async shutdownAll(kernel: Kernel): Promise<void> {
    const sortedModules = this.getTopologicallySortedModules().reverse();
    for (const module of sortedModules) {
      if (this.disabledModules.has(module.name)) continue;
      await module.shutdown?.(kernel);
    }
  }

  getTopologicallySortedModules(): IModule[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: IModule[] = [];

    const visit = (name: string) => {
      if (temp.has(name)) {
        throw new Error(`Circular module dependency detected involving "${name}"`);
      }
      if (!visited.has(name)) {
        temp.add(name);
        const mod = this.modules.get(name);
        if (mod && mod.dependencies) {
          for (const dep of mod.dependencies) {
            if (!this.modules.has(dep)) {
              throw new Error(`Missing module dependency: "${dep}" required by "${name}"`);
            }
            visit(dep);
          }
        }
        temp.delete(name);
        visited.add(name);
        if (mod) order.push(mod);
      }
    };

    for (const name of this.modules.keys()) {
      if (!visited.has(name)) {
        visit(name);
      }
    }

    return order;
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  get(name: string): IModule | undefined {
    return this.modules.get(name);
  }

  getAll(): IModule[] {
    return [...this.modules.values()];
  }

  getDiagnostics(): ModuleDiagnostics[] {
    return Array.from(this.modules.values()).map((m) => ({
      name: m.name,
      version: m.version,
      enabled: !this.disabledModules.has(m.name),
      dependencies: m.dependencies ?? [],
      hasRoutes: Boolean(m.routes),
    }));
  }
}