import { describe, it, expect, vi, beforeEach } from "vitest";
import { PermissionService } from "../../../apps/api/src/modules/permissions/permissions.service.js";
import { PERMISSION_EVENTS } from "../../../apps/api/src/modules/permissions/permissions.events.js";
import { createPermissionSchema, updatePermissionSchema } from "../../../apps/api/src/modules/permissions/permissions.validation.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Permissions Module Unit Tests", () => {
  let repository: any;
  let eventBus: any;
  let cache: any;
  let service: PermissionService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findAllPermissions: vi.fn(),
      findPermissionById: vi.fn(),
      findByName: vi.fn(),
      findBySlug: vi.fn(),
      createPermission: vi.fn(),
      updatePermission: vi.fn(),
      deletePermission: vi.fn(),
      restore: vi.fn(),
      findById: vi.fn(),
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

    service = new PermissionService(repository, eventBus);
  });

  describe("Validation", () => {
    it("should validate valid CreatePermissionDto", () => {
      const valid = {
        body: {
          name: "Read Users",
          slug: "users.read",
          resource: "users",
          action: "read",
          description: "Read all users",
          isSystem: true
        }
      };
      const parsed = createPermissionSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("should reject CreatePermissionDto with missing fields", () => {
      const invalid = { body: { description: "no name or slug" } };
      const parsed = createPermissionSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Service", () => {
    it("should find all permissions", async () => {
      const list = [{ id: "1", name: "users.read" }];
      repository.findAllPermissions.mockResolvedValue(list);

      const result = await service.getPermissions();
      expect(result).toBe(list);
      expect(repository.findAllPermissions).toHaveBeenCalled();
    });

    it("should find by id using cache when available", async () => {
      const record = { id: "1", name: "users.read", slug: "users.read" };
      repository.findPermissionById.mockResolvedValue(record);

      const result = await service.getPermissionById("1");
      expect(result).toBe(record);
      expect(cache.get).toHaveBeenCalledWith("permission:1");
      expect(cache.set).toHaveBeenCalledWith("permission:1", record, 3600);
    });

    it("should resolve from cache directly on cache hit", async () => {
      const record = { id: "1", name: "users.read", slug: "users.read" };
      cache.get.mockResolvedValue(record);

      const result = await service.getPermissionById("1");
      expect(result).toBe(record);
      expect(repository.findPermissionById).not.toHaveBeenCalled();
    });

    it("should prevent duplicate names on creation", async () => {
      repository.findByName.mockResolvedValue({ id: "1", name: "dup" });

      await expect(service.createPermission({
        name: "dup",
        slug: "users.read",
        resource: "users",
        action: "read"
      })).rejects.toThrow("Permission name \"dup\" already exists");
    });

    it("should prevent duplicate slugs on creation", async () => {
      repository.findByName.mockResolvedValue(undefined);
      repository.findBySlug.mockResolvedValue({ id: "1", slug: "dup.slug" });

      await expect(service.createPermission({
        name: "name",
        slug: "dup.slug",
        resource: "users",
        action: "read"
      })).rejects.toThrow("Permission slug \"dup.slug\" already exists");
    });

    it("should reject invalid slug convention on creation", async () => {
      await expect(service.createPermission({
        name: "name",
        slug: "DUP_SLUG",
        resource: "users",
        action: "read"
      })).rejects.toThrow("Permission slug must be lowercase containing only alphanumeric, dots, colons, or dashes");
    });

    it("should create permission and publish events", async () => {
      const dto = { name: "New Perm", slug: "users.write", resource: "users", action: "write" };
      const created = { ...dto, id: "2", isActive: true, version: 1 };
      repository.findByName.mockResolvedValue(undefined);
      repository.findBySlug.mockResolvedValue(undefined);
      repository.createPermission.mockResolvedValue(created);

      const result = await service.createPermission(dto);
      expect(result).toBe(created);
      expect(eventBus.emit).toHaveBeenCalledWith(PERMISSION_EVENTS.CREATED, created);
    });

    it("should update permission, invalidate cache, and emit event", async () => {
      const existing = { id: "1", name: "old", slug: "users.read" };
      const updated = { id: "1", name: "new", slug: "users.read" };
      repository.findPermissionById.mockResolvedValue(existing);
      repository.updatePermission.mockResolvedValue(updated);

      const result = await service.updatePermission("1", { name: "new" });
      expect(result).toBe(updated);
      expect(cache.delete).toHaveBeenCalledWith("permission:1");
      expect(eventBus.emit).toHaveBeenCalledWith(PERMISSION_EVENTS.UPDATED, updated);
    });

    it("should prevent deletion of protected system permissions", async () => {
      const systemPerm = { id: "1", slug: "settings.manage" };
      repository.findPermissionById.mockResolvedValue(systemPerm);

      await expect(service.deletePermission("1")).rejects.toThrow("Cannot delete system protected permission");
    });

    it("should delete custom permission, invalidate cache, and emit event", async () => {
      const customPerm = { id: "1", slug: "custom.perm" };
      repository.findPermissionById.mockResolvedValue(customPerm);
      repository.deletePermission.mockResolvedValue(true);

      const result = await service.deletePermission("1");
      expect(result).toBe(true);
      expect(cache.delete).toHaveBeenCalledWith("permission:1");
      expect(eventBus.emit).toHaveBeenCalledWith(PERMISSION_EVENTS.DELETED, customPerm);
    });

    it("should restore permission, invalidate cache, and emit event", async () => {
      const existing = { id: "1", slug: "custom.perm" };
      const restored = { id: "1", slug: "custom.perm", deletedAt: null, isActive: true };
      repository.findById.mockResolvedValue(existing);
      repository.restore.mockResolvedValue(restored);

      const result = await service.restorePermission("1");
      expect(result).toBe(restored);
      expect(cache.delete).toHaveBeenCalledWith("permission:1");
      expect(eventBus.emit).toHaveBeenCalledWith(PERMISSION_EVENTS.RESTORED, restored);
    });
  });
});
