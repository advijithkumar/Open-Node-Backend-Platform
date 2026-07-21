import type { HookHandler } from "./hook.types.js";

export interface IHook {
  readonly name: string;
  readonly handler: HookHandler;
}