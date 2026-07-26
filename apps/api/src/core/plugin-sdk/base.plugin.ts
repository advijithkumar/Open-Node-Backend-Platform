import type { Container } from "../container/index.js";
import type { IPlugin } from "../plugins/plugin.interface.js";
import type { IProvider } from "../provider/provider.interface.js";

export abstract class BasePlugin implements IPlugin {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description?: string;
  readonly dependencies: string[] = [];
  readonly providers: IProvider[] = [];

  async register(_container: Container): Promise<void> {
    // Optional hook
  }

  async boot(): Promise<void> {
    // Optional hook
  }

  async shutdown(): Promise<void> {
    // Optional hook
  }
}
export default BasePlugin;
