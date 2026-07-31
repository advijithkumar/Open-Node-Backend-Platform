import type { PermissionRepository } from "./permissions.repository.js";
import { PERMISSION_EVENTS } from "./permissions.events.js";
import type { CreatePermissionDto, UpdatePermissionDto, PermissionRecord } from "./permissions.types.js";
import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IEventBus } from "../../core/events/event.interface.js";
import type { ICacheService } from "../../core/cache/cache.interface.js";
import { AppError } from "../../core/errors/app-error.js";

export class PermissionService {
  constructor(
    private readonly repository: PermissionRepository,
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

  async createPermission(data: CreatePermissionDto): Promise<PermissionRecord> {
    if (!/^[a-z0-9.:-]+$/.test(data.slug)) {
      throw new AppError("Permission slug must be lowercase containing only alphanumeric, dots, colons, or dashes", 400, "INVALID_SLUG_CONVENTION");
    }

    const existingName = await this.repository.findByName(data.name);
    if (existingName) {
      throw new AppError(`Permission name "${data.name}" already exists`, 400, "DUPLICATE_PERMISSION_NAME");
    }

    const existingSlug = await this.repository.findBySlug(data.slug);
    if (existingSlug) {
      throw new AppError(`Permission slug "${data.slug}" already exists`, 400, "DUPLICATE_PERMISSION_SLUG");
    }

    const perm = await this.repository.createPermission(data);

    if (this.eventBus) {
      await this.eventBus.emit(PERMISSION_EVENTS.CREATED, perm);
    }

    return perm;
  }

  async getPermissionById(id: string): Promise<PermissionRecord> {
    const cache = this.getCache();
    const cacheKey = `permission:${id}`;

    if (cache) {
      try {
        const cached = await cache.get<PermissionRecord>(cacheKey);
        if (cached) return cached;
      } catch {
        // Fallback
      }
    }

    const perm = await this.repository.findPermissionById(id);
    if (!perm) {
      throw new AppError(`Permission with ID ${id} not found`, 404, "PERMISSION_NOT_FOUND");
    }

    if (cache) {
      try {
        await cache.set(cacheKey, perm, 3600);
      } catch {
        // Fallback
      }
    }

    return perm;
  }

  async getPermissions(limit = 100, offset = 0): Promise<PermissionRecord[]> {
    return this.repository.findAllPermissions(limit, offset);
  }

  async updatePermission(id: string, data: UpdatePermissionDto): Promise<PermissionRecord> {
    await this.getPermissionById(id);

    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError(`Permission name "${data.name}" is already taken`, 400, "DUPLICATE_PERMISSION_NAME");
      }
    }

    if (data.slug) {
      if (!/^[a-z0-9.:-]+$/.test(data.slug)) {
        throw new AppError("Permission slug must be lowercase containing only alphanumeric, dots, colons, or dashes", 400, "INVALID_SLUG_CONVENTION");
      }
      const existing = await this.repository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError(`Permission slug "${data.slug}" is already taken`, 400, "DUPLICATE_PERMISSION_SLUG");
      }
    }

    const updated = await this.repository.updatePermission(id, data);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`permission:${id}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(PERMISSION_EVENTS.UPDATED, updated);
    }

    return updated;
  }

  async deletePermission(id: string): Promise<boolean> {
    const perm = await this.getPermissionById(id);
    
    // Protect system permissions
    const systemSlugs = ["users.read", "users.create", "users.update", "users.delete", "roles.read", "roles.manage", "settings.manage"];
    if (systemSlugs.includes(perm.slug)) {
      throw new AppError("Cannot delete system protected permission", 400, "SYSTEM_PERMISSION_PROTECTED");
    }

    const deleted = await this.repository.deletePermission(id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`permission:${id}`);
      } catch {
        // Fallback
      }
    }

    if (deleted && this.eventBus) {
      await this.eventBus.emit(PERMISSION_EVENTS.DELETED, perm);
    }

    return deleted;
  }

  async restorePermission(id: string): Promise<PermissionRecord> {
    const perm = await this.repository.findById(id);
    if (!perm) {
      throw new AppError(`Permission with ID ${id} not found`, 404, "PERMISSION_NOT_FOUND");
    }

    const restored = await this.repository.restore(id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`permission:${id}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(PERMISSION_EVENTS.RESTORED, restored);
    }

    return restored;
  }
}
export default PermissionService;
