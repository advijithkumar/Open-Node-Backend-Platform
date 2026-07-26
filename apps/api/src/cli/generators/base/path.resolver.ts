import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export class PathResolver {
  private static getSourceDir(): string {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    // PathResolver is at src/cli/generators/base/path.resolver.ts
    // src dir is 3 levels up
    return join(currentDir, "../../..");
  }

  static getModulesDir(): string {
    return join(this.getSourceDir(), "modules");
  }

  static getPluginsDir(): string {
    return join(this.getSourceDir(), "plugins");
  }

  static getProvidersDir(): string {
    return join(this.getSourceDir(), "providers");
  }

  static getAppsDir(): string {
    return join(this.getSourceDir(), "../../../apps");
  }

  static getTemplatesDir(): string {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    return join(currentDir, "../templates");
  }
}
