import { logger } from '@/lib/logger';
import { AGENT_EVENTS, createEvent, publish } from './agent-event-bus';

/**
 * Durable Workflow Runner — QStash Workflow-inspired multi-step execution.
 *
 * Enables agentic workflows with:
 * - Multi-step execution with context passing between steps
 * - Parallel fan-out / fan-in patterns
 * - Per-step retry & error isolation
 * - Automatic state persistence via context object
 *
 * Pattern learned from Upstash QStash Workflow (not code-copied).
 */

export interface WorkflowStep<TCtx = Record<string, unknown>> {
  name: string;
  /** Execute step, return updated context */
  run: (ctx: TCtx) => Promise<TCtx>;
  /** Optional: max retries for this step (default 2) */
  maxRetries?: number;
  /** Optional: delay before executing (ms) */
  delayMs?: number;
}

export interface WorkflowResult<TCtx = Record<string, unknown>> {
  workflowId: string;
  status: 'completed' | 'failed' | 'partial';
  context: TCtx;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  durationMs: number;
}

let workflowCounter = 0;

/**
 * Run a multi-step workflow sequentially with context passing.
 * Each step receives the context from the previous step.
 * Failed steps are retried per their config before failing the workflow.
 */
export async function runWorkflow<TCtx extends Record<string, unknown>>(
  name: string,
  steps: WorkflowStep<TCtx>[],
  initialContext: TCtx,
  opts?: { orgId?: string; userId?: string },
): Promise<WorkflowResult<TCtx>> {
  const workflowId = `wf_${++workflowCounter}_${Date.now()}`;
  const startTime = Date.now();
  const completedSteps: string[] = [];
  let context = { ...initialContext };

  logger.info(`[Workflow] Starting "${name}" (${workflowId}), ${steps.length} steps`);

  for (const step of steps) {
    // Optional delay before step
    if (step.delayMs && step.delayMs > 0) {
      await sleep(step.delayMs);
    }

    const maxRetries = step.maxRetries ?? 2;
    let succeeded = false;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        context = await step.run(context);
        succeeded = true;

        await publish(
          createEvent(
            AGENT_EVENTS.WORKFLOW_STEP_COMPLETED,
            workflowId,
            { step: step.name, attempt, workflowName: name },
            { orgId: opts?.orgId, userId: opts?.userId },
          ),
        );

        completedSteps.push(step.name);
        break;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (attempt === maxRetries) {
          logger.error(`[Workflow] Step "${step.name}" failed after ${attempt + 1} attempts: ${errorMsg}`);

          await publish(
            createEvent(
              AGENT_EVENTS.WORKFLOW_STEP_FAILED,
              workflowId,
              { step: step.name, error: errorMsg, attempts: attempt + 1, workflowName: name },
              { orgId: opts?.orgId, userId: opts?.userId },
            ),
          );

          return {
            workflowId,
            status: completedSteps.length > 0 ? 'partial' : 'failed',
            context,
            completedSteps,
            failedStep: step.name,
            error: errorMsg,
            durationMs: Date.now() - startTime,
          };
        }

        const delay = Math.min(500 * 2 ** attempt, 10_000);
        logger.warn(`[Workflow] Retry step "${step.name}" (${attempt + 1}/${maxRetries}) in ${delay}ms`);
        await sleep(delay);
      }
    }

    if (!succeeded) break;
  }

  await publish(
    createEvent(
      AGENT_EVENTS.WORKFLOW_COMPLETED,
      workflowId,
      { workflowName: name, steps: completedSteps.length, durationMs: Date.now() - startTime },
      { orgId: opts?.orgId, userId: opts?.userId },
    ),
  );

  logger.info(`[Workflow] "${name}" completed in ${Date.now() - startTime}ms`);

  return {
    workflowId,
    status: 'completed',
    context,
    completedSteps,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Run steps in parallel (fan-out), collect all results (fan-in).
 * All steps receive same input context, results merged into output context.
 */
export async function runParallelSteps<TCtx extends Record<string, unknown>>(
  steps: WorkflowStep<TCtx>[],
  context: TCtx,
): Promise<TCtx> {
  const results = await Promise.allSettled(
    steps.map(async (step) => {
      const maxRetries = step.maxRetries ?? 1;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await step.run({ ...context });
        } catch (error) {
          if (attempt === maxRetries) throw error;
          await sleep(500 * 2 ** attempt);
        }
      }
      throw new Error(`Step "${step.name}" exhausted retries`);
    }),
  );

  // Merge fulfilled results into context
  let merged = { ...context };
  for (const result of results) {
    if (result.status === 'fulfilled') {
      merged = { ...merged, ...result.value };
    }
  }

  return merged;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
