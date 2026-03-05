export type PhaseStatus = 'completed' | 'in-progress' | 'pending' | 'blocked' | 'missing-ui';

export interface SunTzuPrinciple {
  chinese: string;
  english: string;
  meaning: string;
}

export interface StrategyPhase {
  id: number;
  name: string;
  description: string;
  status: PhaseStatus;
  sunTzu: SunTzuPrinciple;
  uiRoute?: string; // Route to the actual UI (if exists)
  cliCommand?: string; // CLI command reference
  impact: string; // Business impact
}
