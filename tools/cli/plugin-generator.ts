import fs from "node:fs/promises";
import path from "node:path";

export async function generatePlugin(pluginName: string, targetDir = "./src/plugins"): Promise<string> {
  const kebabName = pluginName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const pascalName = kebabName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  const pluginPath = path.join(targetDir, kebabName);
  await fs.mkdir(pluginPath, { recursive: true });

  const indexTs = `import type { IPlugin } from "../../core/plugins/plugin.interface.js";
import type { Container } from "../../core/container/index.js";

export class ${pascalName}Plugin implements IPlugin {
  readonly name = "${kebabName}";
  readonly version = "1.0.0";
  readonly description = "${pascalName} plugin";

  register(container: Container): void {
    // Register services into container
  }

  async boot(): Promise<void> {
    // Plugin boot routines
  }

  async shutdown(): Promise<void> {
    // Plugin shutdown routines
  }
}
`;

  await fs.writeFile(path.join(pluginPath, "index.ts"), indexTs);
  return pluginPath;
}
