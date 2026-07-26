import { join } from "node:path";
import { BaseGenerator } from "./base/base.generator.js";
import { PathResolver } from "./base/path.resolver.js";
import { FileSystem } from "./base/filesystem.js";

export class AppGenerator extends BaseGenerator {
  /**
   * Static helper for backward compatibility with the CLI call
   */
  static async generate(name: string): Promise<void> {
    const generator = new AppGenerator();
    await generator.generate(name);
  }

  /**
   * Core generation logic using the Generator Framework
   */
  async generate(name: string, _options?: Record<string, any>): Promise<void> {
    if (!name) {
      throw new Error("Application name is required");
    }

    const context = this.getContext(name);
    const normalizedName = context.normalizedName;

    const appsDir = PathResolver.getAppsDir();
    const appDir = join(appsDir, normalizedName);

    // Overwrite check
    if (await FileSystem.exists(appDir)) {
      throw new Error(`Application directory already exists: ${appDir}`);
    }

    const filesToGenerate = [
      { template: "app/src/app.ts.tpl", target: join(appDir, "src/app.ts") },
      { template: "app/src/server.ts.tpl", target: join(appDir, "src/server.ts") },
      { template: "app/src/bootstrap.ts.tpl", target: join(appDir, "src/bootstrap.ts") },
      { template: "app/package.json.tpl", target: join(appDir, "package.json") },
      { template: "app/tsconfig.json.tpl", target: join(appDir, "tsconfig.json") },
      { template: "app/.env.example.tpl", target: join(appDir, ".env.example") },
      { template: "app/README.md.tpl", target: join(appDir, "README.md") },
    ];

    for (const item of filesToGenerate) {
      const renderedContent = await this.renderTemplate(item.template, context);
      await FileSystem.safeWriteFile(item.target, renderedContent, false);
    }

    // Create empty directories ready for development
    await FileSystem.mkdir(join(appDir, "src/modules"));
    await FileSystem.mkdir(join(appDir, "src/plugins"));
    await FileSystem.mkdir(join(appDir, "src/providers"));
    await FileSystem.mkdir(join(appDir, "src/config"));
    await FileSystem.mkdir(join(appDir, "docker"));

    console.log(`\n✓ Application "${normalizedName}" successfully generated!\n`);
    console.log("Generated files:");
    for (const item of filesToGenerate) {
      const relativePath = item.target.substring(item.target.indexOf("apps/"));
      console.log(`  - ${relativePath}`);
    }
    console.log("Created empty development directories:");
    console.log(`  - apps/${normalizedName}/src/modules/`);
    console.log(`  - apps/${normalizedName}/src/plugins/`);
    console.log(`  - apps/${normalizedName}/src/providers/`);
    console.log(`  - apps/${normalizedName}/src/config/`);
    console.log(`  - apps/${normalizedName}/docker/`);
  }
}
