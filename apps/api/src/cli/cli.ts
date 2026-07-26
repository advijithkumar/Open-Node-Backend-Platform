
  import { program } from "commander";
import { registerCore } from "../bootstrap/register-core.js";
import { registerModules } from "../bootstrap/register-modules.js";
import { registerRoutes } from "../bootstrap/register-routes.js";
import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";
import { type Kernel, KERNEL_SERVICES } from "../core/kernel/index.js";
import { ModuleGenerator } from "./generators/module.generator.js";
import { PluginGenerator } from "./generators/plugin.generator.js";
import { ProviderGenerator } from "./generators/provider.generator.js";
import { AppGenerator } from "./generators/app.generator.js";

/* ------------------------------------------------------------------ */
/* Helper – fully bootstrap the framework before any command runs       */
async function bootstrapFramework() {
  await registerCore();
  await registerModules();
  await registerRoutes();
}

/* ------------------------------------------------------------------ */
/* generate:module <name> – scaffolds a minimal module skeleton        */
program
  .command("generate:module <name>")
  .description("Scaffold a new ONBP module")
  .action(async (name: string) => {
    try {
      await ModuleGenerator.generate(name);
    } catch (err: any) {
      console.error(`❌ Scaffolding failed: ${err.message}`);
      process.exit(1);
    }
  });

/* ------------------------------------------------------------------ */
/* generate:plugin <name> – scaffolds a minimal plugin skeleton        */
program
  .command("generate:plugin <name>")
  .description("Scaffold a new ONBP plugin")
  .action(async (name: string) => {
    try {
      await PluginGenerator.generate(name);
    } catch (err: any) {
      console.error(`❌ Scaffolding failed: ${err.message}`);
      process.exit(1);
    }
  });

/* ------------------------------------------------------------------ */
/* generate:provider <name> – scaffolds a minimal provider skeleton        */
program
  .command("generate:provider <name>")
  .description("Scaffold a new ONBP provider")
  .action(async (name: string) => {
    try {
      await ProviderGenerator.generate(name);
    } catch (err: any) {
      console.error(`❌ Scaffolding failed: ${err.message}`);
      process.exit(1);
    }
  });

/* ------------------------------------------------------------------ */
/* generate:app <name> – scaffolds a minimal app skeleton        */
program
  .command("generate:app <name>")
  .description("Scaffold a new ONBP application")
  .action(async (name: string) => {
    try {
      await AppGenerator.generate(name);
    } catch (err: any) {
      console.error(`❌ Scaffolding failed: ${err.message}`);
      process.exit(1);
    }
  });

  /* ------------------------------------------------------------------ */
  /* routes – list all routes that RouterManager has registered          */
  program
    .command("routes")
    .description("Show all routes registered via RouterManager")
    .action(async () => {
      await bootstrapFramework();
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      console.table(kernel.router.getDiagnostics());
    });

  /* ------------------------------------------------------------------ */
  /* health – run every health‑check registered in HealthRegistry        */
  program
    .command("health")
    .description("Execute health checks and print JSON result")
    .action(async () => {
      await bootstrapFramework();
      const health = container.resolve<any>(CORE_SERVICES.HEALTH);
      const result = await health.runAll();
      console.log(JSON.stringify(result, null, 2));
    });

  /* ------------------------------------------------------------------ */
  /* diagnostics – dump Kernel diagnostics (modules, plugins, etc.)     */
  program
    .command("diagnostics")
    .description("Print kernel diagnostics")
    .action(async () => {
      await bootstrapFramework();
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      console.log(JSON.stringify(kernel.getDiagnostics(), null, 2));
    });
  // ──────  Modules command  ──────
  program
    .command("modules")
    .description("List all registered modules")
    .action(async () => {
      await bootstrapFramework();
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      const modules = kernel.discovery?.modules?.map((m: any) => m.name) ?? [];
      console.table(modules);
    });
  
  // ──────  Providers command  ──────
  program
    .command("providers")
    .description("List all registered providers")
    .action(async () => {
      await bootstrapFramework();
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      // providerManager exposes a names getter (see below)
      const providers = kernel.provider?.names ?? [];
      console.table(providers);
    });

  // ────── Discovery command ──────
  program
    .command("discovery")
    .description("Print discovery diagnostics: modules, plugins, services, routes, summary")
    .action(async () => {
      await bootstrapFramework();
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      const discovery = kernel.discovery;
  
      console.log("Modules:");
      console.table(discovery.getModules());
  
      console.log("Plugins:");
      console.table(discovery.getPlugins());

      console.log("Providers:");
      console.table(await discovery.getProviders());
  
      console.log("Services:");
      console.table(discovery.getServices());
  
      console.log("Routes:");
      console.table(discovery.getRoutes());
  
      console.log("Summary:");
      console.log(await discovery.getSummary());
    });

program.parseAsync(process.argv);
