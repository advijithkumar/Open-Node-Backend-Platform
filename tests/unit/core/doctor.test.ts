import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DoctorService } from "../../../apps/api/src/core/doctor/doctor.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { KERNEL_SERVICES } from "../../../apps/api/src/core/kernel/kernel.constants.js";

describe("DoctorService Unit Tests", () => {
  let doctorService: DoctorService;
  let mockKernel: any;
  let mockConfig: any;
  let mockProviderMgr: any;
  let mockStorage: any;
  let mockCache: any;
  let mockQueue: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockKernel = {
      getDiagnostics: vi.fn().mockReturnValue({
        uptime: 100,
        environment: "test",
        state: "booted",
        modules: [{ name: "users", enabled: true }],
        plugins: [{ name: "minio", enabled: true }],
      }),
      plugins: {
        getTopologicallySortedPlugins: vi.fn().mockReturnValue([]),
      },
      modules: {
        getTopologicallySortedModules: vi.fn().mockReturnValue([]),
      },
    };

    mockConfig = {
      get: vi.fn().mockImplementation((key) => {
        if (key === "app.name") return "ONBP-Test";
        return undefined;
      }),
    };

    mockProviderMgr = {
      getDiagnostics: vi.fn().mockResolvedValue([
        {
          name: "postgresql",
          type: "database",
          enabled: true,
          health: { status: "healthy" },
        },
      ]),
    };

    mockStorage = {
      getHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
      getDiagnostics: vi.fn().mockReturnValue({ activeProvider: "local" }),
    };

    mockCache = {
      getManager: vi.fn().mockReturnValue({
        getHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
        getDiagnostics: vi.fn().mockReturnValue({ activeProvider: "memory" }),
      }),
    };

    mockQueue = {
      getHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
      getDiagnostics: vi.fn().mockReturnValue({ activeProvider: "memory" }),
    };

    // Clean up container definitions
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();

    // Register all healthy mocks
    container.registerSingleton(KERNEL_SERVICES.KERNEL, () => mockKernel);
    container.registerSingleton(CORE_SERVICES.CONFIG, () => mockConfig);
    container.registerSingleton(CORE_SERVICES.PROVIDER_MANAGER, () => mockProviderMgr);
    container.registerSingleton(CORE_SERVICES.STORAGE, () => mockStorage);
    container.registerSingleton(CORE_SERVICES.CACHE, () => mockCache);
    container.registerSingleton(CORE_SERVICES.QUEUE, () => mockQueue);
    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => ({}));
    container.registerSingleton(CORE_SERVICES.DISCOVERY, () => ({}));
    container.registerSingleton(CORE_SERVICES.HEALTH, () => ({}));
    container.registerSingleton(CORE_SERVICES.NOTIFICATION, () => ({
      getHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
      getDiagnostics: vi.fn().mockReturnValue({ registeredProviders: [], supportedChannels: [], statistics: { sent: 0, failed: 0 } }),
    }));
    container.registerSingleton(CORE_SERVICES.EMAIL, () => ({
      getHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
      getDiagnostics: vi.fn().mockReturnValue({ registeredProviders: ["smtp"], activeProvider: "smtp", statistics: { sent: 0, failed: 0 } }),
    }));
    container.registerSingleton(CORE_SERVICES.AI, () => ({
      health: vi.fn().mockResolvedValue({ status: "healthy" }),
      getDiagnostics: vi.fn().mockReturnValue({ registeredProviders: ["mock"], activeProvider: "mock", statistics: { completionsCount: 0, embeddingsCount: 0, failedCount: 0 } }),
    }));
    container.registerSingleton(CORE_SERVICES.WORKFLOW, () => ({
      registry: {},
      execute: vi.fn(),
      getDiagnostics: vi.fn().mockReturnValue({ registered: 0, executions: 0, completed: 0, failed: 0 }),
    }));

    doctorService = new DoctorService();
  });

  afterEach(() => {
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();
  });

  it("should report healthy when all systems are fully booted and responsive", async () => {
    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("healthy");
    expect(report.results.length).toBeGreaterThan(0);
    expect(report.results.some((r) => r.status === "critical")).toBe(false);
    expect(report.results.some((r) => r.status === "warning")).toBe(false);
  });

  it("should report critical when core services are missing from container", async () => {
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.STORAGE); // remove storage

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "DI Container" && r.status === "critical")).toBe(true);
  });

  it("should report critical when a registered provider health check fails", async () => {
    mockProviderMgr.getDiagnostics.mockResolvedValue([
      {
        name: "postgresql",
        type: "database",
        enabled: true,
        health: { status: "unhealthy", reason: "Connection timeout" },
      },
    ]);

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "Provider: postgresql" && r.status === "critical")).toBe(true);
  });

  it("should report warning when app name configuration is missing", async () => {
    mockConfig.get.mockReturnValue(undefined);

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("warning");
    expect(report.results.some((r) => r.component === "ConfigManager" && r.status === "warning")).toBe(true);
  });

  it("should report critical when circular dependency ordering issues are detected", async () => {
    mockKernel.plugins.getTopologicallySortedPlugins.mockImplementation(() => {
      throw new Error("Circular plugin dependency detected involving \"minio\"");
    });

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "Dependency Orderer" && r.status === "critical")).toBe(true);
  });

  it("should report critical when notification framework health check fails", async () => {
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.NOTIFICATION);
    container.registerSingleton(CORE_SERVICES.NOTIFICATION, () => ({
      getHealth: vi.fn().mockResolvedValue({ status: "unhealthy", reason: "All providers failed" }),
      getDiagnostics: vi.fn().mockReturnValue({ registeredProviders: [], supportedChannels: [], statistics: { sent: 0, failed: 0 } }),
    }));

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "Notification Framework" && r.status === "critical")).toBe(true);
  });

  it("should report critical when email framework health check fails", async () => {
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.EMAIL);
    container.registerSingleton(CORE_SERVICES.EMAIL, () => ({
      getHealth: vi.fn().mockResolvedValue({ status: "unhealthy", reason: "SMTP connection failed" }),
      getDiagnostics: vi.fn().mockReturnValue({ registeredProviders: ["smtp"], activeProvider: "smtp", statistics: { sent: 0, failed: 0 } }),
    }));

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "Email Framework" && r.status === "critical")).toBe(true);
  });

  it("should report critical when AI framework health check fails", async () => {
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.AI);
    container.registerSingleton(CORE_SERVICES.AI, () => ({
      health: vi.fn().mockResolvedValue({ status: "unhealthy", reason: "API key invalid" }),
      getDiagnostics: vi.fn().mockReturnValue({ registeredProviders: ["mock"], activeProvider: "mock", statistics: { completionsCount: 0, embeddingsCount: 0, failedCount: 0 } }),
    }));

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "AI Framework" && r.status === "critical")).toBe(true);
  });

  it("should report critical when Workflow framework health check fails", async () => {
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.WORKFLOW);
    container.registerSingleton(CORE_SERVICES.WORKFLOW, () => ({
      // missing registry causes check failure
      execute: vi.fn(),
      getDiagnostics: vi.fn().mockReturnValue({ registered: 0, executions: 0, completed: 0, failed: 0 }),
    }));

    const report = await doctorService.runDiagnostics();
    expect(report.overallStatus).toBe("critical");
    expect(report.results.some((r) => r.component === "Workflow Framework" && r.status === "critical")).toBe(true);
  });
});
