export interface CreateAuthModuleDto {
  name: string;
}

export interface AuthModuleRecord {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
