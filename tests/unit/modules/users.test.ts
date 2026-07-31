import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../../../apps/api/src/modules/users/users.service.js";
import { USER_EVENTS } from "../../../apps/api/src/modules/users/users.events.js";
import { createUserSchema, updateUserSchema } from "../../../apps/api/src/modules/users/users.validation.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Users Module Unit Tests", () => {
  let repository: any;
  let eventBus: any;
  let cache: any;
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findAllUsers: vi.fn(),
      findUserById: vi.fn(),
      findByEmail: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      restore: vi.fn(),
      findById: vi.fn(),
    };

    eventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // Mock global container has/resolve for cache
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.CACHE);
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.CACHE);
    container.registerSingleton(CORE_SERVICES.CACHE, () => cache);

    service = new UserService(repository, eventBus);
  });

  describe("Validation", () => {
    it("should validate valid CreateUserDto", () => {
      const valid = {
        body: {
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          email: "john@example.com",
          authUserId: "auth-123"
        }
      };
      const parsed = createUserSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("should reject CreateUserDto with missing fields", () => {
      const invalid = { body: { firstName: "", email: "not-an-email" } };
      const parsed = createUserSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Service", () => {
    it("should find all users", async () => {
      const list = [{ id: "1", username: "u1" }];
      repository.findAllUsers.mockResolvedValue(list);

      const result = await service.getUsers();
      expect(result).toBe(list);
      expect(repository.findAllUsers).toHaveBeenCalled();
    });

    it("should find by id using cache when available", async () => {
      const record = { id: "1", username: "u1" };
      repository.findUserById.mockResolvedValue(record);

      const result = await service.getUserById("1");
      expect(result).toBe(record);
      expect(cache.get).toHaveBeenCalledWith("user:1");
      expect(cache.set).toHaveBeenCalledWith("user:1", record, 3600);
    });

    it("should resolve from cache directly on cache hit", async () => {
      const record = { id: "1", username: "u1" };
      cache.get.mockResolvedValue(record);

      const result = await service.getUserById("1");
      expect(result).toBe(record);
      expect(repository.findUserById).not.toHaveBeenCalled();
    });

    it("should prevent duplicate emails on creation", async () => {
      repository.findByEmail.mockResolvedValue({ id: "1", email: "dup@example.com" });

      await expect(service.createUser({
        firstName: "J",
        lastName: "D",
        username: "jd",
        email: "dup@example.com",
        authUserId: "auth-1"
      })).rejects.toThrow("User with email \"dup@example.com\" already exists");
    });

    it("should create user and publish events", async () => {
      const dto = { firstName: "J", lastName: "D", username: "jd", email: "new@example.com", authUserId: "auth-2" };
      const created = { ...dto, id: "2", isActive: true, version: 1 };
      repository.findByEmail.mockResolvedValue(undefined);
      repository.createUser.mockResolvedValue(created);

      const result = await service.createUser(dto);
      expect(result).toBe(created);
      expect(eventBus.emit).toHaveBeenCalledWith(USER_EVENTS.CREATED, created);
    });

    it("should update user, invalidate cache, and emit event", async () => {
      const existing = { id: "1", username: "old" };
      const updated = { id: "1", username: "new" };
      repository.findUserById.mockResolvedValue(existing);
      repository.updateUser.mockResolvedValue(updated);

      const result = await service.updateUser("1", { username: "new" });
      expect(result).toBe(updated);
      expect(cache.delete).toHaveBeenCalledWith("user:1");
      expect(eventBus.emit).toHaveBeenCalledWith(USER_EVENTS.UPDATED, updated);
    });

    it("should delete user, invalidate cache, and emit event", async () => {
      const existing = { id: "1", username: "u" };
      repository.findUserById.mockResolvedValue(existing);
      repository.deleteUser.mockResolvedValue(true);

      const result = await service.deleteUser("1");
      expect(result).toBe(true);
      expect(cache.delete).toHaveBeenCalledWith("user:1");
      expect(eventBus.emit).toHaveBeenCalledWith(USER_EVENTS.DELETED, existing);
    });

    it("should restore user, invalidate cache, and emit event", async () => {
      const existing = { id: "1", username: "u" };
      const restored = { id: "1", username: "u", deletedAt: null, isActive: true };
      repository.findById.mockResolvedValue(existing);
      repository.restore.mockResolvedValue(restored);

      const result = await service.restoreUser("1");
      expect(result).toBe(restored);
      expect(cache.delete).toHaveBeenCalledWith("user:1");
      expect(eventBus.emit).toHaveBeenCalledWith(USER_EVENTS.RESTORED, restored);
    });
  });
});
