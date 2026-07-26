import type { IGenerator } from "./generator.interface.js";
import { toPascalCase, toCamelCase, toKebabCase } from "../utils.js";
import { FileSystem } from "./filesystem.js";
import { PathResolver } from "./path.resolver.js";
import { TemplateEngine } from "./template.engine.js";

export abstract class BaseGenerator implements IGenerator {
  abstract generate(name: string, options?: Record<string, any>): Promise<void>;

  /**
   * Generates case-converted names for templates.
   */
  protected getContext(name: string): Record<string, string> {
    const normalizedName = toKebabCase(name);
    return {
      name: normalizedName,
      normalizedName,
      pascalName: toPascalCase(name),
      camelName: toCamelCase(name),
      upperName: normalizedName.toUpperCase().replace(/-/g, "_"),
    };
  }

  /**
   * Loads and renders a template from the template directory.
   */
  protected async renderTemplate(
    templateRelativePath: string,
    context: Record<string, string>
  ): Promise<string> {
    const templatesDir = PathResolver.getTemplatesDir();
    const templatePath = joinPaths(templatesDir, templateRelativePath);
    const rawTemplate = await FileSystem.readFile(templatePath);
    return TemplateEngine.render(rawTemplate, context);
  }
}

// Minimal utility function to combine paths (avoids path importing directly if not needed, or we can use join from node:path)
import { join as joinPaths } from "node:path";
