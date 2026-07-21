import { AppError } from "../../core/errors/app-error.js";
import type { PermissionRepository } from "./permissions.repository.js";

export interface CreatePermissionData {
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async createPermission(data: CreatePermissionData) {
    const existing = await this.permissionRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError(
        `Permission with slug "${data.slug}" already exists`,
        409,
        "PERMISSION_CONFLICT"
      );
    }
    return this.permissionRepository.create(data as Record<string, unknown>);
  }

  async getPermissionById(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new AppError(`Permission with ID ${id} not found`, 404, "PERMISSION_NOT_FOUND");
    }
    return permission;
  }

  async getPermissions(limit = 100, offset = 0) {
    return this.permissionRepository.findAll(limit, offset);
  }

  async updatePermission(id: string, data: Partial<CreatePermissionData>) {
    await this.getPermissionById(id);
    return this.permissionRepository.update(id, data as Record<string, unknown>);
  }

  async deletePermission(id: string) {
    await this.getPermissionById(id);
    return this.permissionRepository.softDelete(id);
  }
}
