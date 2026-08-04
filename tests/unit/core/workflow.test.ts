import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkflowService } from "../../../apps/api/src/core/workflow/workflow.service.js";
import { WorkflowValidationError, WorkflowRegistryError, WorkflowDependencyError } from "../../../apps/api/src/core/workflow/workflow.errors.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Workflow Framework Unit & Integration Tests", () => {
  let workflowService: WorkflowService;
  let mockEventBus: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();

    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => mockEventBus);

    workflowService = new WorkflowService();
    container.register(CORE_SERVICES.WORKFLOW, workflowService);
  });

  afterEach(() => {
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();
  });

  describe("Workflow Registry", () => {
    it("should register, get, list, has, and remove workflow definitions", () => {
      const def = {
        name: "test-workflow",
        version: "1.0.0",
        steps: [{ name: "step-1", action: "action-1" }],
      };

      workflowService.registerWorkflow(def);
      expect(workflowService.registry.has("test-workflow")).toBe(true);
      expect(workflowService.registry.get("test-workflow")).toEqual(def);
      expect(workflowService.registry.list().length).toBe(1);

      workflowService.registry.remove("test-workflow");
      expect(workflowService.registry.has("test-workflow")).toBe(false);
    });

    it("should throw on duplicate workflow registrations", () => {
      const def = {
        name: "dup",
        version: "1.0.0",
        steps: [],
      };
      workflowService.registerWorkflow(def);
      expect(() => workflowService.registerWorkflow(def)).toThrow(WorkflowRegistryError);
    });
  });

  describe("Workflow Validation & Sorting", () => {
    it("should throw on duplicate step names", async () => {
      const def = {
        name: "invalid-dup-steps",
        version: "1.0.0",
        steps: [
          { name: "step-a", action: "act" },
          { name: "step-a", action: "act" },
        ],
      };
      workflowService.registerWorkflow(def);
      await expect(workflowService.execute("invalid-dup-steps")).rejects.toThrow(WorkflowValidationError);
    });

    it("should throw on missing step dependency", async () => {
      const def = {
        name: "missing-dep",
        version: "1.0.0",
        steps: [
          { name: "step-a", action: "act", dependsOn: ["non-existent"] },
        ],
      };
      workflowService.registerWorkflow(def);
      await expect(workflowService.execute("missing-dep")).rejects.toThrow(WorkflowDependencyError);
    });

    it("should throw on circular dependency", async () => {
      const def = {
        name: "circular-deps",
        version: "1.0.0",
        steps: [
          { name: "step-a", action: "act", dependsOn: ["step-b"] },
          { name: "step-b", action: "act", dependsOn: ["step-a"] },
        ],
      };
      workflowService.registerWorkflow(def);
      await expect(workflowService.execute("circular-deps")).rejects.toThrow(WorkflowDependencyError);
    });
  });

  describe("Execution, Retries, and Timeouts", () => {
    it("should execute steps sequentially with correct inputs propagation", async () => {
      workflowService.registerStepAction({
        name: "stepA",
        execute: async (context, input) => {
          return { data: "from-a" };
        },
      });

      workflowService.registerStepAction({
        name: "stepB",
        execute: async (context, input) => {
          // input should contain completed step outputs
          expect(input["step-1"]).toEqual({ data: "from-a" });
          return { data: "from-b" };
        },
      });

      const def = {
        name: "sequential-flow",
        version: "1.0.0",
        steps: [
          { name: "step-1", action: "stepA" },
          { name: "step-2", action: "stepB", dependsOn: ["step-1"] },
        ],
      };

      workflowService.registerWorkflow(def);
      const res = await workflowService.execute("sequential-flow", { someInput: 1 });
      expect(res.status).toBe("completed");
      expect(res.output["step-1"]).toEqual({ data: "from-a" });
      expect(res.output["step-2"]).toEqual({ data: "from-b" });
      expect(mockEventBus.emit).toHaveBeenCalledWith("workflow.started", expect.any(Object));
      expect(mockEventBus.emit).toHaveBeenCalledWith("workflow.completed", expect.any(Object));
    });

    it("should retry steps on failure and delay attempts", async () => {
      let attemptsCount = 0;
      workflowService.registerStepAction({
        name: "failing-action",
        execute: async (context, input) => {
          attemptsCount++;
          if (attemptsCount < 3) {
            throw new Error("Temporary Failure");
          }
          return "success-finally";
        },
      });

      const def = {
        name: "retry-flow",
        version: "1.0.0",
        steps: [
          {
            name: "step-retry",
            action: "failing-action",
            retry: { attempts: 3, delay: 10 },
          },
        ],
      };

      workflowService.registerWorkflow(def);
      const res = await workflowService.execute("retry-flow");
      expect(res.status).toBe("completed");
      expect(res.output["step-retry"]).toBe("success-finally");
      expect(attemptsCount).toBe(3);
    });

    it("should fail step and workflow if step timeout is exceeded", async () => {
      workflowService.registerStepAction({
        name: "slow-action",
        execute: async (context, input) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return "too-late";
        },
      });

      const def = {
        name: "timeout-flow",
        version: "1.0.0",
        steps: [
          {
            name: "step-timeout",
            action: "slow-action",
            timeout: 10,
          },
        ],
      };

      workflowService.registerWorkflow(def);
      const res = await workflowService.execute("timeout-flow");
      expect(res.status).toBe("failed");
      expect(res.error).toContain("timed out");
      expect(mockEventBus.emit).toHaveBeenCalledWith("step.failed", expect.any(Object));
      expect(mockEventBus.emit).toHaveBeenCalledWith("workflow.failed", expect.any(Object));
    });
  });

  describe("Reference Workflows Compositions", () => {
    it("should run User Onboarding Workflow successfully", async () => {
      // Mock step actions mapping
      workflowService.registerStepAction({
        name: "validateUserForm",
        execute: async (context, input) => {
          if (!context.input.email) throw new Error("Email required");
          return { valid: true };
        },
      });

      workflowService.registerStepAction({
        name: "createUserInDB",
        execute: async (context, input) => {
          return { id: "user-999", name: context.input.name };
        },
      });

      workflowService.registerStepAction({
        name: "sendWelcomeEmail",
        execute: async (context, input) => {
          expect(input["create-db-user"]).toEqual({ id: "user-999", name: "Alice" });
          return { sent: true, messageId: "email-welcome-1" };
        },
      });

      workflowService.registerStepAction({
        name: "sendWelcomeNotification",
        execute: async (context, input) => {
          return { notified: true };
        },
      });

      const def = {
        name: "user-onboarding-workflow",
        version: "1.0.0",
        steps: [
          { name: "validate-input", action: "validateUserForm" },
          { name: "create-db-user", action: "createUserInDB", dependsOn: ["validate-input"] },
          { name: "dispatch-welcome-email", action: "sendWelcomeEmail", dependsOn: ["create-db-user"] },
          { name: "trigger-alert", action: "sendWelcomeNotification", dependsOn: ["create-db-user"] },
        ],
      };

      workflowService.registerWorkflow(def);
      const res = await workflowService.execute("user-onboarding-workflow", {
        email: "alice@example.com",
        name: "Alice",
      });

      expect(res.status).toBe("completed");
      expect(res.output["create-db-user"].id).toBe("user-999");
      expect(res.output["dispatch-welcome-email"].sent).toBe(true);
    });

    it("should run AI Document Processing Pipeline successfully", async () => {
      workflowService.registerStepAction({
        name: "storageUpload",
        execute: async (context, input) => {
          return { url: "/s3/docs/test-doc.pdf" };
        },
      });

      workflowService.registerStepAction({
        name: "generateAI",
        execute: async (context, input) => {
          expect(input["upload-to-s3"].url).toBe("/s3/docs/test-doc.pdf");
          return { summary: "This is a document summary description" };
        },
      });

      workflowService.registerStepAction({
        name: "saveSummaryToDB",
        execute: async (context, input) => {
          expect(input["ai-extract"].summary).toContain("summary");
          return { saved: true, id: 50 };
        },
      });

      const def = {
        name: "document-pipeline-workflow",
        version: "1.0.0",
        steps: [
          { name: "upload-to-s3", action: "storageUpload" },
          { name: "ai-extract", action: "generateAI", dependsOn: ["upload-to-s3"] },
          { name: "persist-results", action: "saveSummaryToDB", dependsOn: ["ai-extract"] },
        ],
      };

      workflowService.registerWorkflow(def);
      const res = await workflowService.execute("document-pipeline-workflow", {
        fileName: "test-doc.pdf",
      });

      expect(res.status).toBe("completed");
      expect(res.output["ai-extract"].summary).toBeDefined();
      expect(res.output["persist-results"].saved).toBe(true);
    });
  });
});
