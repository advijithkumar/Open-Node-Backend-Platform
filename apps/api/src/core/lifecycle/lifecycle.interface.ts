import type { LifecycleState } from "./lifecycle.types.js";

export interface ILifecycleManager {
  getState(): LifecycleState;

  setState(state: LifecycleState): void;

  is(state: LifecycleState): boolean;
}