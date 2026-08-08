import type { RoleRepository } from "./roles.repository.js";
import { ROLE_EVENTS } from "./roles.events.js";
import type { CreateRoleDto, UpdateRoleDto, RoleRecord } from "./roles.types.js";
import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IEventBus } from "../../core/events/event.interface.js";
import type { ICacheService } from "../../core/cache/cache.interface.js";
import { AppError } from "../../core/errors/app-error.js";

export class RoleService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly eventBus?: IEventBus
  ) {}

  private getCache(): ICacheService | undefined {
    try {
      if (container.has(CORE_SERVICES.CACHE)) {
        return container.resolve<ICacheService>(CORE_SERVICES.CACHE);
      }
    } catch {
      // Fallback
    }
    return undefined;
  }

  private getPermissionRepository(): any {
    return container.resolve("permissionRepository");
  }

  async createRole(data: CreateRoleDto): Promise<RoleRecord> {
    const existingName = await this.repository.findByName(data.name);
    if (existingName) {
      throw new AppError(`Role name "${data.name}" already exists`, 400, "DUPLICATE_ROLE_NAME");
    }

    const existingSlug = await this.repository.findBySlug(data.slug);
    if (existingSlug) {
      throw new AppError(`Role slug "${data.slug}" already exists`, 400, "DUPLICATE_ROLE_SLUG");
    }

    const role = await this.repository.createRole(data);

    if (this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.CREATED, role);
    }

    return role;
  }

  async getRoleById(id: string): Promise<RoleRecord> {
    const cache = this.getCache();
    const cacheKey = `role:${id}`;

    if (cache) {
      try {
        const cached = await cache.get<RoleRecord>(cacheKey);
        if (cached) return cached;
      } catch {
        // Fallback
      }
    }

    const role = await this.repository.findRoleById(id);
    if (!role) {
      throw new AppError(`Role with ID ${id} not found`, 404, "ROLE_NOT_FOUND");
    }

    if (cache) {
      try {
        await cache.set(cacheKey, role, 3600);
      } catch {
        // Fallback
      }
    }

    return role;
  }

  async getRoles(limit = 50, offset = 0): Promise<RoleRecord[]> {
    return this.repository.findAllRoles(limit, offset);
  }

  async updateRole(id: string, data: UpdateRoleDto): Promise<RoleRecord> {
    await this.getRoleById(id);

    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError(`Role name "${data.name}" is already taken`, 400, "DUPLICATE_ROLE_NAME");
      }
    }

    if (data.slug) {
      const existing = await this.repository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError(`Role slug "${data.slug}" is already taken`, 400, "DUPLICATE_ROLE_SLUG");
      }
    }

    const updated = await this.repository.updateRole(id, data);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`role:${id}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.UPDATED, updated);
    }

    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.getRoleById(id);
    if (role.isSystem) {
      throw new AppError("Cannot delete system protected role", 400, "SYSTEM_ROLE_PROTECTED");
    }

    const deleted = await this.repository.deleteRole(id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`role:${id}`);
        await cache.delete(`role:${id}:permissions`);
      } catch {
        // Fallback
      }
    }

    if (deleted && this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.DELETED, role);
    }

    return deleted;
  }

  async restoreRole(id: string): Promise<RoleRecord> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new AppError(`Role with ID ${id} not found`, 404, "ROLE_NOT_FOUND");
    }

    const restored = await this.repository.restore(id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`role:${id}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.RESTORED, restored);
    }

    return restored;
  }

  // Junction relationship business service logic
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.getRoleById(roleId);
    if (role.isSystem) {
      throw new AppError("Cannot modify permissions of system protected role", 400, "SYSTEM_ROLE_PROTECTED");
    }

    const permRepo = this.getPermissionRepository();
    const perm = await permRepo.findPermissionById(permissionId);
    if (!perm) {
      throw new AppError(`Permission with ID ${permissionId} not found`, 404, "PERMISSION_NOT_FOUND");
    }

    const current = await this.repository.getRolePermissions(roleId);
    if (current.some((p) => p.id === permissionId)) {
      throw new AppError("Permission already assigned to this role", 400, "DUPLICATE_ASSIGNMENT");
    }

    await this.repository.assignPermission(roleId, permissionId);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`role:${roleId}:permissions`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.PERMISSION_ASSIGNED, { roleId, permissionId });
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const role = await this.getRoleById(roleId);
    if (role.isSystem) {
      throw new AppError("Cannot modify permissions of system protected role", 400, "SYSTEM_ROLE_PROTECTED");
    }

    const permRepo = this.getPermissionRepository();
    const perm = await permRepo.findPermissionById(permissionId);
    if (!perm) {
      throw new AppError(`Permission with ID ${permissionId} not found`, 404, "PERMISSION_NOT_FOUND");
    }

    const removed = await this.repository.removePermission(roleId, permissionId);
    if (!removed) {
      throw new AppError("Permission association not found for this role", 400, "ASSOCIATION_NOT_FOUND");
    }

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`role:${roleId}:permissions`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.PERMISSION_REMOVED, { roleId, permissionId });
    }

    return removed;
  }

  async getRolePermissions(roleId: string): Promise<any[]> {
    await this.getRoleById(roleId);

    const cache = this.getCache();
    const cacheKey = `role:${roleId}:permissions`;

    if (cache) {
      try {
        const cached = await cache.get<any[]>(cacheKey);
        if (cached) return cached;
      } catch {
        // Fallback
      }
    }

    const permissionsList = await this.repository.getRolePermissions(roleId);

    if (cache) {
      try {
        await cache.set(cacheKey, permissionsList, 3600);
      } catch {
        // Fallback
      }
    }

    return permissionsList;
  }

  async getPermissionRoles(permissionId: string): Promise<any[]> {
    const permRepo = this.getPermissionRepository();
    const perm = await permRepo.findPermissionById(permissionId);
    if (!perm) {
      throw new AppError(`Permission with ID ${permissionId} not found`, 404, "PERMISSION_NOT_FOUND");
    }

    return this.repository.getPermissionRoles(permissionId);
  }

  async replaceRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.getRoleById(roleId);
    if (role.isSystem) {
      throw new AppError("Cannot modify permissions of system protected role", 400, "SYSTEM_ROLE_PROTECTED");
    }

    if (permissionIds.length > 0) {
      const permRepo = this.getPermissionRepository();

      // Use findPermissionsByIds if available (optimized path), fallback to loop (legacy path)
      if (typeof permRepo.findPermissionsByIds === 'function') {
        // Optimize N+1 query: fetch all permissions in one go
        const perms = await permRepo.findPermissionsByIds(permissionIds);

        // Create a Set of found IDs for fast lookup
        const foundIds = new Set(perms.map((p: any) => p.id));

        // Check if any requested ID was not found
        for (const id of permissionIds) {
          if (!foundIds.has(id)) {
            throw new AppError(`Permission with ID ${id} not found`, 404, "PERMISSION_NOT_FOUND");
          }
        }
      } else {
        // Fallback for when the optimized method is not available on the repository
        for (const permissionId of permissionIds) {
          const perm = await permRepo.findPermissionById(permissionId);
          if (!perm) {
            throw new AppError(`Permission with ID ${permissionId} not found`, 404, "PERMISSION_NOT_FOUND");
          }
        }
      }
    }

    await this.repository.replacePermissions(roleId, permissionIds);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`role:${roleId}:permissions`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(ROLE_EVENTS.PERMISSIONS_REPLACED, { roleId, permissionIds });
    }
  }
}
export default RoleService;
