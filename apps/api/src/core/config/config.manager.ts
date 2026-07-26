import type { IConfigManager } from "./config.interface.js";
import type { ConfigDiagnostics } from "./config.types.js";

export class ConfigManager implements IConfigManager {
  private store: Record<string, any> = {};
  private isFrozen = false;

  private checkFrozen(): void {
    if (this.isFrozen) {
      throw new Error("Configuration is frozen and cannot be modified");
    }
  }

  register<T>(key: string, value: T): void {
    this.checkFrozen();
    if (this.has(key)) {
      throw new Error(`Configuration key "${key}" is already registered`);
    }
    this.set(key, value);
  }

  set<T>(key: string, value: T): void {
    this.checkFrozen();
    const parts = key.split(".");
    let current = this.store;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  get<T = any>(key: string, defaultValue?: T): T {
    const parts = key.split(".");
    let current = this.store;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== "object") {
        return defaultValue as T;
      }
      current = current[part];
    }
    return (current !== undefined ? current : defaultValue) as T;
  }

  has(key: string): boolean {
    const parts = key.split(".");
    let current = this.store;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== "object" || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    return true;
  }

  remove(key: string): void {
    this.checkFrozen();
    const parts = key.split(".");
    let current = this.store;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || typeof current[part] !== "object") {
        return;
      }
      current = current[part];
    }
    if (current && typeof current === "object") {
      delete current[parts[parts.length - 1]];
    }
  }

  getAll(): Record<string, any> {
    return JSON.parse(JSON.stringify(this.store));
  }

  load(configObj: Record<string, any>): void {
    this.checkFrozen();
    
    const deepMerge = (target: any, source: any) => {
      for (const key of Object.keys(source)) {
        if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== "object") {
            target[key] = {};
          }
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    deepMerge(this.store, JSON.parse(JSON.stringify(configObj)));
  }

  freeze(): void {
    this.isFrozen = true;
  }

  reset(): void {
    this.store = {};
    this.isFrozen = false;
  }

  getDiagnostics(): ConfigDiagnostics {
    const keys: string[] = [];
    const recurse = (obj: any, prefix = "") => {
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        for (const [k, v] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${k}` : k;
          keys.push(path);
          recurse(v, path);
        }
      }
    };
    recurse(this.store);

    return {
      frozen: this.isFrozen,
      keys,
    };
  }
}
