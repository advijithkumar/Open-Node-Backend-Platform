/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../logger/logger.js";

export class WorkflowContext {
  private readonly outputs = new Map<string, any>();

  constructor(
    public readonly executionId: string,
    public readonly input: Record<string, any>,
    public readonly log = logger
  ) {}

  get<T = any>(stepName: string): T {
    return this.outputs.get(stepName);
  }

  set(stepName: string, value: any): void {
    this.outputs.set(stepName, value);
  }

  getAllOutputs(): Record<string, any> {
    return Object.fromEntries(this.outputs.entries());
  }
}
export default WorkflowContext;
