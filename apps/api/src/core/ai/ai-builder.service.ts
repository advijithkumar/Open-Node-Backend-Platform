/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IAIService } from "./ai.interface.js";
import { AIModuleGenerator } from "../../cli/generators/ai-module.generator.js";
import { AISessionMemoryManager } from "./ai-session-memory.js";

export interface AIBuilderOptions {
  name?: string;
  provider?: string;
  dryRun?: boolean;
  sessionId?: string;
}

export interface CapabilityRecommendation {
  enabled: boolean;
  reason: string;
}

export interface GeneratedServerPlan {
  moduleName: string;
  description: string;
  activeProvider?: string;
  activeModel?: string;
  routes: Array<{ method: string; path: string; description: string }>;
  services: string[];
  workflowName?: string;
  /** True when the LLM timed out or returned unparseable text — fallback CRUD plan was used */
  isFallback?: boolean;
  recommendations: {
    auth: CapabilityRecommendation;
    rbac: CapabilityRecommendation;
    storage: CapabilityRecommendation;
    database: CapabilityRecommendation;
    ai: CapabilityRecommendation;
    email: CapabilityRecommendation;
    workflow: CapabilityRecommendation;
  };
}

export class AIBuilderService {
  public readonly sessionMemory = new AISessionMemoryManager();

  constructor(private readonly aiService: IAIService) {}

  async buildServerFromPrompt(
    prompt: string,
    options: AIBuilderOptions = {}
  ): Promise<GeneratedServerPlan> {
    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt is required for AI Builder.");
    }

    if (options.provider) {
      this.aiService.setActiveProvider(options.provider);
    }

    const sessionId = options.sessionId || "default-builder-session";
    this.sessionMemory.addMessage(sessionId, "user", prompt);
    const historyText = this.sessionMemory.getFormattedHistory(sessionId);

    const systemContext = `
You are the ONBP (Open Node Backend Platform) AI Code Generator & Architecture Planner.
Given a developer requirement, produce a domain-tailored architectural plan for an ONBP backend server module using Node.js / TypeScript.

ONBP Framework Core Capabilities & Rules:
1. Authentication (Better Auth): Use authorizationService for user login & session verification.
2. RBAC & Privacy: Enable role/permission guards if private resource access is needed.
3. Object Storage (MinIO / S3): Use StorageService for image/file uploads. NEVER write direct fs code.
4. Relational Database: Use Database (PostgreSQL via Drizzle) for domain metadata tracking.
5. AI Capabilities: Use AIService for NLP, OCR, vision, or text analysis.
6. Email Alerts: Use EmailService for transactional notifications.
7. Workflows: Use WorkflowService to orchestrate multi-step business pipelines.

CRITICAL DOMAIN ANALYSIS INSTRUCTIONS:
- Read the user's prompt and identify the REAL domain (e.g., time management, photo storage, inventory, e-commerce).
- Generate module names and API routes that are 100% domain-specific:
  * "time management for students" -> moduleName: "student-schedule-manager", routes: POST /tasks, GET /schedule, POST /sessions/start, POST /sessions/stop, GET /reports/weekly, POST /milestones, GET /deadlines
  * "paint warehouse" -> moduleName: "paint-warehouse", routes: POST /items, GET /inventory/stock, POST /stock/adjust, GET /reorder-alerts
  * "photo management" -> moduleName: "photo-management", routes: POST /upload, GET /albums, GET /photos/:id/tags, DELETE /photos/:id
- Enable only the ONBP capabilities that the domain genuinely needs.
- NEVER use generic route names like /list, /process, /upload unless the domain specifically requires file uploads.

OUTPUT FORMAT RULES (CRITICAL):
- Respond with ONLY a raw JSON object. No markdown, no code fences, no explanation text before or after.
- Do NOT wrap in backticks or any code block markers.
- String values inside the JSON must NOT contain raw newlines — use \\n for line breaks inside routerCode and moduleCode.

JSON Schema:
{
  "moduleName": "kebab-case-domain-name",
  "description": "Detailed description of the domain business logic",
  "routes": [
    { "method": "GET|POST|PUT|DELETE", "path": "/domain-path", "description": "Domain-specific description" }
  ],
  "services": ["Database", "AuthorizationService", "EmailService"],
  "workflowName": "domain-specific-workflow-name",
  "recommendations": {
    "auth": { "enabled": true, "reason": "Why auth is needed for this domain" },
    "rbac": { "enabled": true, "reason": "Why RBAC is needed for this domain" },
    "storage": { "enabled": false, "reason": "Why storage is or is not needed" },
    "database": { "enabled": true, "reason": "Why database is needed" },
    "ai": { "enabled": false, "reason": "Why AI is or is not needed" },
    "email": { "enabled": true, "reason": "Why email is needed" },
    "workflow": { "enabled": true, "reason": "Why workflow is needed" }
  },
  "routerCode": "(omit this field — do not include)",
  "moduleCode": "(omit this field — do not include)"
}
`;

    const userPrompt = `Conversation History:\n${historyText}\n\nUser Prompt: "${prompt}"\nModule Name Override: ${options.name || "auto-detected"}`;

    const completion = await this.aiService.complete(
      `${systemContext}\n\n${userPrompt}`,
      { temperature: 0.2 }
    );

    this.sessionMemory.addMessage(sessionId, "assistant", completion.text);

    let plan: GeneratedServerPlan;
    try {
      // Find the first '{' and last '}' to extract JSON even if the LLM
      // puts prose, markdown fences, or explanation text before/after it
      const raw = completion.text;
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error("No JSON object found in LLM response");
      }
      const jsonString = raw.slice(firstBrace, lastBrace + 1);
      plan = JSON.parse(jsonString);

      // Sanitize module name: override if explicitly passed, or clean up LLM placeholder.
      // Also catch when LLM copies the schema example text verbatim.
      const PLACEHOLDER_PATTERNS = [
        "string", "kebab-case-domain-name", "domain-specific-workflow-name",
        "module-name", "your-module", "domain-path",
      ];
      const isPlaceholder = !plan.moduleName
        || PLACEHOLDER_PATTERNS.includes(plan.moduleName)
        || plan.moduleName.includes("(")
        || plan.moduleName.includes(" ");

      if (options.name) {
        plan.moduleName = options.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      } else if (isPlaceholder) {
        plan.moduleName = prompt.toLowerCase()
          .replace(/\b(build|a|an|server|for|the|in|of|at|by|and|or|with|to)\b/g, "")
          .trim()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || "server-module";
      }

      plan.activeProvider = options.provider || process.env.AI_PROVIDER || "nvidia";
      plan.activeModel = completion.model || process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct";

      // Ensure recommendations exist (LLM sometimes omits the block)
      if (!plan.recommendations) {
        plan.recommendations = {
          auth: { enabled: true, reason: "User session management & authentication" },
          rbac: { enabled: true, reason: "Role-based access control for protected resources" },
          storage: { enabled: false, reason: "File/object storage not required for this domain" },
          database: { enabled: true, reason: "PostgreSQL relational persistence via Drizzle ORM" },
          ai: { enabled: false, reason: "AI processing not required for this domain" },
          email: { enabled: true, reason: "Transactional email notifications" },
          workflow: { enabled: true, reason: "Business process orchestration workflow" },
        };
      }
    } catch {
      // Genuine fallback: LLM returned non-parseable plain text (mock provider or network error)
      const sanitizedName = (options.name || prompt.toLowerCase()
        .replace(/\b(build|a|an|server|for|the)\b/g, "")
        .trim()
        .replace(/[^a-z0-9]/g, "-"))
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "server-module";

      plan = {
        moduleName: sanitizedName,
        description: `ONBP server module for: "${prompt}"`,
        activeProvider: options.provider || process.env.AI_PROVIDER || "nvidia",
        activeModel: completion.model || process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct",
        isFallback: true,
        routes: [
          { method: "GET", path: "/items", description: `List ${sanitizedName} items` },
          { method: "POST", path: "/items", description: `Create a new ${sanitizedName} item` },
          { method: "GET", path: "/items/:id", description: `Get ${sanitizedName} item by ID` },
          { method: "PUT", path: "/items/:id", description: `Update ${sanitizedName} item by ID` },
          { method: "DELETE", path: "/items/:id", description: `Delete ${sanitizedName} item by ID` },
        ],
        services: ["Database", "AuthorizationService", "EmailService"],
        workflowName: `${sanitizedName}-workflow`,
        recommendations: {
          auth: { enabled: true, reason: "User session management & authentication" },
          rbac: { enabled: true, reason: "Role-based access control for protected resources" },
          storage: { enabled: false, reason: "File/object storage — enable if file uploads are needed" },
          database: { enabled: true, reason: "PostgreSQL relational persistence via Drizzle ORM" },
          ai: { enabled: false, reason: "AI processing — enable if vision/NLP features are needed" },
          email: { enabled: true, reason: "Transactional email notifications" },
          workflow: { enabled: true, reason: "Business process orchestration workflow" },
        },
      };
    }

    // Never write fallback generic CRUD plans to disk — require the user to retry
    if (!options.dryRun && plan.isFallback) {
      throw new Error(
        `AI provider timed out or returned an unparseable response.\n` +
        `The fallback generic plan cannot be written to disk — please retry:\n` +
        `  pnpm onbp ai:build "${prompt}" --provider nvidia --yes`
      );
    }

    if (!options.dryRun) {
      await AIModuleGenerator.generateFromPlan(plan);
    }

    return plan;
  }
}

export default AIBuilderService;
