import { Logger } from '../utils/logger';

const logger = new Logger('MemoryConsolidationWorker');

interface ConsolidationConfig {
  intervalMs: number;              // How often to run (default 5 min)
  batchSize: number;               // Max entries to process per run
  enableSessionSummary: boolean;   // Generate end-of-session summaries
}

const DEFAULT_CONFIG: ConsolidationConfig = {
  intervalMs: 5 * 60 * 1000,
  batchSize: 100,
  enableSessionSummary: true,
};

export class MemoryConsolidationWorker {
  private timer: ReturnType<typeof setInterval> | null = null;
  private config: ConsolidationConfig;
  private runCount = 0;
  private lastRunAt: number | null = null;
  private onConsolidate: (() => void) | null = null;

  constructor(config: Partial<ConsolidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Register consolidation callback (called by AgentMemoryService)
  setConsolidationHandler(handler: () => void): void {
    this.onConsolidate = handler;
  }

  start(): void {
    if (this.timer) {
      logger.warn('Worker already running');
      return;
    }

    this.timer = setInterval(() => {
      this.run();
    }, this.config.intervalMs);

    logger.info(`Started (interval: ${this.config.intervalMs / 1000}s, batch: ${this.config.batchSize})`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info(`Stopped after ${this.runCount} runs`);
    }
  }

  // Manual trigger (useful for testing or end-of-session)
  runNow(): void {
    this.run();
  }

  private run(): void {
    const start = Date.now();
    this.runCount++;

    try {
      if (this.onConsolidate) {
        this.onConsolidate();
      }

      this.lastRunAt = Date.now();
      const duration = Date.now() - start;

      if (duration > 1000) {
        logger.warn(`Consolidation run #${this.runCount} took ${duration}ms (slow)`);
      } else {
        logger.debug(`Consolidation run #${this.runCount}: ${duration}ms`);
      }
    } catch (error) {
      logger.error(`Consolidation run #${this.runCount} failed`, error);
    }
  }

  getStats(): { running: boolean; runCount: number; lastRunAt: number | null; config: ConsolidationConfig } {
    return {
      running: this.timer !== null,
      runCount: this.runCount,
      lastRunAt: this.lastRunAt,
      config: this.config,
    };
  }
}
