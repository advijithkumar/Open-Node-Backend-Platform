import { container } from "../core/container/index.js";
import { KERNEL_SERVICES, type Kernel } from "../core/kernel/index.js";
import { logger } from "../core/logger/logger.js";
import { UserModule } from "../modules/users/module.js";
import { RoleModule } from "../modules/roles/module.js";
import { PermissionModule } from "../modules/permissions/module.js";
import { AuditModule } from "../modules/audit/module.js";

export async function registerModules() {
  logger.info("Registering Modules...");

  const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);

  // Load modules in dependency order
  await kernel.modules.load(new UserModule(), kernel);
  await kernel.modules.load(new RoleModule(), kernel);
  await kernel.modules.load(new PermissionModule(), kernel);
  await kernel.modules.load(new AuditModule(), kernel);
}
