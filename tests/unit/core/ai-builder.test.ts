/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { AIBuilderService } from "../../../apps/api/src/core/ai/ai-builder.service.js";

// ─── Shared test helpers ────────────────────────────────────────────────────

function makePlan(overrides: Record<string, any> = {}) {
  return {
    moduleName: "photo-management",
    description: "Photo management server module",
    routes: [
      { method: "POST", path: "/upload", description: "Upload image" },
      { method: "GET", path: "/albums", description: "List albums" },
    ],
    services: ["StorageService", "AuthorizationService"],
    workflowName: "photo-processing-workflow",
    recommendations: {
      auth: { enabled: true, reason: "Session management" },
      rbac: { enabled: true, reason: "Access control" },
      storage: { enabled: true, reason: "File uploads" },
      database: { enabled: true, reason: "Metadata storage" },
      ai: { enabled: false, reason: "Not needed" },
      email: { enabled: true, reason: "Notifications" },
      workflow: { enabled: true, reason: "Processing pipeline" },
    },
    routerCode: "// Router code",
    moduleCode: "// Module code",
    ...overrides,
  };
}

function makeMockAI(responseText: string, model = "meta/llama-3.2-11b-vision-instruct") {
  return {
    complete: vi.fn().mockResolvedValue({ text: responseText, model }),
    setActiveProvider: vi.fn(),
  };
}

// ─── Suite ──────────────────────────────────────────────────────────────────

describe("AIBuilderService Unit Tests", () => {

  // ── 1. Happy path: clean JSON response ────────────────────────────────────

  it("should parse clean JSON and return the LLM-driven plan", async () => {
    const mockAI = makeMockAI(JSON.stringify(makePlan()));
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a server for photo management", {
      dryRun: true,
      provider: "nvidia",
    });

    expect(mockAI.setActiveProvider).toHaveBeenCalledWith("nvidia");
    expect(mockAI.complete).toHaveBeenCalledWith(
      expect.stringContaining("ONBP Framework Core Capabilities"),
      expect.any(Object)
    );
    expect(plan.moduleName).toBe("photo-management");
    expect(plan.routes).toHaveLength(2);
    expect(plan.services).toEqual(expect.arrayContaining(["StorageService"]));
    expect(typeof plan.recommendations.storage.enabled).toBe("boolean");
    expect(plan.activeProvider).toBe("nvidia");
    expect(plan.activeModel).toBe("meta/llama-3.2-11b-vision-instruct");
  });

  // ── 2. Markdown fence: ```json ... ``` wrapper ────────────────────────────

  it("should extract JSON from ```json ... ``` markdown code fence", async () => {
    const fenced = "```json\n" + JSON.stringify(makePlan()) + "\n```";
    const mockAI = makeMockAI(fenced);
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a photo server", { dryRun: true });

    expect(plan.moduleName).toBe("photo-management");
    expect(plan.routes).toHaveLength(2);
  });

  // ── 3. Prose before JSON (the root bug) ───────────────────────────────────

  it("should extract JSON even when the LLM prepends explanation text", async () => {
    const withProse = "Here is the JSON response for your ONBP server plan:\n\n" +
      JSON.stringify(makePlan({
        moduleName: "isro-research-time-tracker",
        routes: [
          { method: "POST", path: "/tasks", description: "Create a task" },
          { method: "GET", path: "/schedules", description: "Get schedule" },
          { method: "POST", path: "/sessions/start", description: "Start session" },
        ],
      }));
    const mockAI = makeMockAI(withProse);
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt(
      "build a server for time management for research student in ISRO",
      { dryRun: true }
    );

    expect(plan.moduleName).toBe("isro-research-time-tracker");
    expect(plan.routes).toHaveLength(3);
    expect(plan.routes[0].path).toBe("/tasks");
    expect(plan.routes[2].path).toBe("/sessions/start");
  });

  // ── 4. Prose after JSON ───────────────────────────────────────────────────

  it("should extract JSON even when the LLM appends text after the closing brace", async () => {
    const withTrailing = JSON.stringify(makePlan()) +
      "\n\nNote: You can extend this module with additional endpoints as needed.";
    const mockAI = makeMockAI(withTrailing);
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a photo server", { dryRun: true });

    expect(plan.moduleName).toBe("photo-management");
    expect(plan.routes).toHaveLength(2);
  });

  // ── 5. Markdown fence + prose before and after ────────────────────────────

  it("should handle ```json fence with prose on both sides", async () => {
    const full = "Sure! Here is the plan:\n```json\n" +
      JSON.stringify(makePlan({ moduleName: "paint-warehouse" })) +
      "\n```\nLet me know if you need changes.";
    const mockAI = makeMockAI(full);
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a paint warehouse server", { dryRun: true });

    expect(plan.moduleName).toBe("paint-warehouse");
  });

  // ── 6. Domain-specific routes are preserved from LLM ─────────────────────

  it("should preserve all domain-specific routes returned by the LLM", async () => {
    const isroPlan = makePlan({
      moduleName: "isro-research-time-tracker",
      routes: [
        { method: "POST", path: "/tasks", description: "Create research task" },
        { method: "GET", path: "/schedules", description: "Get weekly schedule" },
        { method: "POST", path: "/sessions/start", description: "Start work session" },
        { method: "POST", path: "/sessions/stop", description: "Stop work session" },
        { method: "GET", path: "/reports/weekly", description: "Weekly productivity report" },
        { method: "POST", path: "/milestones", description: "Set research milestone" },
        { method: "GET", path: "/deadlines", description: "Upcoming deadlines" },
      ],
      recommendations: {
        auth: { enabled: true, reason: "ISRO students need auth" },
        rbac: { enabled: false, reason: "Individual use only" },
        storage: { enabled: false, reason: "No file uploads" },
        database: { enabled: true, reason: "Persist tasks and sessions" },
        ai: { enabled: false, reason: "No NLP needed" },
        email: { enabled: true, reason: "Deadline reminders" },
        workflow: { enabled: true, reason: "Time tracking orchestration" },
      },
    });
    const mockAI = makeMockAI(JSON.stringify(isroPlan));
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt(
      "build a server for time management for research student in ISRO",
      { dryRun: true }
    );

    expect(plan.routes).toHaveLength(7);
    expect(plan.routes.map((r: any) => r.path)).toContain("/sessions/start");
    expect(plan.routes.map((r: any) => r.path)).toContain("/reports/weekly");
    expect(plan.recommendations.rbac.enabled).toBe(false);
    expect(plan.recommendations.storage.enabled).toBe(false);
  });

  // ── 7. Recommendations filled if LLM omits the block ─────────────────────

  it("should insert default recommendations if the LLM omits the recommendations block", async () => {
    const noRec = makePlan();
    delete (noRec as any).recommendations;
    const mockAI = makeMockAI(JSON.stringify(noRec));
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a photo server", { dryRun: true });

    expect(plan.recommendations).toBeDefined();
    expect(typeof plan.recommendations.auth.enabled).toBe("boolean");
    expect(typeof plan.recommendations.database.enabled).toBe("boolean");
  });

  // ── 8. Module name override via options.name ──────────────────────────────

  it("should override the LLM module name when options.name is provided", async () => {
    const mockAI = makeMockAI(JSON.stringify(makePlan({ moduleName: "wrong-name" })));
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a server", {
      dryRun: true,
      name: "My Custom Module Name!",
    });

    expect(plan.moduleName).toBe("my-custom-module-name");
  });

  // ── 9. Module name sanitized when LLM returns placeholder ────────────────

  it("should sanitize module name when LLM returns 'string' placeholder", async () => {
    const mockAI = makeMockAI(JSON.stringify(makePlan({ moduleName: "string" })));
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt(
      "build a server for paint warehouse inventory",
      { dryRun: true }
    );

    // Stop words (build, a, server, for, in, of) stripped → "paint-warehouse-inventory"
    expect(plan.moduleName).not.toBe("string");
    expect(plan.moduleName).toContain("paint");
  });

  // ── 10. Fallback: plain text response (no JSON at all) ───────────────────

  it("should use generic fallback plan when LLM returns plain text with no JSON", async () => {
    const mockAI = makeMockAI("I cannot generate a JSON plan right now.");
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("Build a Photo Management Server", { dryRun: true });

    expect(plan.moduleName).not.toBe("");
    expect(plan.routes.length).toBeGreaterThan(0);
    // Fallback routes should be generic CRUD, not domain-specific upload routes
    expect(plan.routes.some((r: any) => r.method === "GET")).toBe(true);
    expect(plan.routes.some((r: any) => r.method === "POST")).toBe(true);
  });

  // ── 11. activeProvider / activeModel always set ──────────────────────────

  it("should always set activeProvider and activeModel on the plan", async () => {
    const mockAI = makeMockAI(JSON.stringify(makePlan()), "meta/llama-3.1-8b-instruct");
    const builder = new AIBuilderService(mockAI as any);
    const plan = await builder.buildServerFromPrompt("build a server", {
      dryRun: true,
      provider: "openai",
    });

    expect(plan.activeProvider).toBe("openai");
    expect(plan.activeModel).toBe("meta/llama-3.1-8b-instruct");
  });
});
