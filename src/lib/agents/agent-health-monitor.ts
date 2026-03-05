import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';
import { AGENT_EVENTS, createEvent, publish } from './agent-event-bus';

const HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000; // 5 min — agent considered dead

/**
 * Agent Health Monitor — Nixpacks-inspired health check pattern.
 *
 * Periodically scans agent_heartbeats for stale entries.
 * Emits AGENT_ERROR event for dead agents so orchestrator can react.
 */
export async function checkAgentHealth(): Promise<{
  healthy: number;
  unhealthy: number;
  dead: string[];
}> {
  const supabase = getSupabaseClient();
  const cutoff = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS).toISOString();

  // Find all running agents
  const { data: agents } = await supabase
    .from('agent_heartbeats')
    .select('agent_id, agent_type, status, last_heartbeat, org_id')
    .eq('status', 'running');

  if (!agents || agents.length === 0) {
    return { healthy: 0, unhealthy: 0, dead: [] };
  }

  const dead: string[] = [];
  let healthy = 0;

  for (const agent of agents) {
    if (agent.last_heartbeat < cutoff) {
      // Agent missed heartbeat — mark as dead
      dead.push(agent.agent_id);

      await supabase
        .from('agent_heartbeats')
        .update({ status: 'dead', last_heartbeat: new Date().toISOString() })
        .eq('agent_id', agent.agent_id);

      await publish(
        createEvent(
          AGENT_EVENTS.AGENT_ERROR,
          agent.agent_id,
          { error: 'Heartbeat timeout — agent unresponsive', severity: 'critical' },
          { orgId: agent.org_id },
        ),
      );

      logger.warn(
        `[HealthMonitor] Agent ${agent.agent_id} (${agent.agent_type}) is dead — no heartbeat since ${agent.last_heartbeat}`,
      );
    } else {
      healthy++;
    }
  }

  return { healthy, unhealthy: dead.length, dead };
}

/**
 * Record a heartbeat for an agent — called by agents periodically.
 */
export async function recordHeartbeat(agentId: string, metadata?: Record<string, unknown>): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase
    .from('agent_heartbeats')
    .update({
      status: 'running',
      last_heartbeat: new Date().toISOString(),
      ...(metadata ? { metadata } : {}),
    })
    .eq('agent_id', agentId);
}
