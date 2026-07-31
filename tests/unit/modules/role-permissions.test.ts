import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoleService } from "../../../apps/api/src/modules/roles/roles.service.js";
import { ROLE_EVENTS } from "../../../apps/api/src/modules/roles/roles.events.js";
import { assignPermissionSchema, replacePermissionsSchema } from "../../../apps/api/src/modules/roles/roles.validation.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Role-Permission Assignment Unit Tests", () => {
  let repository: any;
  let permissionRepository: any;
  let eventBus: any;
  let cache: any;
  let service: RoleService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findRoleById: vi.fn(),
      assignPermission: vi.fn(),
      removePermission: vi.fn(),
      getRolePermissions: vi.fn(),
      getPermissionRoles: vi.fn(),
      replacePermissions: vi.fn(),
    };

    permissionRepository = {
      findPermissionById: vi.fn(),
    };

    eventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // Register mocks in the container
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.CACHE);
    definitions.delete("permissionRepository");
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.CACHE);
    singletons.delete("permissionRepository");
    
    container.registerSingleton(CORE_SERVICES.CACHE, () => cache);
    container.registerSingleton("permissionRepository", () => permissionRepository);

    service = new RoleService(repository, eventBus);
  });

  describe("Validation", () => {
    it("should validate assignPermissionSchema", () => {
      const valid = { body: { permissionId: "123e4567-e89b-12d3-a456-426614174000" } };
      const parsed = assignPermissionSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("should validate replacePermissionsSchema", () => {
      const valid = { body: { permissionIds: ["123e4567-e89b-12d3-a456-426614174000"] } };
      const parsed = replacePermissionsSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe("Service Assignments", () => {
    it("should assign permission and publish event", async () => {
      const role = { id: "role-1", name: "User", isSystem: false };
      const perm = { id: "perm-1", name: "Read", slug: "users.read" };
      repository.findRoleById.mockResolvedValue(role);
      permissionRepository.findPermissionById.mockResolvedValue(perm);
      repository.getRolePermissions.mockResolvedValue([]); // No existing assignments

      await service.assignPermissionToRole("role-1", "perm-1");

      expect(repository.assignPermission).toHaveBeenCalledWith("role-1", "perm-1");
      expect(cache.delete).toHaveBeenCalledWith("role:role-1:permissions");
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.PERMISSION_ASSIGNED, { roleId: "role-1", permissionId: "perm-1" });
    });

    it("should prevent duplicate assignments", async () => {
      const role = { id: "role-1", name: "User", isSystem: false };
      const perm = { id: "perm-1", name: "Read", slug: "users.read" };
      repository.findRoleById.mockResolvedValue(role);
      permissionRepository.findPermissionById.mockResolvedValue(perm);
      repository.getRolePermissions.mockResolvedValue([{ id: "perm-1" }]); // Already assigned

      await expect(service.assignPermissionToRole("role-1", "perm-1")).rejects.toThrow("Permission already assigned to this role");
    });

    it("should prevent assignments on system protected roles", async () => {
      const role = { id: "role-1", name: "Admin", isSystem: true };
      repository.findRoleById.mockResolvedValue(role);

      await expect(service.assignPermissionToRole("role-1", "perm-1")).rejects.toThrow("Cannot modify permissions of system protected role");
    });

    it("should remove permission and publish event", async () => {
      const role = { id: "role-1", name: "User", isSystem: false };
      const perm = { id: "perm-1", name: "Read", slug: "users.read" };
      repository.findRoleById.mockResolvedValue(role);
      permissionRepository.findPermissionById.mockResolvedValue(perm);
      repository.removePermission.mockResolvedValue(true);

      await service.removePermissionFromRole("role-1", "perm-1");

      expect(repository.removePermission).toHaveBeenCalledWith("role-1", "perm-1");
      expect(cache.delete).toHaveBeenCalledWith("role:role-1:permissions");
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.PERMISSION_REMOVED, { roleId: "role-1", permissionId: "perm-1" });
    });

    it("should replace permissions and publish event", async () => {
      const role = { id: "role-1", name: "User", isSystem: false };
      const perm = { id: "perm-1", name: "Read", slug: "users.read" };
      repository.findRoleById.mockResolvedValue(role);
      permissionRepository.findPermissionById.mockResolvedValue(perm);

      await service.replaceRolePermissions("role-1", ["perm-1"]);

      expect(repository.replacePermissions).toHaveBeenCalledWith("role-1", ["perm-1"]);
      expect(cache.delete).toHaveBeenCalledWith("role:role-1:permissions");
      expect(eventBus.emit).toHaveBeenCalledWith(ROLE_EVENTS.PERMISSIONS_REPLACED, { roleId: "role-1", permissionIds: ["perm-1"] });
    });
  });
});
