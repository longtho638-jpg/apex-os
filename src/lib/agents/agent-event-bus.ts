import { logger } from '@/lib/logger';

type EventHandler = (payload: AgentEvent) => void | Promise<void>;

export interface AgentEvent {
  type: string;
  agentId: string;
  orgId?: string;
  userId?: string;
  timestamp: number;
  data: Record<string, unknown>;
  /** Deduplication ID — prevents duplicate processing */
  deduplicationId?: string;
  /** Retry config for this event */
  retryConfig?: RetryConfig;
}

export interface RetryConfig {
  maxRetries: number;
  /** Backoff delays in ms per attempt (exponential if not specified) */
  delays?: number[];
}

interface DLQEntry {
  event: AgentEvent;
  error: string;
  failedAt: number;
  attempts: number;
}

const handlers = new Map<string, Set<EventHandler>>();
/** Track processed dedup IDs (TTL-based cleanup) */
const processedIds = new Map<string, number>();
/** Dead Letter Queue for failed events after max retries */
const deadLetterQueue: DLQEntry[] = [];
/** Delayed event timers */
const delayedTimers = new Map<string, NodeJS.Timeout>();

const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 min dedup window
const DEFAULT_MAX_RETRIES = 3;

export function subscribe(eventType: string, handler: EventHandler): () => void {
  if (!handlers.has(eventType)) {
    handlers.set(eventType, new Set());
  }
  handlers.get(eventType)?.add(handler);

  return () => {
    handlers.get(eventType)?.delete(handler);
  };
}

/**
 * Publish event with QStash-inspired guaranteed delivery:
 * - Deduplication: skip if same deduplicationId processed recently
 * - Retry with exponential backoff on handler failure
 * - Dead Letter Queue after max retries exhausted
 */
export async function publish(event: AgentEvent): Promise<void> {
  // Deduplication check
  if (event.deduplicationId) {
    const lastProcessed = processedIds.get(event.deduplicationId);
    if (lastProcessed && Date.now() - lastProcessed < DEDUP_TTL_MS) {
      logger.info(`[EventBus] Dedup skip: ${event.type} (id: ${event.deduplicationId})`);
      return;
    }
    processedIds.set(event.deduplicationId, Date.now());
  }

  const eventHandlers = handlers.get(event.type);
  if (!eventHandlers || eventHandlers.size === 0) {
    logger.info(`[EventBus] No handlers for event: ${event.type}`);
    return;
  }

  const maxRetries = event.retryConfig?.maxRetries ?? DEFAULT_MAX_RETRIES;

  const promises = Array.from(eventHandlers).map(async (handler) => {
    await executeWithRetry(handler, event, maxRetries, event.retryConfig?.delays);
  });

  await Promise.allSettled(promises);

  // Periodic dedup cleanup
  cleanupDedupCache();
}

/**
 * Publish event with delay (QStash scheduled delivery pattern).
 * Event fires after delayMs milliseconds.
 */
export function publishDelayed(event: AgentEvent, delayMs: number): string {
  const timerId = `${event.type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const timer = setTimeout(async () => {
    delayedTimers.delete(timerId);
    await publish(event);
  }, delayMs);

  delayedTimers.set(timerId, timer);
  logger.info(`[EventBus] Scheduled ${event.type} in ${delayMs}ms (timer: ${timerId})`);
  return timerId;
}

/** Cancel a delayed event */
export function cancelDelayed(timerId: string): boolean {
  const timer = delayedTimers.get(timerId);
  if (timer) {
    clearTimeout(timer);
    delayedTimers.delete(timerId);
    return true;
  }
  return false;
}

/** Execute handler with exponential backoff retry */
async function executeWithRetry(
  handler: EventHandler,
  event: AgentEvent,
  maxRetries: number,
  customDelays?: number[],
): Promise<void> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await handler(event);
      return; // Success
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (attempt === maxRetries) {
        // Max retries exhausted → DLQ
        deadLetterQueue.push({
          event,
          error: errorMsg,
          failedAt: Date.now(),
          attempts: attempt + 1,
        });
        logger.error(`[EventBus] DLQ: ${event.type} after ${attempt + 1} attempts: ${errorMsg}`);
        return;
      }

      // Calculate backoff delay
      const delay = customDelays?.[attempt] ?? Math.min(1000 * 2 ** attempt, 30_000);
      logger.warn(`[EventBus] Retry ${attempt + 1}/${maxRetries} for ${event.type} in ${delay}ms: ${errorMsg}`);
      await sleep(delay);
    }
  }
}

/** Get DLQ entries for inspection/replay */
export function getDLQ(): ReadonlyArray<DLQEntry> {
  return deadLetterQueue;
}

/** Replay a DLQ entry (re-publish the failed event) */
export async function replayDLQEntry(index: number): Promise<boolean> {
  const entry = deadLetterQueue[index];
  if (!entry) return false;

  // Remove dedup ID so it can be reprocessed
  if (entry.event.deduplicationId) {
    processedIds.delete(entry.event.deduplicationId);
  }

  deadLetterQueue.splice(index, 1);
  await publish(entry.event);
  return true;
}

/** Replay all DLQ entries */
export async function replayAllDLQ(): Promise<number> {
  const count = deadLetterQueue.length;
  // Process in reverse to maintain indices
  for (let i = count - 1; i >= 0; i--) {
    await replayDLQEntry(i);
  }
  return count;
}

// Pre-defined event types for agentic workflows
export const AGENT_EVENTS = {
  // Trading lifecycle
  TRADE_EXECUTED: 'trade.executed',
  TRADE_COMMISSION_CALCULATED: 'trade.commission.calculated',
  TRADE_SETTLED: 'trade.settled',

  // Tier & gamification
  TIER_UPGRADED: 'tier.upgraded',
  BADGE_EARNED: 'badge.earned',

  // Financial flows
  WITHDRAWAL_REQUESTED: 'withdrawal.requested',
  WITHDRAWAL_APPROVED: 'withdrawal.approved',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
  DEPOSIT_RECEIVED: 'deposit.received',

  // Agent lifecycle
  SIGNAL_GENERATED: 'signal.generated',
  AGENT_STARTED: 'agent.started',
  AGENT_STOPPED: 'agent.stopped',
  AGENT_ERROR: 'agent.error',

  // Multi-org
  ORG_CREATED: 'org.created',
  ORG_MEMBER_ADDED: 'org.member.added',

  // Workflow orchestration
  WORKFLOW_STEP_COMPLETED: 'workflow.step.completed',
  WORKFLOW_STEP_FAILED: 'workflow.step.failed',
  WORKFLOW_COMPLETED: 'workflow.completed',

  // Referral
  REFERRAL_SIGNUP: 'referral.signup',
} as const;

export type AgentEventType = (typeof AGENT_EVENTS)[keyof typeof AGENT_EVENTS];

export function createEvent(
  type: AgentEventType,
  agentId: string,
  data: Record<string, unknown>,
  opts?: { orgId?: string; userId?: string; deduplicationId?: string; retryConfig?: RetryConfig },
): AgentEvent {
  return {
    type,
    agentId,
    orgId: opts?.orgId,
    userId: opts?.userId,
    timestamp: Date.now(),
    data,
    deduplicationId: opts?.deduplicationId,
    retryConfig: opts?.retryConfig,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanupDedupCache(): void {
  const now = Date.now();
  for (const [id, ts] of processedIds) {
    if (now - ts > DEDUP_TTL_MS) {
      processedIds.delete(id);
    }
  }
}
