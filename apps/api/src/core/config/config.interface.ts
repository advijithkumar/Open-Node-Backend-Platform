import type { ConfigDiagnostics } from "./config.types.js";

export interface IConfigManager {
  register<T>(key: string, value: T): void;
  set<T>(key: string, value: T): void;
  get<T = any>(key: string, defaultValue?: T): T;
  has(key: string): boolean;
  remove(key: string): void;
  getAll(): Record<string, any>;
  load(configObj: Record<string, any>): void;
  freeze(): void;
  reset(): void;
  getDiagnostics(): ConfigDiagnostics;
}
