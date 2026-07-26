// Router Manager – owns registration and mounting of module routers

import type { Express, Router } from "express";

export interface RouterRegistration {
  /**
   * Full URL prefix under which the router will be mounted, e.g. "/api/v1/users"
   */
  prefix: string;
  /** Express router instance */
  router: Router;
  /** Optional version label (e.g. "v1") – can be used for diagnostics */
  version?: string;
  /** Optional logical group name – useful for docs or health checks */
  group?: string;
}
export const ROUTER_SERVICES = {
  ROUTER: "router",
} as const;
/**
 * Central service that keeps track of all routers contributed by modules
 * and finally mounts them on the top‑level Express app.
 */
export class RouterManager {
  private readonly registry = new Map<string, RouterRegistration>();

  /** Register a router. Throws if the prefix is already used. */
  register(reg: RouterRegistration): void {
    if (this.registry.has(reg.prefix)) {
      throw new Error(`Router prefix "${reg.prefix}" already registered`);
    }
    this.registry.set(reg.prefix, reg);
  }

  /** Check whether a prefix has already been registered. */
  has(prefix: string): boolean {
    return this.registry.has(prefix);
  }

  /** Retrieve a registration (mainly for diagnostics). */
  get(prefix: string): RouterRegistration | undefined {
    return this.registry.get(prefix);
  }

  /** Mount all registered routers onto the provided Express app. */
  mountAll(app: Express): void {
    for (const { prefix, router } of this.registry.values()) {
      app.use(prefix, router);
    }
  }

  /** Simple diagnostics useful for the framework CLI. */
  getDiagnostics() {
    return Array.from(this.registry.entries()).map(([prefix, { version, group }]) => ({
      prefix,
      version: version ?? "-",
      group: group ?? "default",
    }));
  }
}
