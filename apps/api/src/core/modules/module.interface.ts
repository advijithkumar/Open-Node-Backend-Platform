import type { Kernel } from "../kernel/index.js";
import type { Router } from "express";

export interface IModule {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];
  
  register?(kernel: Kernel): Promise<void> | void;
  /**
   * Optional Express router exported by the module. The framework will mount it
   * automatically under the `/api/v1/<module.name>` namespace.
   */
  routes?: Router;
  boot?(kernel: Kernel): Promise<void> | void;
  shutdown?(kernel: Kernel): Promise<void> | void;
}
