/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "node:path";
import { BaseGenerator } from "./base/base.generator.js";
import { PathResolver } from "./base/path.resolver.js";
import { FileSystem } from "./base/filesystem.js";
import { toPascalCase, toCamelCase, toKebabCase } from "./utils.js";
import type { GeneratedServerPlan } from "../../core/ai/ai-builder.service.js";

/**
 * AIModuleGenerator
 *
 * Extends the ONBP generator framework to scaffold domain-specific modules
 * from an AI-generated `GeneratedServerPlan`. Unlike `ModuleGenerator` which
 * uses generic CRUD templates, this generator enriches the context with:
 *
 *  - Domain-specific route handlers (POST /tasks, GET /schedule, etc.)
 *  - Service method stubs matching each route
 *  - Module description from the AI plan
 *  - Enabled-capability comment banner
 *
 * Files generated per module:
 *   index.ts          — barrel export
 *   module.ts         — IModule implementation (AI template)
 *   <name>.router.ts  — Express Router with domain routes (AI template)
 *   <name>.service.ts — Service with domain method stubs (AI template)
 *   <name>.repository.ts — Generic repository
 *   <name>.schema.ts  — Drizzle schema (uses base template)
 *   <name>.types.ts   — TypeScript types
 *   <name>.events.ts  — Event constants
 *   <name>.validation.ts — Zod validation
 *   README.md         — AI-authored module README
 */
export class AIModuleGenerator extends BaseGenerator {
  static async generateFromPlan(plan: GeneratedServerPlan): Promise<void> {
    const generator = new AIModuleGenerator();
    await generator.generateFromPlan(plan);
  }

  async generate(_name: string, _options?: Record<string, any>): Promise<void> {
    throw new Error("Use generateFromPlan(plan) for AI-generated modules.");
  }

  async generateFromPlan(plan: GeneratedServerPlan): Promise<void> {
    const normalizedName = toKebabCase(plan.moduleName);
    const pascalName = toPascalCase(plan.moduleName);
    const camelName = toCamelCase(plan.moduleName);
    const upperName = normalizedName.toUpperCase().replace(/-/g, "_");

    const modulesDir = PathResolver.getModulesDir();
    const moduleDir = join(modulesDir, normalizedName);

    if (await FileSystem.exists(moduleDir)) {
      throw new Error(
        `Module directory already exists: ${moduleDir}\n` +
        `Use a different name or delete the existing module first.`
      );
    }

    // ── Build enriched context ───────────────────────────────────────────────
    const enabledCapabilities = this.buildEnabledCapabilitiesList(plan);
    const routeHandlers = this.buildRouteHandlers(plan);
    const serviceMethods = this.buildServiceMethods(plan);
    const readmeRouteTable = this.buildReadmeRouteTable(plan);

    const context: Record<string, string> = {
      name: normalizedName,
      normalizedName,
      pascalName,
      camelName,
      upperName,
      description: plan.description,
      enabledCapabilities,
      routeHandlers,
      serviceMethods,
      readmeRouteTable,
    };

    // ── Render and write all files ────────────────────────────────────────────
    const filesToGenerate: Array<{ template: string; target: string }> = [
      { template: "module/index.ts.tpl",       target: join(moduleDir, "index.ts") },
      { template: "module/ai-module.ts.tpl",   target: join(moduleDir, "module.ts") },
      { template: "module/ai-router.ts.tpl",   target: join(moduleDir, `${normalizedName}.router.ts`) },
      { template: "module/ai-service.ts.tpl",  target: join(moduleDir, `${normalizedName}.service.ts`) },
      { template: "module/repository.ts.tpl",  target: join(moduleDir, `${normalizedName}.repository.ts`) },
      { template: "module/schema.ts.tpl",      target: join(moduleDir, `${normalizedName}.schema.ts`) },
      { template: "module/validation.ts.tpl",  target: join(moduleDir, `${normalizedName}.validation.ts`) },
      { template: "module/events.ts.tpl",      target: join(moduleDir, `${normalizedName}.events.ts`) },
      { template: "module/types.ts.tpl",       target: join(moduleDir, `${normalizedName}.types.ts`) },
      { template: "module/ai-readme.md.tpl",   target: join(moduleDir, "README.md") },
    ];

    for (const item of filesToGenerate) {
      const renderedContent = await this.renderTemplate(item.template, context);
      await FileSystem.safeWriteFile(item.target, renderedContent, false);
    }

    // ── Print summary ─────────────────────────────────────────────────────────
    // eslint-disable-next-line no-console
    console.log(`\n✓ AI Module "${normalizedName}" successfully scaffolded!\n`);
    // eslint-disable-next-line no-console
    console.log("Generated files:");
    for (const item of filesToGenerate) {
      const relativePath = item.target.substring(item.target.indexOf("src/modules/"));
      // eslint-disable-next-line no-console
      console.log(`  - ${relativePath}`);
    }
    // eslint-disable-next-line no-console
    console.log(`\n📡 ${plan.routes.length} domain-specific route(s) scaffolded.`);
    // eslint-disable-next-line no-console
    console.log(`⚡ Register the module in apps/api/src/bootstrap/register-modules.ts to activate it.`);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private buildEnabledCapabilitiesList(plan: GeneratedServerPlan): string {
    const caps: string[] = [];
    if (plan.recommendations.auth.enabled)     caps.push("Auth");
    if (plan.recommendations.rbac.enabled)     caps.push("RBAC");
    if (plan.recommendations.storage.enabled)  caps.push("Storage");
    if (plan.recommendations.database.enabled) caps.push("Database");
    if (plan.recommendations.ai.enabled)       caps.push("AI");
    if (plan.recommendations.email.enabled)    caps.push("Email");
    if (plan.recommendations.workflow.enabled) caps.push("Workflow");
    return caps.length > 0 ? caps.join(", ") : "Database";
  }

  private buildRouteHandlers(plan: GeneratedServerPlan): string {
    return plan.routes
      .map((route: { method: string; path: string; description: string }) => {
        let method = route.method.toUpperCase().trim();
        if (method.includes("|") || !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method)) {
          method = "GET";
        }
        const path = route.path;
        const description = route.description;
        const methodName = this.routeToMethodName(method, path);
        const httpMethod = method.toLowerCase();

        let handlerBody: string;
        if (method === "POST") {
          handlerBody =
            `      const result = await service.${methodName}(req.body);\n` +
            `      createdResponse(res, { data: result, message: "${description}" });`;
        } else if (method === "DELETE") {
          handlerBody =
            `      const result = await service.${methodName}(req.params);\n` +
            `      successResponse(res, { data: result, message: "${description}" });`;
        } else {
          handlerBody =
            `      const result = await service.${methodName}(req.params, req.query);\n` +
            `      successResponse(res, { data: result, message: "${description}" });`;
        }

        return (
          `  // ${description}\n` +
          `  router.${httpMethod}(\n` +
          `    "${path}",\n` +
          `    asyncHandler(async (req: Request, res: Response) => {\n` +
          `${handlerBody}\n` +
          `    })\n` +
          `  );\n`
        );
      })
      .join("\n");
  }

  private buildServiceMethods(plan: GeneratedServerPlan): string {
    const methods = new Map<string, string>();
    for (const route of plan.routes as Array<{ method: string; path: string; description: string }>) {
      const methodName = this.routeToMethodName(route.method.toUpperCase(), route.path);
      if (methods.has(methodName)) continue;

      const paramType = route.method.toUpperCase() === "POST" ? "_data: Record<string, unknown>" : "_params?: Record<string, unknown>, _query?: Record<string, unknown>";
      methods.set(
        methodName,
        `  /** ${route.description} */\n` +
        `  async ${methodName}(${paramType}): Promise<unknown> {\n` +
        `    // TODO: Implement ${route.description}\n` +
        `    return {};\n` +
        `  }\n`
      );
    }
    return Array.from(methods.values()).join("\n");
  }

  private buildReadmeRouteTable(plan: GeneratedServerPlan): string {
    const header = "| Method | Path | Description |\n|--------|------|-------------|";
    const rows = (plan.routes as Array<{ method: string; path: string; description: string }>)
      .map((r) => `| \`${r.method.toUpperCase()}\` | \`/api/v1/${plan.moduleName}${r.path}\` | ${r.description} |`)
      .join("\n");
    return `${header}\n${rows}`;
  }

  /**
   * Converts a route method + path combination into a camelCase service method name.
   * Examples:
   *   GET    /tasks          → findAllTasks
   *   POST   /tasks          → createTask
   *   GET    /tasks/:id      → findTaskById
   *   PUT    /tasks/:id      → updateTask
   *   DELETE /tasks/:id      → deleteTask
   *   POST   /sessions/start → startSession
   *   GET    /reports/weekly → getWeeklyReport
   */
  private routeToMethodName(method: string, path: string): string {
    // Remove leading slash, split into segments, strip :param markers
    // Also camelCase any hyphenated segments (e.g. "email-notifications" → "emailNotifications")
    const segments = path
      .replace(/^\//, "")
      .split("/")
      .filter((s) => s && !s.startsWith(":"))
      .map(camelizeSegment);

    if (segments.length === 0) {
      const prefixMap: Record<string, string> = {
        GET: "findAll", POST: "create", PUT: "updateAll", DELETE: "deleteAll", PATCH: "patchAll",
      };
      return prefixMap[method] ?? "handle";
    }

    const hasIdParam = path.includes(":id") || path.includes(":") ;
    const last = segments[segments.length - 1];

    // Common last-segment verbs (e.g. /sessions/start → startSession)
    const verbMap: Record<string, string> = {
      start: "start", stop: "stop", pause: "pause", resume: "resume",
      approve: "approve", reject: "reject", publish: "publish",
      submit: "submit", confirm: "confirm", cancel: "cancel",
      archive: "archive", restore: "restore", export: "export",
      import: "import", sync: "sync", reset: "reset",
    };

    if (verbMap[last] && segments.length > 1) {
      const noun = segments.slice(0, -1).map((s, i) => i === 0 ? s : capitalize(s)).join("");
      return `${verbMap[last]}${capitalize(noun)}`;
    }

    // Standard CRUD based on method
    const noun = segments.map((s, i) => (i === 0 ? s : capitalize(s))).join("");
    if (method === "GET"    && !hasIdParam) return `findAll${capitalize(noun)}`;
    if (method === "GET"    &&  hasIdParam) return `find${capitalize(last)}ById`;
    if (method === "POST")                  return `create${capitalize(last)}`;
    if (method === "PUT"    ||  method === "PATCH") return `update${capitalize(last)}`;
    if (method === "DELETE")                return `delete${capitalize(last)}`;

    return `handle${capitalize(noun)}`;
  }
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

/** Converts a kebab-case path segment to camelCase: "email-notifications" → "emailNotifications" */
function camelizeSegment(s: string): string {
  return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
