import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoleService } from "../../../apps/api/src/modules/roles/roles.service.js";
import { ROLE_EVENTS } from "../../../apps/api/src/modules/roles/roles.events.js";
import { createRoleSchema, updateRoleSchema } from "../../../apps/api/src/modules/roles/roles.validation.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Roles Module Unit Tests", () => {
  let repository: any;
  let eventBus: any;
  let cache: any;
  let service: RoleService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findAllRoles: vi.fn(),
      findRoleById: vi.fn(),
      findByName: vi.fn(),
      findBySlug: vi.fn(),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
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

    service = new RoleService(repository, eventBus);
  });

  describe("Validation", () => {
    it("should validate valid CreateRoleDto", () => {
      const valid = {
        body: {
          name: "Administrator",
          slug: "admin",
          description: "Admin role",
          isSystem: true
        }
      };
      const parsed = createRoleSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("should reject CreateRoleDto with missing fields", () => {
      const invalid = { body: { description: "no name or slug" } };
      const parsed = createRoleSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Service", () => {
    it("should find all roles", async () => {
      const list = [{ id: "1", name: "Guest" }];
      repository.findAllRoles.mockResolvedValue(list);

      const result = await service.getRoles();
      expect(result).toBe(list);
      expect(repository.findAllRoles).toHaveBeenCalled();
    });

    it("should find by id using cache when available", async () => {
      const record = { id: "1", name: "Guest" };
      repository.findRoleById.mockResolvedValue(record);

      const result = await service.getRoleById("1");
      expect(result).toBe(record);
      expect(cache.get).toHaveBeenCalledWith("role:1");
      expect(cache.set).toHaveBeenCalledWith("role:1", record, 3600);
    });

    it("should resolve from cache directly on cache hit", async () => {
      const record = { id: "1", name: "Guest" };
      cache.get.mockResolvedValue(record);

      const result = await service.getRoleById("1");
      expect(result).toBe(record);
      expect(repository.findRoleById).not.toHaveBeenCalled();
    });

    it("should prevent duplicate names on creation", async () => {
      repository.findByName.mockResolvedValue({ id: "1", name: "dup" });

      await expect(service.createRole({
        name: "dup",
        slug: "slug",
      })).rejects.toThrow("Role name \"dup\" already exists");
    });

    it("should prevent duplicate slugs on creation", async () => {
      repository.findByName.mockResolvedValue(undefined);
      repository.findBySlug.mockResolvedValue({ id: "1", slug: "dup-slug" });

      await expect(service.createRole({
        name: "name",
        slug: "dup-slug",
      })).rejects.toThrow("Role slug \"dup-slug\" already exists");
    });

    it("should create role and publish events", async () => {
      const dto = { name: "New Role", slug: "new-role" };
      const created = { ...dto, id: "2", isSystem: false, isActive: true, version: 1 };
      repository.findByName.mockResolvedValue(undefined);
      repository.findBySlug.mockResolvedValue(undefined);
      repository.createRole.mockResolvedValue(created);

      const result = await service.createRole(dto);
      expect(result).toBe(created);
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.CREATED, created);
    });

    it("should update role, invalidate cache, and emit event", async () => {
      const existing = { id: "1", name: "old" };
      const updated = { id: "1", name: "new" };
      repository.findRoleById.mockResolvedValue(existing);
      repository.updateRole.mockResolvedValue(updated);

      const result = await service.updateRole("1", { name: "new" });
      expect(result).toBe(updated);
      expect(cache.delete).toHaveBeenCalledWith("role:1");
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.UPDATED, updated);
    });

    it("should prevent deletion of protected system roles", async () => {
      const systemRole = { id: "1", name: "Admin", isSystem: true };
      repository.findRoleById.mockResolvedValue(systemRole);

      await expect(service.deleteRole("1")).rejects.toThrow("Cannot delete system protected role");
    });

    it("should delete custom role, invalidate cache, and emit event", async () => {
      const customRole = { id: "1", name: "Custom", isSystem: false };
      repository.findRoleById.mockResolvedValue(customRole);
      repository.deleteRole.mockResolvedValue(true);

      const result = await service.deleteRole("1");
      expect(result).toBe(true);
      expect(cache.delete).toHaveBeenCalledWith("role:1");
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.DELETED, customRole);
    });

    it("should restore role, invalidate cache, and emit event", async () => {
      const existing = { id: "1", name: "Custom" };
      const restored = { id: "1", name: "Custom", deletedAt: null, isActive: true };
      repository.findById.mockResolvedValue(existing);
      repository.restore.mockResolvedValue(restored);

      const result = await service.restoreRole("1");
      expect(result).toBe(restored);
      expect(cache.delete).toHaveBeenCalledWith("role:1");
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.RESTORED, restored);
    });
  });
});
