export interface CreateUserDto {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  authUserId: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

export interface UserRecord {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
