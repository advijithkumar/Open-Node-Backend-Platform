import type { Container } from "../container/index.js";
import type { IProvider } from "../provider/provider.interface.js";

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];
  readonly providers?: IProvider[];

  register?(container: Container): Promise<void> | void;
  boot?(): Promise<void> | void;
  shutdown?(): Promise<void> | void;
}