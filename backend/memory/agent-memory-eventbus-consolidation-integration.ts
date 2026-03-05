import { AgentMemoryService } from './agent-memory-service';
import { getTradingEventBus } from '../events/trading-event-bus-singleton-invoke-subscribe';
import { MemoryConsolidationWorker } from '../workers/memory-consolidation-worker';
import { Logger } from '../utils/logger';

const logger = new Logger('AgentMemoryIntegration');

let _instance: AgentMemoryIntegration | null = null;

export class AgentMemoryIntegration {
  private memoryService: AgentMemoryService;
  private worker: MemoryConsolidationWorker;
  private unsubscribers: (() => void)[] = [];

  constructor() {
    this.memoryService = new AgentMemoryService();
    this.worker = new MemoryConsolidationWorker();
  }

  start(): void {
    const bus = getTradingEventBus();

    // Listen for agent memory events on the event bus
    const unsub = bus.subscribe('agents:memory', (event) => {
      if (event.action === 'add') {
        this.memoryService.addMemory({
          agentId: event.agentId,
          sessionId: `session_${new Date().toISOString().slice(0, 10)}`,
          content: event.content,
          category: (event.category as 'trade' | 'signal' | 'risk' | 'market' | 'strategy' | 'error') || 'trade',
        });
      }
    });
    this.unsubscribers.push(unsub);

    // Wire consolidation worker to trigger memory service consolidation
    this.worker.setConsolidationHandler(() => {
      this.memoryService.startConsolidation();
    });
    this.worker.start();

    logger.info('Agent memory integration started');
  }

  stop(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.worker.stop();
    this.memoryService.stopConsolidation();
    logger.info('Agent memory integration stopped');
  }

  getMemoryService(): AgentMemoryService {
    return this.memoryService;
  }

  getStats(): { memory: ReturnType<AgentMemoryService['getStats']>; worker: ReturnType<MemoryConsolidationWorker['getStats']> } {
    return {
      memory: this.memoryService.getStats(),
      worker: this.worker.getStats(),
    };
  }
}

export function getAgentMemoryIntegration(): AgentMemoryIntegration {
  if (!_instance) {
    _instance = new AgentMemoryIntegration();
  }
  return _instance;
}
