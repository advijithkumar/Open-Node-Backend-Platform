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
import { NotificationService } from "../core/notifications/index.js";
import { EmailNotificationProvider } from "../core/notifications/email-notification.provider.js";
import { EmailService, SmtpEmailProvider } from "../core/email/index.js";
import { QueueManager } from "../core/queue/index.js";
import { SchedulerService } from "../core/scheduler/index.js";
import { AIService, MockAIProvider } from "../core/ai/index.js";
import { WorkflowService } from "../core/workflow/index.js";
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
  container.registerSingleton(CORE_SERVICES.AI,        () => {
    const config = container.resolve<any>(CORE_SERVICES.CONFIG);
    const aiService = new AIService();
    const mockProvider = new MockAIProvider({
      model: config.get("ai.model"),
      apiKey: config.get("ai.apiKey"),
    });
    aiService.registerProvider(mockProvider);
    return aiService;
  });
  container.registerSingleton(CORE_SERVICES.HEALTH, () => new HealthManager());
  container.registerSingleton(CORE_SERVICES.NOTIFICATION, () => new NotificationService());
  container.registerSingleton(CORE_SERVICES.WORKFLOW, () => new WorkflowService());

  const healthManager = container.resolve<any>(CORE_SERVICES.HEALTH);
  healthManager.register("notification", async () => {
    try {
      const ns = container.resolve<any>(CORE_SERVICES.NOTIFICATION);
      const h = await ns.getHealth();
      return { success: h.status === "healthy", message: h.reason || "Healthy" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
  healthManager.register("ai", async () => {
    try {
      const aiService = container.resolve<any>(CORE_SERVICES.AI);
      const h = await aiService.health();
      return { success: h.status === "healthy", message: h.reason || "Healthy" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
  healthManager.register("workflow", async () => {
    try {
      const ws = container.resolve<any>(CORE_SERVICES.WORKFLOW);
      const status = container.has(CORE_SERVICES.WORKFLOW) && ws.registry ? "healthy" : "unhealthy";
      return { success: status === "healthy", message: "Workflow Engine is online." };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
  const configManager = new ConfigManager();
  configManager.load(env);
  configManager.set("email.smtp.host", process.env.SMTP_HOST || "localhost");
  configManager.set("email.smtp.port", parseInt(process.env.SMTP_PORT || "25", 10));
  configManager.set("email.smtp.username", process.env.SMTP_USERNAME || "");
  configManager.set("email.smtp.password", process.env.SMTP_PASSWORD || "");
  configManager.set("email.smtp.secure", process.env.SMTP_SECURE === "true");
  configManager.set("email.smtp.from", process.env.SMTP_FROM || "noreply@example.com");
  configManager.set("email.smtp.timeout", parseInt(process.env.SMTP_TIMEOUT || "3000", 10));
  configManager.set("ai.provider", process.env.AI_PROVIDER || "mock");
  configManager.set("ai.model", process.env.AI_MODEL || "mock-model");
  configManager.set("ai.apiKey", process.env.AI_API_KEY || "");
  configManager.set("ai.baseUrl", process.env.AI_BASE_URL || "");
  configManager.set("ai.timeout", parseInt(process.env.AI_TIMEOUT || "10000", 10));
  configManager.set("ai.maxTokens", parseInt(process.env.AI_MAX_TOKENS || "1000", 10));
  configManager.set("ai.temperature", parseFloat(process.env.AI_TEMPERATURE || "0.7"));
  configManager.freeze();
  container.register(CORE_SERVICES.CONFIG, configManager);

  // Register Email Service
  container.registerSingleton(CORE_SERVICES.EMAIL, () => {
    const config = container.resolve<any>(CORE_SERVICES.CONFIG);
    const emailService = new EmailService();
    const smtpConfig = {
      host: config.get("email.smtp.host"),
      port: config.get("email.smtp.port"),
      username: config.get("email.smtp.username"),
      password: config.get("email.smtp.password"),
      secure: config.get("email.smtp.secure"),
      from: config.get("email.smtp.from"),
      timeout: config.get("email.smtp.timeout"),
    };
    const smtpProvider = new SmtpEmailProvider(smtpConfig);
    emailService.registerProvider(smtpProvider);
    return emailService;
  });

  // Register EmailNotificationProvider to NotificationService
  const nsInstance = container.resolve<any>(CORE_SERVICES.NOTIFICATION);
  nsInstance.registerProvider(new EmailNotificationProvider());

  // Register Email Health Check
  healthManager.register("email", async () => {
    try {
      const emailService = container.resolve<any>(CORE_SERVICES.EMAIL);
      const h = await emailService.getHealth();
      return { success: h.status === "healthy", message: h.reason || "Healthy" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

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
  logger.info("✓ Notification Service Registered");
  logger.info("✓ Email Service Registered");
  logger.info("✓ Workflow System Registered");
  logger.info("✓ Kernel Registered");
}
export default registerCore;
