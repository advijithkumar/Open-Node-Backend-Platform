export interface CreateOrganizationsDto {
  name: string;
}

export interface OrganizationsRecord {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
