import type { ILifecycleManager } from "./lifecycle.interface.js";
import type { LifecycleState } from "./lifecycle.types.js";

export class LifecycleManager implements ILifecycleManager {
  private state: LifecycleState = "CREATED";

  getState(): LifecycleState {
    return this.state;
  }

  setState(state: LifecycleState): void {
    this.state = state;
  }

  is(state: LifecycleState): boolean {
    return this.state === state;
  }
}