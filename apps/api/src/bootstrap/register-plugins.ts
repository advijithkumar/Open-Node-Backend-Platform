import { logger } from "../core/logger/logger.js";
import { PluginLoader } from "../core/plugins/plugin.loader.js";
import { container } from "../core/container/container.js";

export async function registerPlugins(): Promise<void> {
  logger.info("Registering Plugins...");
  await PluginLoader.loadAll(container);
}