import { generateModule } from "./module-generator.js";
import { generatePlugin } from "./plugin-generator.js";

export async function runCLI(args: string[]): Promise<void> {
  const command = args[0];
  const name = args[1];

  if (!command || command === "--help" || command === "-h") {
    console.log(`
🚀 ONBP Command-Line Interface (CLI)

Usage:
  onbp generate:module <name>   Generate a new ONBP Module
  onbp generate:plugin <name>   Generate a new ONBP Plugin
  onbp --version               Show CLI version
`);
    return;
  }

  if (command === "generate:module") {
    if (!name) {
      console.error("❌ Error: Please provide a module name (e.g. onbp generate:module inventory)");
      process.exit(1);
    }
    const createdPath = await generateModule(name);
    console.log(`✅ Module generated successfully at: ${createdPath}`);
    return;
  }

  if (command === "generate:plugin") {
    if (!name) {
      console.error("❌ Error: Please provide a plugin name (e.g. onbp generate:plugin redis)");
      process.exit(1);
    }
    const createdPath = await generatePlugin(name);
    console.log(`✅ Plugin generated successfully at: ${createdPath}`);
    return;
  }

  console.error(`❌ Unknown command: ${command}`);
}

if (process.argv[1]?.includes("cli")) {
  runCLI(process.argv.slice(2));
}
