import type { Container } from "../../core/container/index.js";
import type { IPlugin } from "../../core/plugins/plugin.interface.js";
import { {{pascalName}}Provider } from "./provider.js";
import { config } from "./config.js";

export class {{pascalName}}Plugin implements IPlugin {
  readonly name = "{{name}}";
  readonly version = "1.0.0";
  readonly description = "{{pascalName}} integration plugin";
  readonly dependencies: string[] = [];
  readonly providers = [new {{pascalName}}Provider()];

  async register(_container: Container): Promise<void> {
    // Register plugin specific services to container
  }

  async boot(): Promise<void> {
    // Perform boot tasks using config
    if (config.enabled) {
      // plugin endpoint: config.endpoint
    }
  }

  async shutdown(): Promise<void> {
    // Perform cleanup
  }
}
