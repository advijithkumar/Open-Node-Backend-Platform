export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string;
  isSystem?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
