export type HookContext = Record<string, unknown>;

export type HookHandler = (
  context: HookContext
) => Promise<void> | void;