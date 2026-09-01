export interface CreateUsersModuleDto {
  name: string;
}

export interface UsersModuleRecord {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
