import type { IWorkflowRegistry } from "./workflow.interface.js";
import type { WorkflowDefinition } from "./workflow.types.js";
import { WorkflowRegistryError, WorkflowValidationError } from "./workflow.errors.js";

export class WorkflowRegistry implements IWorkflowRegistry {
  private readonly workflows = new Map<string, WorkflowDefinition>();

  register(definition: WorkflowDefinition): void {
    if (!definition.name || definition.name.trim() === "") {
      throw new WorkflowValidationError("Workflow name must be a non-empty string.");
    }
    if (this.workflows.has(definition.name)) {
      throw new WorkflowRegistryError(`Workflow '${definition.name}' is already registered.`);
    }
    this.workflows.set(definition.name, definition);
  }

  get(name: string): WorkflowDefinition {
    const w = this.workflows.get(name);
    if (!w) {
      throw new WorkflowRegistryError(`Workflow '${name}' is not registered.`);
    }
    return w;
  }

  has(name: string): boolean {
    return this.workflows.has(name);
  }

  list(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  remove(name: string): void {
    if (!this.workflows.has(name)) {
      throw new WorkflowRegistryError(`Workflow '${name}' is not registered.`);
    }
    this.workflows.delete(name);
  }

  clear(): void {
    this.workflows.clear();
  }
}
export default WorkflowRegistry;
