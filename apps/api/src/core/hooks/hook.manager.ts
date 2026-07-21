import type { HookContext, HookHandler } from "./hook.types.js";

export type HookStage = "before" | "after" | "around";

export interface RegisteredHook {
  handler: HookHandler;
  priority: number;
  stage: HookStage;
  condition?: (context: HookContext) => boolean | Promise<boolean>;
}

export class HookManager {
  private readonly hooks = new Map<string, RegisteredHook[]>();

  register(
    name: string,
    handler: HookHandler,
    options: { priority?: number; stage?: HookStage; condition?: (context: HookContext) => boolean | Promise<boolean> } = {}
  ): void {
    const stage = options.stage ?? "before";
    const priority = options.priority ?? 0;
    const condition = options.condition;

    const handlers = this.hooks.get(name) ?? [];
    handlers.push({ handler, priority, stage, condition });
    handlers.sort((a, b) => b.priority - a.priority);

    this.hooks.set(name, handlers);
  }

  registerBefore(name: string, handler: HookHandler, priority = 0): void {
    this.register(name, handler, { stage: "before", priority });
  }

  registerAfter(name: string, handler: HookHandler, priority = 0): void {
    this.register(name, handler, { stage: "after", priority });
  }

  registerAround(name: string, handler: HookHandler, priority = 0): void {
    this.register(name, handler, { stage: "around", priority });
  }

  async execute(name: string, context: HookContext): Promise<void> {
    const list = this.hooks.get(name);
    if (!list || list.length === 0) return;

    // Filter by condition
    const activeHooks: RegisteredHook[] = [];
    for (const h of list) {
      if (!h.condition || (await h.condition(context))) {
        activeHooks.push(h);
      }
    }

    const beforeHooks = activeHooks.filter((h) => h.stage === "before");
    const aroundHooks = activeHooks.filter((h) => h.stage === "around");
    const afterHooks = activeHooks.filter((h) => h.stage === "after");

    // Execute before hooks
    for (const h of beforeHooks) {
      await h.handler(context);
    }

    // Execute around hooks in sequence wrapping execution
    for (const h of aroundHooks) {
      await h.handler(context);
    }

    // Execute after hooks
    for (const h of afterHooks) {
      await h.handler(context);
    }
  }

  has(name: string): boolean {
    return this.hooks.has(name) && (this.hooks.get(name)?.length ?? 0) > 0;
  }

  clear(): void {
    this.hooks.clear();
  }
}