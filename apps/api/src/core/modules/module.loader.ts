import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Container } from "../container/index.js";
import { MODULE_SERVICES } from "./module.constants.js";
import type { IModule } from "./module.interface.js";
import { logger } from "../logger/logger.js";

export interface FailedModuleInfo {
  name: string;
  error: string;
}

export class ModuleLoader {
  static readonly failedModules: FailedModuleInfo[] = [];

  static async loadAll(containerInstance: Container): Promise<void> {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const modulesDir = join(currentDir, "../../modules");

    try {
      await fs.access(modulesDir);
    } catch {
      logger.info("No modules directory found, skipping auto-discovery.");
      return;
    }

    const entries = await fs.readdir(modulesDir, { withFileTypes: true });
    const moduleDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const moduleMgr = containerInstance.resolve<any>(MODULE_SERVICES.REGISTRY);

    for (const name of moduleDirs) {
      try {
        let pluginPath = join(modulesDir, name, "index.js");
        let exists = false;

        try {
          await fs.access(pluginPath);
          exists = true;
        } catch {
          try {
            const tsPath = join(modulesDir, name, "index.ts");
            await fs.access(tsPath);
            pluginPath = tsPath;
            exists = true;
          } catch {
            // Ignore
          }
        }

        if (!exists) {
          continue;
        }

        const mod = await import(`file://${pluginPath}`);
        
        let moduleInstance: IModule | null = null;
        const exportKeys = Object.keys(mod);
        const moduleKey = exportKeys.find((k) => k.endsWith("Module"));

        if (moduleKey && typeof mod[moduleKey] === "function") {
          const ModuleClass = mod[moduleKey];
          moduleInstance = new ModuleClass();
        } else if (mod.default && typeof mod.default === "function" && mod.default.name.endsWith("Module")) {
          const ModuleClass = mod.default;
          moduleInstance = new ModuleClass();
        } else {
          moduleInstance = mod.module || mod.default;
        }

        if (!moduleInstance || typeof moduleInstance !== "object" || typeof moduleInstance.name !== "string" || typeof moduleInstance.version !== "string") {
          throw new Error(`Module in directory "${name}" does not export a valid IModule instance.`);
        }

        await moduleMgr.register(moduleInstance);
        logger.info(`✓ Module "${moduleInstance.name}" automatically loaded.`);
      } catch (err: any) {
        logger.error(`❌ Failed to load module from directory "${name}": ${err.message}`);
        this.failedModules.push({ name, error: err.message });
      }
    }
  }
}
