import { join } from "node:path";
import { BaseGenerator } from "./base/base.generator.js";
import { PathResolver } from "./base/path.resolver.js";
import { FileSystem } from "./base/filesystem.js";

export class ProviderGenerator extends BaseGenerator {
  /**
   * Static helper for backward compatibility with the CLI call
   */
  static async generate(name: string): Promise<void> {
    const generator = new ProviderGenerator();
    await generator.generate(name);
  }

  /**
   * Core generation logic using the Generator Framework
   */
  async generate(name: string, _options?: Record<string, any>): Promise<void> {
    if (!name) {
      throw new Error("Provider name is required");
    }

    const context = this.getContext(name);
    const normalizedName = context.normalizedName;

    const providersDir = PathResolver.getProvidersDir();
    const providerDir = join(providersDir, normalizedName);

    // Overwrite check
    if (await FileSystem.exists(providerDir)) {
      throw new Error(`Provider directory already exists: ${providerDir}`);
    }

    const filesToGenerate = [
      { template: "provider/index.ts.tpl", target: join(providerDir, "index.ts") },
      { template: "provider/provider.ts.tpl", target: join(providerDir, "provider.ts") },
      { template: "provider/config.ts.tpl", target: join(providerDir, "config.ts") },
      { template: "provider/constants.ts.tpl", target: join(providerDir, "constants.ts") },
      { template: "provider/types.ts.tpl", target: join(providerDir, "types.ts") },
      { template: "provider/README.md.tpl", target: join(providerDir, "README.md") },
    ];

    for (const item of filesToGenerate) {
      const renderedContent = await this.renderTemplate(item.template, context);
      await FileSystem.safeWriteFile(item.target, renderedContent, false);
    }

    console.log(`\n✓ Provider "${normalizedName}" successfully generated!\n`);
    console.log("Generated files:");
    for (const item of filesToGenerate) {
      const relativePath = item.target.substring(item.target.indexOf("src/providers/"));
      console.log(`  - ${relativePath}`);
    }
  }
}
