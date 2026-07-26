import { join } from "node:path";
import { BaseGenerator } from "./base/base.generator.js";
import { PathResolver } from "./base/path.resolver.js";
import { FileSystem } from "./base/filesystem.js";

export class PluginGenerator extends BaseGenerator {
  /**
   * Static helper for backward compatibility with the CLI call
   */
  static async generate(name: string): Promise<void> {
    const generator = new PluginGenerator();
    await generator.generate(name);
  }

  /**
   * Core generation logic using the Generator Framework
   */
  async generate(name: string, _options?: Record<string, any>): Promise<void> {
    if (!name) {
      throw new Error("Plugin name is required");
    }

    const context = this.getContext(name);
    const normalizedName = context.normalizedName;

    const pluginsDir = PathResolver.getPluginsDir();
    const pluginDir = join(pluginsDir, normalizedName);

    // Overwrite check
    if (await FileSystem.exists(pluginDir)) {
      throw new Error(`Plugin directory already exists: ${pluginDir}`);
    }

    const filesToGenerate = [
      { template: "plugin/index.ts.tpl", target: join(pluginDir, "index.ts") },
      { template: "plugin/plugin.ts.tpl", target: join(pluginDir, "plugin.ts") },
      { template: "plugin/provider.ts.tpl", target: join(pluginDir, "provider.ts") },
      { template: "plugin/config.ts.tpl", target: join(pluginDir, "config.ts") },
      { template: "plugin/constants.ts.tpl", target: join(pluginDir, "constants.ts") },
      { template: "plugin/types.ts.tpl", target: join(pluginDir, "types.ts") },
      { template: "plugin/README.md.tpl", target: join(pluginDir, "README.md") },
    ];

    for (const item of filesToGenerate) {
      const renderedContent = await this.renderTemplate(item.template, context);
      await FileSystem.safeWriteFile(item.target, renderedContent, false);
    }

    console.log(`\n✓ Plugin "${normalizedName}" successfully generated!\n`);
    console.log("Generated files:");
    for (const item of filesToGenerate) {
      const relativePath = item.target.substring(item.target.indexOf("src/plugins/"));
      console.log(`  - ${relativePath}`);
    }
  }
}
