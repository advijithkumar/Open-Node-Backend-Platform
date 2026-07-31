export interface CreatePermissionDto {
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
  isSystem?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface PermissionRecord {
  id: string;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string | null;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
export default {};
