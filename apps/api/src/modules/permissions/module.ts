import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { PermissionRepository } from "./permissions.repository.js";
import { PermissionService } from "./permissions.service.js";
import { createPermissionsRouter } from "./permissions.router.js";

export class PermissionModule implements IModule {
  readonly name = "permissions";
  readonly version = "1.0.0";
  readonly description = "Permission management module — part of ONBP RBAC system";
  readonly dependencies = [];

  routes?: Router;

  register(kernel: Kernel): void {
    kernel.logger.info("Registering Permissions Module...");

    kernel.container.registerSingleton("permissionRepository", () => new PermissionRepository());
    kernel.container.registerSingleton(
      "permissionService",
      (c) => new PermissionService(c.resolve("permissionRepository"))
    );

    const permissionService = kernel.container.resolve<PermissionService>("permissionService");
    this.routes = createPermissionsRouter(permissionService);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Permissions Module booted successfully");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Permissions Module shutdown successfully");
  }
}

export { PermissionService } from "./permissions.service.js";
export { PermissionRepository } from "./permissions.repository.js";
