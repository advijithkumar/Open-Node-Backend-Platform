export interface CreateSettingDto {
  key: string;
  value: string;
  description?: string;
}

export interface UpdateSettingDto {
  value: string;
  description?: string;
}

export interface SettingRecord {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
