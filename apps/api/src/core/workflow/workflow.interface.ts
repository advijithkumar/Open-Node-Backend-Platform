/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WorkflowDefinition, WorkflowResult } from "./workflow.types.js";
import type { IWorkflowStep } from "./workflow.step.js";

export interface IWorkflowRegistry {
  register(definition: WorkflowDefinition): void;
  get(name: string): WorkflowDefinition;
  has(name: string): boolean;
  list(): WorkflowDefinition[];
  remove(name: string): void;
  clear(): void;
}

export interface IWorkflowService {
  readonly registry: IWorkflowRegistry;
  registerStepAction(step: IWorkflowStep): void;
  registerWorkflow(definition: WorkflowDefinition): void;
  execute(workflowName: string, input?: Record<string, any>): Promise<WorkflowResult>;
  getDiagnostics(): {
    registered: number;
    executions: number;
    completed: number;
    failed: number;
  };
}
export type { IWorkflowStep };
