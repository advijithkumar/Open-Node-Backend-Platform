import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Container } from "../container/index.js";
import { PLUGIN_SERVICES } from "./plugin.constants.js";
import type { IPlugin } from "./plugin.interface.js";
import { logger } from "../logger/logger.js";

export interface FailedPluginInfo {
  name: string;
  error: string;
}

export class PluginLoader {
  static readonly failedPlugins: FailedPluginInfo[] = [];

  static async loadAll(containerInstance: Container): Promise<void> {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const pluginsDir = join(currentDir, "../../plugins");

    try {
      await fs.access(pluginsDir);
    } catch {
      logger.info("No plugins directory found, skipping auto-discovery.");
      return;
    }

    const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
    const pluginDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const pluginMgr = containerInstance.resolve<any>(PLUGIN_SERVICES.REGISTRY);

    for (const name of pluginDirs) {
      try {
        let pluginPath = join(pluginsDir, name, "index.js");
        let exists = false;

        try {
          await fs.access(pluginPath);
          exists = true;
        } catch {
          try {
            const tsPath = join(pluginsDir, name, "index.ts");
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

        const module = await import(`file://${pluginPath}`);
        const pluginInstance = (module.plugin || module.default) as IPlugin;

        if (!pluginInstance || typeof pluginInstance !== "object" || typeof pluginInstance.name !== "string" || typeof pluginInstance.version !== "string") {
          throw new Error(`Plugin in directory "${name}" does not export a valid IPlugin instance.`);
        }

        await pluginMgr.register(pluginInstance);
        logger.info(`✓ Plugin "${pluginInstance.name}" automatically loaded.`);
      } catch (err: any) {
        logger.error(`❌ Failed to load plugin from directory "${name}": ${err.message}`);
        this.failedPlugins.push({ name, error: err.message });
      }
    }
  }
}
