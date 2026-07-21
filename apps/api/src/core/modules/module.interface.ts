import type { Router } from "express";
import type { Kernel } from "../kernel/index.js";

export interface IModule {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];
  
  routes?: Router;

  register?(kernel: Kernel): Promise<void> | void;
  boot?(kernel: Kernel): Promise<void> | void;
  shutdown?(kernel: Kernel): Promise<void> | void;
}
