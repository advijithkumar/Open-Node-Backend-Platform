/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import type { WorkflowDefinition, WorkflowResult, WorkflowStepResult, WorkflowStepDefinition } from "./workflow.types.js";
import { WorkflowRegistry } from "./workflow.registry.js";
import { WorkflowContext } from "./workflow.context.js";
import { executeStepWithRetryAndTimeout, type IWorkflowStep } from "./workflow.step.js";
import { WorkflowValidationError, WorkflowDependencyError } from "./workflow.errors.js";
import { WORKFLOW_EVENTS } from "./workflow.constants.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { logger } from "../logger/logger.js";

export class WorkflowService {
  public readonly registry = new WorkflowRegistry();
  private readonly stepActions = new Map<string, IWorkflowStep>();
  
  // Diagnostics statistics
  private registeredCount = 0;
  private executionsCount = 0;
  private completedCount = 0;
  private failedCount = 0;

  private getEventBus(): any {
    try {
      if (container.has(CORE_SERVICES.EVENT_BUS)) {
        return container.resolve(CORE_SERVICES.EVENT_BUS);
      }
    } catch {
      // Fallback for tests
    }
    return undefined;
  }

  registerStepAction(step: IWorkflowStep): void {
    if (this.stepActions.has(step.name)) {
      throw new WorkflowValidationError(`Workflow step action '${step.name}' is already registered.`);
    }
    this.stepActions.set(step.name, step);
    logger.info(`Workflow step action registered: ${step.name}`);
  }

  registerWorkflow(definition: WorkflowDefinition): void {
    this.registry.register(definition);
    this.registeredCount++;
  }

  async execute(workflowName: string, input: Record<string, any> = {}): Promise<WorkflowResult> {
    const definition = this.registry.get(workflowName);
    const executionId = uuidv4();
    const context = new WorkflowContext(executionId, input);
    const startWorkflowTime = Date.now();
    
    this.executionsCount++;
    this.triggerEvent(WORKFLOW_EVENTS.STARTED, { workflowName, executionId, input });

    // 1. Resolve and Sort Steps
    let sortedSteps: WorkflowStepDefinition[];
    try {
      sortedSteps = this.resolveExecutionOrder(definition);
    } catch (err: any) {
      this.failedCount++;
      const result: WorkflowResult = {
        workflowName,
        executionId,
        status: "failed",
        output: {},
        steps: [],
        duration: Date.now() - startWorkflowTime,
        error: err.message,
      };
      this.triggerEvent(WORKFLOW_EVENTS.FAILED, { workflowName, executionId, error: err.message, duration: result.duration });
      throw err;
    }

    const stepResults: WorkflowStepResult[] = [];
    let workflowStatus: "completed" | "failed" = "completed";
    let workflowError: string | undefined;

    // 2. Sequential Step Execution
    for (const stepDef of sortedSteps) {
      const stepAction = this.stepActions.get(stepDef.action);
      const stepStartTime = Date.now();

      if (!stepAction) {
        workflowStatus = "failed";
        workflowError = `Action '${stepDef.action}' not found in registered step actions.`;
        const stepDuration = Date.now() - stepStartTime;
        stepResults.push({
          stepName: stepDef.name,
          status: "failed",
          error: workflowError,
          duration: stepDuration,
        });
        this.triggerEvent(WORKFLOW_EVENTS.STEP_FAILED, { workflowName, executionId, stepName: stepDef.name, error: workflowError, duration: stepDuration });
        break;
      }

      this.triggerEvent(WORKFLOW_EVENTS.STEP_STARTED, { workflowName, executionId, stepName: stepDef.name });

      try {
        const stepInput = context.getAllOutputs(); // Propagate output state of prior steps
        const stepOutput = await executeStepWithRetryAndTimeout(
          stepAction,
          context,
          stepInput,
          stepDef.timeout,
          stepDef.retry
        );
        
        context.set(stepDef.name, stepOutput);
        const stepDuration = Date.now() - stepStartTime;
        
        stepResults.push({
          stepName: stepDef.name,
          status: "completed",
          output: stepOutput,
          duration: stepDuration,
        });

        this.triggerEvent(WORKFLOW_EVENTS.STEP_COMPLETED, { workflowName, executionId, stepName: stepDef.name, duration: stepDuration });
      } catch (err: any) {
        workflowStatus = "failed";
        workflowError = err.message;
        const stepDuration = Date.now() - stepStartTime;
        
        stepResults.push({
          stepName: stepDef.name,
          status: "failed",
          error: err.message,
          duration: stepDuration,
        });

        this.triggerEvent(WORKFLOW_EVENTS.STEP_FAILED, { workflowName, executionId, stepName: stepDef.name, error: err.message, duration: stepDuration });
        break; // Stop sequential execution on failure
      }
    }

    const duration = Date.now() - startWorkflowTime;
    const finalResult: WorkflowResult = {
      workflowName,
      executionId,
      status: workflowStatus,
      output: context.getAllOutputs(),
      steps: stepResults,
      duration,
      error: workflowError,
    };

    if (workflowStatus === "completed") {
      this.completedCount++;
      this.triggerEvent(WORKFLOW_EVENTS.COMPLETED, { workflowName, executionId, output: finalResult.output, duration });
    } else {
      this.failedCount++;
      this.triggerEvent(WORKFLOW_EVENTS.FAILED, { workflowName, executionId, error: workflowError, duration });
    }

    return finalResult;
  }

  private resolveExecutionOrder(definition: WorkflowDefinition): WorkflowStepDefinition[] {
    const steps = definition.steps;
    const stepNames = new Set(steps.map((s) => s.name));

    // Validate duplicate step names
    if (stepNames.size !== steps.length) {
      throw new WorkflowValidationError("Workflow step definitions contain duplicate step names.");
    }

    // Verify dependencies existence
    for (const step of steps) {
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          if (!stepNames.has(dep)) {
            throw new WorkflowDependencyError(`Step '${step.name}' depends on non-existent step '${dep}'.`);
          }
        }
      }
    }

    // Topological Sort (Kahn's Algorithm)
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    for (const step of steps) {
      inDegree.set(step.name, 0);
      adjList.set(step.name, []);
    }

    for (const step of steps) {
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          // Edge goes from dependency (dep) to dependent (step.name)
          adjList.get(dep)!.push(step.name);
          inDegree.set(step.name, inDegree.get(step.name)! + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [name, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(name);
      }
    }

    const sortedOrder: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      sortedOrder.push(u);

      const neighbors = adjList.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    if (sortedOrder.length !== steps.length) {
      throw new WorkflowDependencyError("Circular dependency detected within workflow steps.");
    }

    // Return step definitions sorted topologically
    const stepMap = new Map<string, WorkflowStepDefinition>(steps.map((s) => [s.name, s]));
    return sortedOrder.map((name) => stepMap.get(name)!);
  }

  private triggerEvent(eventName: string, payload: any): void {
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit(eventName, payload)).catch((err) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Failed to trigger workflow event ${eventName}: ${errorMessage}`, err);
      });
    }
  }

  getDiagnostics() {
    return {
      registered: this.registeredCount,
      executions: this.executionsCount,
      completed: this.completedCount,
      failed: this.failedCount,
    };
  }
}
export default WorkflowService;
