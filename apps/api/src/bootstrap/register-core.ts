import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";
import { EventBus } from "../core/events/index.js";
import { HOOK_SERVICES, HookManager } from "../core/hooks/index.js";
import { Kernel, KERNEL_SERVICES } from "../core/kernel/index.js";
import { LifecycleManager } from "../core/lifecycle/index.js";
import { logger } from "../core/logger/logger.js";
import { MODULE_SERVICES } from "../core/modules/module.constants.js";
import { ModuleManager } from "../core/modules/module.manager.js";
import { PLUGIN_SERVICES } from "../core/plugins/plugin.constants.js";
import { PluginManager } from "../core/plugins/plugin.manager.js";
import app from "../app.js";

// Import Phase 2 Platform Services
import { StorageService } from "../core/storage/index.js";
import { CacheService } from "../core/cache/index.js";
import { QueueManager } from "../core/queue/index.js";
import { SchedulerService } from "../core/scheduler/index.js";
import { AIService } from "../core/ai/index.js";
import { RouterManager } from "../core/router/index.js";
import { HealthManager } from "../core/health/index.js";
import { DiscoveryService } from "../core/discovery/index.js";
import { ConfigManager, env } from "../core/config/index.js";
import { ProviderManager } from "../core/provider/index.js";
import { AuthorizationService } from "../core/auth/index.js";

export async function registerCore(): Promise<void> {
  logger.info("Initializing ONBP Core Framework & Enterprise Platform Services...");

  const eventBus = new EventBus();
  const hookManager = new HookManager();
  const moduleManager = new ModuleManager();
  const pluginManager = new PluginManager();
  const lifecycleManager = new LifecycleManager();

  container.register(CORE_SERVICES.EVENT_BUS, eventBus);
  container.register(HOOK_SERVICES.REGISTRY, hookManager);
  container.register(MODULE_SERVICES.REGISTRY, moduleManager);
  container.register(PLUGIN_SERVICES.REGISTRY, pluginManager);
  container.register(CORE_SERVICES.LIFECYCLE, lifecycleManager);

  // Register Platform Services
  container.registerSingleton("authorizationService", () => new AuthorizationService());

  // Register Router Manager (core routing infrastructure)
  container.registerSingleton(CORE_SERVICES.ROUTER,   () => new RouterManager());
  container.registerSingleton(CORE_SERVICES.STORAGE,   () => new StorageService());
  container.registerSingleton(CORE_SERVICES.CACHE,    () => new CacheService());
  container.registerSingleton(CORE_SERVICES.QUEUE,    () => new QueueManager());
  container.registerSingleton(CORE_SERVICES.SCHEDULER, () => new SchedulerService());
  container.registerSingleton(CORE_SERVICES.AI,        () => new AIService());
  container.registerSingleton(CORE_SERVICES.HEALTH, () => new HealthManager());
  const configManager = new ConfigManager();
  configManager.load(env);
  configManager.freeze();
  container.register(CORE_SERVICES.CONFIG, configManager);
  container.registerSingleton(CORE_SERVICES.DISCOVERY, () => new DiscoveryService());
  container.registerSingleton(CORE_SERVICES.PROVIDER_MANAGER, () => new ProviderManager());

  const kernel = new Kernel(
    app,
    container,
    eventBus,
    hookManager,
    lifecycleManager,
    moduleManager,
    pluginManager,
    logger,
  );

  container.register(KERNEL_SERVICES.KERNEL, kernel);

  logger.info("✓ EventBus Registered");
  logger.info("✓ ModuleManager Registered");
  logger.info("✓ PluginManager Registered");
  logger.info("✓ HookManager Registered");
  logger.info("✓ Lifecycle Manager Registered");
  logger.info("✓ Storage Service Registered");
  logger.info("✓ Cache Service Registered");
  logger.info("✓ Queue System Registered");
  logger.info("✓ Scheduler Service Registered");
  logger.info("✓ AI Integration Service Registered");
  logger.info("✓ Health Manager Registered");
  logger.info("✓ Kernel Registered");
}
export default registerCore;
