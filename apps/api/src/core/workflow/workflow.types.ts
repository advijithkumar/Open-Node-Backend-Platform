/* eslint-disable @typescript-eslint/no-explicit-any */
export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface WorkflowRetryConfig {
  attempts: number;
  delay: number;
}

export interface WorkflowStepDefinition {
  name: string;
  action: string;
  dependsOn?: string[];
  timeout?: number;
  retry?: WorkflowRetryConfig;
}

export interface WorkflowDefinition {
  name: string;
  version: string;
  description?: string;
  steps: WorkflowStepDefinition[];
  metadata?: Record<string, any>;
}

export interface WorkflowStepResult {
  stepName: string;
  status: "completed" | "failed";
  output?: any;
  error?: string;
  duration: number;
}

export interface WorkflowResult {
  workflowName: string;
  executionId: string;
  status: WorkflowStatus;
  output: Record<string, any>;
  steps: WorkflowStepResult[];
  duration: number;
  error?: string;
}
