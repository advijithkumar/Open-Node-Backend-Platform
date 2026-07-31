import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { RoleRepository } from "./roles.repository.js";
import { RoleService } from "./roles.service.js";
import { createRolesRouter } from "./roles.router.js";
import { ROLE_EVENTS } from "./roles.events.js";

export class RoleModule implements IModule {
  readonly name = "roles";
  readonly version = "1.0.0";
  readonly description = "Role management module — part of ONBP RBAC system";
  readonly dependencies = [];

  routes?: Router;

  register(kernel: Kernel): void {
    kernel.logger.info("Registering Roles Module...");

    kernel.container.registerSingleton("roleRepository", () => new RoleRepository());
    kernel.container.registerSingleton(
      "roleService",
      (c) => new RoleService(c.resolve("roleRepository"), kernel.events)
    );

    const roleService = kernel.container.resolve<RoleService>("roleService");
    this.routes = createRolesRouter(roleService);

    // Register sample listeners
    kernel.events.on<any>(ROLE_EVENTS.CREATED, (data) => {
      kernel.logger.info(`Event [role.created] received for role ${data.id}`);
    });
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Roles Module booted successfully");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Roles Module shutdown successfully");
  }
}
export default RoleModule;
