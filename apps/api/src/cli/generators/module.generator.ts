import { join } from "node:path";
import { BaseGenerator } from "./base/base.generator.js";
import { PathResolver } from "./base/path.resolver.js";
import { FileSystem } from "./base/filesystem.js";

export class ModuleGenerator extends BaseGenerator {
  /**
   * Static helper for backward compatibility with the CLI call
   */
  static async generate(name: string): Promise<void> {
    const generator = new ModuleGenerator();
    await generator.generate(name);
  }

  /**
   * Core generation logic using the Generator Framework
   */
  async generate(name: string, _options?: Record<string, any>): Promise<void> {
    if (!name) {
      throw new Error("Module name is required");
    }

    const context = this.getContext(name);
    const normalizedName = context.normalizedName;

    const modulesDir = PathResolver.getModulesDir();
    const moduleDir = join(modulesDir, normalizedName);

    // Overwrite check
    if (await FileSystem.exists(moduleDir)) {
      throw new Error(`Module directory already exists: ${moduleDir}`);
    }

    const filesToGenerate = [
      { template: "module/index.ts.tpl", target: join(moduleDir, "index.ts") },
      { template: "module/module.ts.tpl", target: join(moduleDir, "module.ts") },
      { template: "module/router.ts.tpl", target: join(moduleDir, `${normalizedName}.router.ts`) },
      { template: "module/service.ts.tpl", target: join(moduleDir, `${normalizedName}.service.ts`) },
      { template: "module/repository.ts.tpl", target: join(moduleDir, `${normalizedName}.repository.ts`) },
      { template: "module/schema.ts.tpl", target: join(moduleDir, `${normalizedName}.schema.ts`) },
      { template: "module/validation.ts.tpl", target: join(moduleDir, `${normalizedName}.validation.ts`) },
      { template: "module/events.ts.tpl", target: join(moduleDir, `${normalizedName}.events.ts`) },
      { template: "module/types.ts.tpl", target: join(moduleDir, `${normalizedName}.types.ts`) },
      { template: "module/README.md.tpl", target: join(moduleDir, "README.md") },
    ];

    for (const item of filesToGenerate) {
      const renderedContent = await this.renderTemplate(item.template, context);
      await FileSystem.safeWriteFile(item.target, renderedContent, false);
    }

    console.log(`\n✓ Module "${normalizedName}" successfully generated!\n`);
    console.log("Generated files:");
    for (const item of filesToGenerate) {
      const relativePath = item.target.substring(item.target.indexOf("src/modules/"));
      console.log(`  - ${relativePath}`);
    }
  }
}
