import { describe, it, expect, vi } from "vitest";
import { ProviderManager } from "../../../apps/api/src/core/provider/provider.manager.js";
import type { IProvider } from "../../../apps/api/src/core/provider/provider.interface.js";

describe("ProviderManager", () => {
  it("should register, resolve and list providers", async () => {
    const manager = new ProviderManager();
    const provider: IProvider = {
      name: "minio",
      type: "storage",
      version: "1.0.0",
      enabled: true,
    };

    await manager.register(provider);
    expect(manager.has("minio")).toBe(true);
    expect(manager.get("minio")).toBe(provider);
    expect(manager.names).toContain("minio");
  });

  it("should prevent duplicate registrations", async () => {
    const manager = new ProviderManager();
    const provider: IProvider = {
      name: "minio",
      type: "storage",
      version: "1.0.0",
      enabled: true,
    };

    await manager.register(provider);
    await expect(manager.register(provider)).rejects.toThrow();
  });

  it("should handle enabling and disabling", async () => {
    const manager = new ProviderManager();
    const provider: IProvider = {
      name: "minio",
      type: "storage",
      version: "1.0.0",
      enabled: true,
    };

    await manager.register(provider);
    manager.disable("minio");
    expect(provider.enabled).toBe(false);

    manager.enable("minio");
    expect(provider.enabled).toBe(true);
  });

  it("should trigger lifecycles on bootAll and shutdownAll", async () => {
    const manager = new ProviderManager();
    const bootSpy = vi.fn();
    const shutdownSpy = vi.fn();

    const provider: IProvider = {
      name: "redis",
      type: "cache",
      version: "1.0.0",
      enabled: true,
      boot: bootSpy,
      shutdown: shutdownSpy,
    };

    await manager.register(provider);
    await manager.bootAll();
    expect(bootSpy).toHaveBeenCalledTimes(1);

    await manager.shutdownAll();
    expect(shutdownSpy).toHaveBeenCalledTimes(1);
  });
});
