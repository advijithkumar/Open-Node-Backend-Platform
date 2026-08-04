/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
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
import { DoctorService } from "../core/doctor/doctor.js";

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
      const modules = kernel.discovery.getModules().map((m: any) => m.name);
      console.table(modules);
    });
  
  // ──────  Providers command  ──────
  program
    .command("providers")
    .description("List all registered providers")
    .action(async () => {
      await bootstrapFramework();
      const discovery = container.resolve<any>(CORE_SERVICES.DISCOVERY);
      const providers = (await discovery.getProviders()).map((p: any) => p.name);
      console.table(providers);
    });

  // ────── Storage command ──────
  program
    .command("storage")
    .description("Show storage diagnostics")
    .action(async () => {
      await bootstrapFramework();
      const storage = container.resolve<any>(CORE_SERVICES.STORAGE);
      const diagnostics = storage.getDiagnostics();
      console.log("Storage Diagnostics:");
      console.table(diagnostics);
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

  // ────── Doctor command ──────
  program
    .command("doctor")
    .description("Inspect the health and configuration of the ONBP runtime")
    .option("--json", "Output diagnostic report in machine-readable JSON format")
    .action(async (options: { json?: boolean }) => {
      await bootstrapFramework();
      const doctor = new DoctorService();
      const report = await doctor.runDiagnostics();

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log("=========================================");
        console.log("    ONBP Framework Doctor & Diagnostics   ");
        console.log("=========================================");
        console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
        console.log(`Timestamp:      ${report.timestamp}`);
        console.log("-----------------------------------------");
        console.log("System Information:");
        console.log(`  OS Platform:  ${report.systemInfo.platform}`);
        console.log(`  OS Arch:      ${report.systemInfo.arch}`);
        console.log(`  Node Version: ${report.systemInfo.nodeVersion}`);
        console.log(`  Uptime:       ${report.systemInfo.uptime}s`);
        console.log(`  Memory Usage: ${report.systemInfo.memory.usagePercentage}%`);
        console.log("=========================================");
        console.log("Diagnostic Check Results:");
        console.log("-----------------------------------------");

        for (const res of report.results) {
          const statusIcon = res.status === "healthy" ? "✅" : res.status === "warning" ? "⚠️" : "❌";
          console.log(`${statusIcon} [${res.component}] Status: ${res.status.toUpperCase()} (Severity: ${res.severity.toUpperCase()})`);
          console.log(`   Message: ${res.message}`);
          if (res.recommendation) {
            console.log(`   Recommendation: ${res.recommendation}`);
          }
          if (res.details && Object.keys(res.details).length > 0) {
            console.log(`   Details:`, JSON.stringify(res.details));
          }
          console.log("-----------------------------------------");
        }
      }
      
      if (report.overallStatus === "critical") {
        process.exit(1);
      }
    });

program.parseAsync(process.argv);