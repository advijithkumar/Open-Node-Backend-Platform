import type { Container } from "../container/index.js";

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];

  register?(container: Container): Promise<void> | void;
  boot?(): Promise<void> | void;
  shutdown?(): Promise<void> | void;
}