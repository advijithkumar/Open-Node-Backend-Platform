import type { UserRepository } from "./users.repository.js";
import type { EventBus } from "../../core/events/index.js";
import type { HookManager } from "../../core/hooks/index.js";
import { AppError } from "../../core/errors/app-error.js";

export interface CreateUserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  authUserId: string;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  authUserId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus?: EventBus,
    private readonly hookManager?: HookManager
  ) {}

  async createUser(data: CreateUserData): Promise<UserRecord> {
    if (this.hookManager) {
      await this.hookManager.execute("user:beforeCreate", { data });
    }

    const payload: Record<string, unknown> = { ...data };
    const user = (await this.userRepository.create(payload)) as unknown as UserRecord;

    if (this.eventBus) {
      await this.eventBus.emit("user.created", { userId: user.id, email: user.email });
    }

    if (this.hookManager) {
      await this.hookManager.execute("user:afterCreate", { user });
    }

    return user;
  }

  async getUserById(id: string): Promise<UserRecord> {
    const user = (await this.userRepository.findById(id)) as unknown as UserRecord | undefined;
    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404, "USER_NOT_FOUND");
    }
    return user;
  }

  async getUsers(limit = 20, offset = 0): Promise<UserRecord[]> {
    return (await this.userRepository.findAll(limit, offset)) as unknown as UserRecord[];
  }

  async updateUser(id: string, data: Partial<CreateUserData>): Promise<UserRecord> {
    await this.getUserById(id);
    const payload: Record<string, unknown> = { ...data };
    const updated = (await this.userRepository.update(id, payload)) as unknown as UserRecord;
    if (this.eventBus) {
      await this.eventBus.emit("user.updated", { userId: id });
    }
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.getUserById(id);
    const deleted = await this.userRepository.softDelete(id);
    if (this.eventBus) {
      await this.eventBus.emit("user.deleted", { userId: id });
    }
    return deleted;
  }
}
