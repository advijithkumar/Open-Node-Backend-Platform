/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WorkflowService } from "../../../apps/api/src/core/workflow/workflow.service.js";
import {
  VerifyDocPermissionsStep,
  FetchDocumentFromStorageStep,
  AnalyzeDocumentWithAIStep,
  PersistDocumentRecordStep,
  SendProcessingCompleteEmailStep,
  DocumentProcessingWorkflowDefinition,
} from "../../../apps/api/src/core/workflow/examples/document-processing.workflow.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Document Processing Platform Workflow Unit Tests", () => {
  let workflowService: WorkflowService;
  let mockStorage: any;
  let mockAI: any;
  let mockEmail: any;
  let mockAuth: any;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();

    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();

    mockStorage = {
      download: vi.fn().mockResolvedValue(Buffer.from("Invoice content: $1500 for consulting services")),
    };

    mockAI = {
      complete: vi.fn().mockResolvedValue({ text: "Invoice summary: $1500 consulting fee", model: "mock-model" }),
      embed: vi.fn().mockResolvedValue({ embedding: [0.1, 0.2, 0.3, 0.4], model: "mock-embed" }),
    };

    mockEmail = {
      send: vi.fn().mockResolvedValue({ success: true }),
    };

    mockAuth = {
      hasPermission: vi.fn().mockResolvedValue(true),
    };

    mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(true),
      }),
    };

    container.registerSingleton(CORE_SERVICES.STORAGE, () => mockStorage);
    container.registerSingleton(CORE_SERVICES.AI, () => mockAI);
    container.registerSingleton(CORE_SERVICES.EMAIL, () => mockEmail);
    container.registerSingleton(CORE_SERVICES.AUTHORIZATION, () => mockAuth);
    container.registerSingleton(CORE_SERVICES.DATABASE, () => mockDb);

    workflowService = new WorkflowService();
    container.registerSingleton(CORE_SERVICES.WORKFLOW, () => workflowService);

    // Register steps
    workflowService.registerStepAction(new VerifyDocPermissionsStep());
    workflowService.registerStepAction(new FetchDocumentFromStorageStep());
    workflowService.registerStepAction(new AnalyzeDocumentWithAIStep());
    workflowService.registerStepAction(new PersistDocumentRecordStep());
    workflowService.registerStepAction(new SendProcessingCompleteEmailStep());

    workflowService.registerWorkflow(DocumentProcessingWorkflowDefinition);
  });

  afterEach(() => {
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();
  });

  it("should execute end-to-end document processing workflow successfully across all platform services", async () => {
    const input = {
      user: { id: "usr-456", email: "client@company.com", role: "manager" },
      bucket: "invoices",
      documentKey: "inv-2026-001.pdf",
    };

    const result = await workflowService.execute("ai-document-processing-workflow", input);

    expect(result.status).toBe("completed");
    expect(mockAuth.hasPermission).toHaveBeenCalledWith("usr-456", "documents:process");
    expect(mockStorage.download).toHaveBeenCalledWith("invoices", "inv-2026-001.pdf");
    expect(mockAI.complete).toHaveBeenCalled();
    expect(mockAI.embed).toHaveBeenCalled();
    expect(mockDb.insert).toHaveBeenCalledWith("documents");
    expect(mockEmail.send).toHaveBeenCalledWith({
      to: "client@company.com",
      subject: "Document Processing Complete",
      html: expect.stringContaining("Invoice summary"),
    });

    expect(result.output["persist-record"].documentKey).toBe("inv-2026-001.pdf");
  });

  it("should fail workflow execution when user lacks authorization", async () => {
    mockAuth.hasPermission.mockResolvedValue(false);

    const input = {
      user: { id: "unauthorized-usr", email: "bad@test.com" },
      documentKey: "restricted.pdf",
    };

    const result = await workflowService.execute("ai-document-processing-workflow", input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("Forbidden");
  });
});
