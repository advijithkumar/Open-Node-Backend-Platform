import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { UserRepository } from "./users.repository.js";
import { UserService } from "./users.service.js";
import { createUsersRouter } from "./users.router.js";

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
      (c) => new UserService(c.resolve("userRepository"), kernel.events, kernel.hooks)
    );

    // Register module routes
    const userService = kernel.container.resolve<UserService>("userService");
    this.routes = createUsersRouter(userService);

    // Register sample listeners and hooks
    kernel.events.on<{ userId: string }>("user.created", (data) => {
      kernel.logger.info(`Event [user.created] received for user ${data.userId}`);
    });

    kernel.hooks.registerBefore("user:beforeCreate", (_ctx) => {
      kernel.logger.info("Hook [user:beforeCreate] executing...");
    });
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Users Module Booted successfully");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Users Module Shutdown successfully");
  }
}