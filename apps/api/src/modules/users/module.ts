import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { UserRepository } from "./users.repository.js";
import { UserService } from "./users.service.js";
import { createUsersRouter } from "./users.router.js";
import { USER_EVENTS } from "./users.events.js";

export class UserModule implements IModule {
  readonly name = "users";
  readonly version = "1.0.0";
  readonly description = "User management module";
  readonly dependencies = [];

  routes?: Router;

  register(kernel: Kernel): void {
    kernel.logger.info("Registering Users Module...");

    // Register repository and service in Container
    kernel.container.registerSingleton("userRepository", () => new UserRepository());
    kernel.container.registerSingleton(
      "userService",
      (c) => new UserService(c.resolve("userRepository"), kernel.events)
    );

    // Register module routes
    const userService = kernel.container.resolve<UserService>("userService");
    this.routes = createUsersRouter(userService);

    // Register sample listeners
    kernel.events.on<any>(USER_EVENTS.CREATED, (data) => {
      kernel.logger.info(`Event [user.created] received for user ${data.id}`);
    });
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Users Module Booted successfully");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Users Module Shutdown successfully");
  }
}
export default UserModule;