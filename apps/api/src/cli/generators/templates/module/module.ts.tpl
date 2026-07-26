import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { {{pascalName}}Repository } from "./{{normalizedName}}.repository.js";
import { {{pascalName}}Service } from "./{{normalizedName}}.service.js";
import { create{{pascalName}}Router } from "./{{normalizedName}}.router.js";

export class {{pascalName}}Module implements IModule {
  readonly name = "{{normalizedName}}";
  readonly version = "1.0.0";
  readonly description = "{{pascalName}} business capability module";

  routes?: Router;

  async register(kernel: Kernel): Promise<void> {
    kernel.logger.info("Registering {{pascalName}} Module...");

    // Register Repository and Service in the Container
    kernel.container.registerSingleton("{{camelName}}Repository", () => new {{pascalName}}Repository());
    kernel.container.registerSingleton(
      "{{camelName}}Service",
      (c) => new {{pascalName}}Service(c.resolve("{{camelName}}Repository"), kernel.events)
    );

    // Register module routes
    const service = kernel.container.resolve<{{pascalName}}Service>("{{camelName}}Service");
    this.routes = create{{pascalName}}Router(service);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("{{pascalName}} Module booted");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("{{pascalName}} Module shut down");
  }
}
