/* eslint-disable @typescript-eslint/no-explicit-any */

export class WorkflowError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = "WorkflowError";
  }
}

export class WorkflowValidationError extends WorkflowError {
  constructor(message: string) {
    super(message, "WORKFLOW_VALIDATION_ERROR");
  }
}

export class WorkflowRegistryError extends WorkflowError {
  constructor(message: string) {
    super(message, "WORKFLOW_REGISTRY_ERROR");
  }
}

export class WorkflowExecutionError extends WorkflowError {
  constructor(message: string, details?: any) {
    super(message, "WORKFLOW_EXECUTION_ERROR", details);
  }
}

export class WorkflowDependencyError extends WorkflowError {
  constructor(message: string) {
    super(message, "WORKFLOW_DEPENDENCY_ERROR");
  }
}
