export interface Create{{pascalName}}Dto {
  name: string;
}

export interface {{pascalName}}Record {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
