# Workflow Runtime Engine

The `WorkflowEngine` is responsible for loading definitions, validating contexts, processing steps, evaluating conditions, and persisting history.

## Runtime Pipeline
1. **Initialize Context**: Sets up execution states and merges external inputs.
2. **Retrieve Step**: Loads current step definition.
3. **Resolve Action**: Resolves the action processor from the registry.
4. **Execute Step**: Executes the action task (supporting async/sync execution).
5. **Evaluate Conditional Branching**: Decides next step using the step `condition` handler.
6. **Log Transitions**: Publishes step details to the EventBus.
