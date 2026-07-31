import type { UserRepository } from "./users.repository.js";
import { USER_EVENTS } from "./users.events.js";
import type { CreateUserDto, UpdateUserDto, UserRecord } from "./users.types.js";
import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IEventBus } from "../../core/events/event.interface.js";
import type { ICacheService } from "../../core/cache/cache.interface.js";
import { AppError } from "../../core/errors/app-error.js";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus?: IEventBus
  ) {}

  private getCache(): ICacheService | undefined {
    try {
      if (container.has(CORE_SERVICES.CACHE)) {
        return container.resolve<ICacheService>(CORE_SERVICES.CACHE);
      }
    } catch {
      // Fallback
    }
    return undefined;
  }

  async createUser(data: CreateUserDto): Promise<UserRecord> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(`User with email "${data.email}" already exists`, 400, "DUPLICATE_EMAIL");
    }

    const user = await this.userRepository.createUser(data);

    if (this.eventBus) {
      await this.eventBus.emit(USER_EVENTS.CREATED, user);
    }

    return user;
  }

  async getUserById(id: string): Promise<UserRecord> {
    const cache = this.getCache();
    const cacheKey = `user:${id}`;

    if (cache) {
      try {
        const cached = await cache.get<UserRecord>(cacheKey);
        if (cached) return cached;
      } catch {
        // Fallback
      }
    }

    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404, "USER_NOT_FOUND");
    }

    if (cache) {
      try {
        await cache.set(cacheKey, user, 3600);
      } catch {
        // Fallback
      }
    }

    return user;
  }

  async getUsers(limit = 20, offset = 0): Promise<UserRecord[]> {
    return this.userRepository.findAllUsers(limit, offset);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserRecord> {
    await this.getUserById(id);

    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new AppError(`Email "${data.email}" is already taken`, 400, "DUPLICATE_EMAIL");
      }
    }

    const updated = await this.userRepository.updateUser(id, data);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`user:${id}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(USER_EVENTS.UPDATED, updated);
    }

    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.getUserById(id);
    const deleted = await this.userRepository.deleteUser(id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`user:${id}`);
      } catch {
        // Fallback
      }
    }

    if (deleted && this.eventBus) {
      await this.eventBus.emit(USER_EVENTS.DELETED, user);
    }

    return deleted;
  }

  async restoreUser(id: string): Promise<UserRecord> {
    // We bypass getUserById checking because it checks soft deleted records (isNull(deletedAt))
    // Let's resolve the user record to check existence
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404, "USER_NOT_FOUND");
    }

    const restored = await this.userRepository.restore(id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`user:${id}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(USER_EVENTS.RESTORED, restored);
    }

    return restored;
  }
}
export default UserService;
