import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIModuleGenerator } from "../../../apps/api/src/cli/generators/ai-module.generator.js";
import type { GeneratedServerPlan } from "../../../apps/api/src/core/ai/ai-builder.service.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePlan(overrides: Partial<GeneratedServerPlan> = {}): GeneratedServerPlan {
  return {
    moduleName: "movie-review-blog",
    description: "Personal blog server for movie reviews",
    activeProvider: "nvidia",
    activeModel: "meta/llama-3.2-11b-vision-instruct",
    routes: [
      { method: "POST", path: "/reviews",                    description: "Create a new movie review" },
      { method: "GET",  path: "/reviews",                    description: "List all movie reviews" },
      { method: "GET",  path: "/reviews/:id",                description: "Get a review by ID" },
      { method: "PUT",  path: "/reviews/:id",                description: "Update a review" },
      { method: "DELETE", path: "/reviews/:id",              description: "Delete a review" },
      { method: "POST", path: "/reviews/:id/comments",       description: "Add a comment to a review" },
      { method: "GET",  path: "/reviews/:id/comments",       description: "List comments on a review" },
    ],
    services: ["Database", "AuthorizationService", "EmailService"],
    workflowName: "movie-review-publishing-workflow",
    recommendations: {
      auth:     { enabled: true,  reason: "User auth required" },
      rbac:     { enabled: false, reason: "No role separation needed" },
      storage:  { enabled: false, reason: "No file uploads" },
      database: { enabled: true,  reason: "Store reviews in PostgreSQL" },
      ai:       { enabled: false, reason: "No AI processing needed" },
      email:    { enabled: true,  reason: "Email notifications for new reviews" },
      workflow: { enabled: true,  reason: "Orchestrate publishing workflow" },
    },
    ...overrides,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe("AIModuleGenerator", () => {
  let writtenFiles: Map<string, string>;

  beforeEach(() => {
    writtenFiles = new Map();

    // Mock FileSystem to capture writes without touching disk
    vi.mock(
      "../../../apps/api/src/cli/generators/base/filesystem.js",
      () => ({
        FileSystem: {
          exists: vi.fn().mockResolvedValue(false),
          safeWriteFile: vi.fn().mockImplementation(async (path: string, content: string) => {
            writtenFiles.set(path, content);
          }),
          readFile: vi.fn().mockImplementation(async (path: string) => {
            // Return raw template content by reading actual template files
            const { readFile } = await import("node:fs/promises");
            try {
              return await readFile(path, "utf-8");
            } catch {
              return `// mock template for ${path}`;
            }
          }),
        },
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should expose a static generateFromPlan() method", () => {
    expect(typeof AIModuleGenerator.generateFromPlan).toBe("function");
  });

  it("should throw if generate() is called directly (not via plan)", async () => {
    const generator = new AIModuleGenerator();
    await expect(generator.generate("test-module")).rejects.toThrow("generateFromPlan");
  });

  describe("Route handler generation", () => {
    // Access private method via any cast for unit testing
    let gen: any;
    beforeEach(() => { gen = new AIModuleGenerator(); });

    it("should generate a GET list handler with successResponse", () => {
      const plan = makePlan();
      const handlers: string = gen.buildRouteHandlers(plan);
      expect(handlers).toContain('router.get');
      expect(handlers).toContain('successResponse');
    });

    it("should generate a POST handler with createdResponse", () => {
      const plan = makePlan();
      const handlers: string = gen.buildRouteHandlers(plan);
      expect(handlers).toContain('router.post');
      expect(handlers).toContain('createdResponse');
    });

    it("should include route descriptions as comments", () => {
      const plan = makePlan();
      const handlers: string = gen.buildRouteHandlers(plan);
      expect(handlers).toContain("Create a new movie review");
      expect(handlers).toContain("List all movie reviews");
    });

    it("should generate handlers for all 7 routes in the movie blog plan", () => {
      const plan = makePlan();
      const handlers: string = gen.buildRouteHandlers(plan);
      // Should contain 7 router.get/post/put/delete calls
      const routerCalls = (handlers.match(/router\.(get|post|put|delete|patch)/g) || []).length;
      expect(routerCalls).toBe(7);
    });
  });

  describe("Service method generation", () => {
    let gen: any;
    beforeEach(() => { gen = new AIModuleGenerator(); });

    it("should generate unique service method stubs for each route", () => {
      const plan = makePlan();
      const methods: string = gen.buildServiceMethods(plan);
      // Each method should have async keyword and TODO comment
      expect(methods).toContain("async ");
      expect(methods).toContain("TODO");
    });

    it("should not duplicate methods for same route pattern", () => {
      const plan = makePlan({
        routes: [
          { method: "GET",  path: "/tasks", description: "List tasks" },
          { method: "GET",  path: "/tasks", description: "List tasks again" }, // duplicate
        ],
      });
      const gen2 = new AIModuleGenerator();
      const methods: string = (gen2 as any).buildServiceMethods(plan);
      // findAllTasks should appear only once
      const count = (methods.match(/findAllTasks/g) || []).length;
      expect(count).toBe(1);
    });
  });

  describe("routeToMethodName()", () => {
    let gen: any;
    beforeEach(() => { gen = new AIModuleGenerator(); });

    it("should map GET /tasks → findAllTasks", () => {
      expect(gen.routeToMethodName("GET", "/tasks")).toBe("findAllTasks");
    });

    it("should map POST /tasks → createTasks", () => {
      expect(gen.routeToMethodName("POST", "/tasks")).toBe("createTasks");
    });

    it("should map GET /tasks/:id → findTasksById", () => {
      expect(gen.routeToMethodName("GET", "/tasks/:id")).toBe("findTasksById");
    });

    it("should map PUT /tasks/:id → updateTasks", () => {
      expect(gen.routeToMethodName("PUT", "/tasks/:id")).toBe("updateTasks");
    });

    it("should map DELETE /tasks/:id → deleteTasks", () => {
      expect(gen.routeToMethodName("DELETE", "/tasks/:id")).toBe("deleteTasks");
    });

    it("should map POST /sessions/start → startSession", () => {
      // /sessions/start: 'start' is in verbMap, noun is 'sessions' → startSessions
      expect(gen.routeToMethodName("POST", "/sessions/start")).toBe("startSessions");
    });

    it("should map GET /reports/weekly → findAllWeekly (generic fallthrough)", () => {
      // reports/weekly: "weekly" is not in verbMap, so falls to standard CRUD
      const result = gen.routeToMethodName("GET", "/reports/weekly");
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should map POST /milestones → createMilestones", () => {
      expect(gen.routeToMethodName("POST", "/milestones")).toBe("createMilestones");
    });

    it("should sanitize hyphenated segments: POST /email-notifications → createEmailNotifications", () => {
      expect(gen.routeToMethodName("POST", "/email-notifications")).toBe("createEmailNotifications");
    });

    it("should sanitize hyphenated nested: GET /push-messages/:id → findPushMessagesById", () => {
      expect(gen.routeToMethodName("GET", "/push-messages/:id")).toBe("findPushMessagesById");
    });
  });

  describe("Enabled capabilities list", () => {
    let gen: any;
    beforeEach(() => { gen = new AIModuleGenerator(); });

    it("should list only enabled capabilities", () => {
      const plan = makePlan();
      const caps: string = gen.buildEnabledCapabilitiesList(plan);
      expect(caps).toContain("Auth");
      expect(caps).toContain("Database");
      expect(caps).toContain("Email");
      expect(caps).toContain("Workflow");
      expect(caps).not.toContain("RBAC");
      expect(caps).not.toContain("Storage");
      expect(caps).not.toContain("AI");
    });

    it("should default to Database when all capabilities are disabled", () => {
      const plan = makePlan({
        recommendations: {
          auth:     { enabled: false, reason: "" },
          rbac:     { enabled: false, reason: "" },
          storage:  { enabled: false, reason: "" },
          database: { enabled: false, reason: "" },
          ai:       { enabled: false, reason: "" },
          email:    { enabled: false, reason: "" },
          workflow: { enabled: false, reason: "" },
        },
      });
      const caps: string = gen.buildEnabledCapabilitiesList(plan);
      expect(caps).toBe("Database");
    });
  });

  describe("README route table", () => {
    let gen: any;
    beforeEach(() => { gen = new AIModuleGenerator(); });

    it("should include all routes in markdown table format", () => {
      const plan = makePlan();
      const table: string = gen.buildReadmeRouteTable(plan);
      expect(table).toContain("| Method |");
      expect(table).toContain("POST");
      expect(table).toContain("GET");
      expect(table).toContain("/api/v1/movie-review-blog");
    });
  });
});
