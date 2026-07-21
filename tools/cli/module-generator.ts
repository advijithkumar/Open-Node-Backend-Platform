import fs from "node:fs/promises";
import path from "node:path";

export async function generateModule(moduleName: string, targetDir = "./src/modules"): Promise<string> {
  const kebabName = moduleName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const pascalName = kebabName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  const modulePath = path.join(targetDir, kebabName);
  await fs.mkdir(modulePath, { recursive: true });

  const moduleTs = `import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";

export class ${pascalName}Module implements IModule {
  readonly name = "${kebabName}";
  readonly version = "1.0.0";
  readonly description = "${pascalName} module";

  routes?: Router;

  register(kernel: Kernel): void {
    kernel.logger.info("Registering ${pascalName} Module...");
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("${pascalName} Module booted");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("${pascalName} Module shutdown");
  }
}
`;

  const indexTs = `export * from "./module.js";\n`;

  await fs.writeFile(path.join(modulePath, "module.ts"), moduleTs);
  await fs.writeFile(path.join(modulePath, "index.ts"), indexTs);

  return modulePath;
}
