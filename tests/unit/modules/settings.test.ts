import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsService } from "../../../apps/api/src/modules/settings/settings.service.js";
import { SETTINGS_EVENTS } from "../../../apps/api/src/modules/settings/settings.events.js";
import { createSettingSchema, updateSettingSchema } from "../../../apps/api/src/modules/settings/settings.validation.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Settings Module Unit Tests", () => {
  let repository: any;
  let eventBus: any;
  let cache: any;
  let service: SettingsService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findAllSettings: vi.fn(),
      findByKey: vi.fn(),
      createSetting: vi.fn(),
      updateSetting: vi.fn(),
      deleteSetting: vi.fn(),
    };

    eventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // Mock global container has/resolve for cache
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.CACHE);
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.CACHE);
    container.registerSingleton(CORE_SERVICES.CACHE, () => cache);

    service = new SettingsService(repository, eventBus);
  });

  describe("Validation", () => {
    it("should validate valid CreateSettingDto", () => {
      const valid = { body: { key: "my.key", value: "my.value", description: "desc" } };
      const parsed = createSettingSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("should reject CreateSettingDto with missing key or value", () => {
      const invalid = { body: { key: "", value: "" } };
      const parsed = createSettingSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("should validate valid UpdateSettingDto", () => {
      const valid = { body: { value: "new.value", description: "updated desc" } };
      const parsed = updateSettingSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe("Service", () => {
    it("should find all settings", async () => {
      const list = [{ id: "1", key: "k", value: "v", isActive: true, version: 1, createdAt: new Date(), updatedAt: new Date() }];
      repository.findAllSettings.mockResolvedValue(list);

      const result = await service.findAll();
      expect(result).toBe(list);
      expect(repository.findAllSettings).toHaveBeenCalled();
    });

    it("should find by key using cache when available", async () => {
      const record = { id: "1", key: "k", value: "v", isActive: true, version: 1, createdAt: new Date(), updatedAt: new Date() };
      // Simulate cache miss
      repository.findByKey.mockResolvedValue(record);

      const result = await service.findByKey("k");
      expect(result).toBe(record);
      expect(cache.get).toHaveBeenCalledWith("setting:k");
      expect(cache.set).toHaveBeenCalledWith("setting:k", record, 3600);
    });

    it("should find by key and return cached record directly on cache hit", async () => {
      const record = { id: "1", key: "k", value: "v", isActive: true, version: 1, createdAt: new Date(), updatedAt: new Date() };
      cache.get.mockResolvedValue(record);

      const result = await service.findByKey("k");
      expect(result).toBe(record);
      expect(repository.findByKey).not.toHaveBeenCalled();
    });

    it("should validate duplicate keys on creation", async () => {
      repository.findByKey.mockResolvedValue({ id: "1", key: "dup" });

      await expect(service.create({ key: "dup", value: "v" })).rejects.toThrow("Setting key \"dup\" already exists");
    });

    it("should create settings and publish events", async () => {
      const dto = { key: "new.key", value: "val", description: "desc" };
      const created = { ...dto, id: "2", isActive: true, version: 1, createdAt: new Date(), updatedAt: new Date() };
      repository.findByKey.mockResolvedValue(undefined);
      repository.createSetting.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result).toBe(created);
      expect(eventBus.emit).toHaveBeenCalledWith(SETTINGS_EVENTS.CREATED, created);
    });

    it("should update setting, invalidate cache, and emit event", async () => {
      const existing = { id: "1", key: "k", value: "old" };
      const updated = { id: "1", key: "k", value: "new" };
      repository.findByKey.mockResolvedValue(existing);
      repository.updateSetting.mockResolvedValue(updated);

      const result = await service.update("k", { value: "new" });
      expect(result).toBe(updated);
      expect(cache.delete).toHaveBeenCalledWith("setting:k");
      expect(eventBus.emit).toHaveBeenCalledWith(SETTINGS_EVENTS.UPDATED, updated);
    });

    it("should delete setting, invalidate cache, and emit event", async () => {
      const existing = { id: "1", key: "k", value: "v" };
      repository.findByKey.mockResolvedValue(existing);
      repository.deleteSetting.mockResolvedValue(true);

      const result = await service.delete("k");
      expect(result).toBe(true);
      expect(cache.delete).toHaveBeenCalledWith("setting:k");
      expect(eventBus.emit).toHaveBeenCalledWith(SETTINGS_EVENTS.DELETED, existing);
    });
  });
});
