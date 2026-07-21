import { AppError } from "../../core/errors/app-error.js";
import type { RoleRepository } from "./roles.repository.js";

export interface CreateRoleData {
  name: string;
  slug: string;
  description?: string;
}

export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async createRole(data: CreateRoleData) {
    const existing = await this.roleRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError(`Role with slug "${data.slug}" already exists`, 409, "ROLE_CONFLICT");
    }
    return this.roleRepository.create(data as Record<string, unknown>);
  }

  async getRoleById(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new AppError(`Role with ID ${id} not found`, 404, "ROLE_NOT_FOUND");
    }
    return role;
  }

  async getRoles(limit = 50, offset = 0) {
    return this.roleRepository.findAll(limit, offset);
  }

  async updateRole(id: string, data: Partial<CreateRoleData>) {
    await this.getRoleById(id);
    return this.roleRepository.update(id, data as Record<string, unknown>);
  }

  async deleteRole(id: string) {
    await this.getRoleById(id);
    return this.roleRepository.softDelete(id);
  }
}
