/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WorkflowContext } from "./workflow.context.js";

export interface IWorkflowStep<TInput = any, TOutput = any> {
  readonly name: string;
  execute(context: WorkflowContext, input: TInput): Promise<TOutput>;
}

/**
 * Execute a step action with optional timeout and retry logic
 */
export async function executeStepWithRetryAndTimeout<TInput = any, TOutput = any>(
  step: IWorkflowStep<TInput, TOutput>,
  context: WorkflowContext,
  input: TInput,
  timeoutMs?: number,
  retryConfig?: { attempts: number; delay: number }
): Promise<TOutput> {
  let attempt = 0;
  const maxAttempts = retryConfig && retryConfig.attempts > 0 ? retryConfig.attempts : 1;
  const delayMs = retryConfig && retryConfig.delay > 0 ? retryConfig.delay : 0;

  while (true) {
    attempt++;
    try {
      if (timeoutMs && timeoutMs > 0) {
        return await runWithTimeout(step.execute(context, input), timeoutMs);
      } else {
        return await step.execute(context, input);
      }
    } catch (err: any) {
      context.log.warn(
        { step: step.name, attempt, maxAttempts, error: err.message },
        "Step execution attempt failed"
      );
      if (attempt >= maxAttempts) {
        throw err;
      }
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}

function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Step execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
