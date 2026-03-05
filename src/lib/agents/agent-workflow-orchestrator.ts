import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';
import { checkBadgeEligibility } from '@/lib/viral-economics/gamification';
import { processTradeCommission } from '@/lib/viral-economics/realtime-commission';
import { updateRefereeMetrics } from '@/lib/viral-economics/referral-manager';
import { promoteTier } from '@/lib/viral-economics/tier-manager';
import { AGENT_EVENTS, createEvent, publish, subscribe } from './agent-event-bus';

/**
 * Agent Workflow Orchestrator — RaaS zero-fee financial engine.
 *
 * Event chain: Trade → Commission → Volume → Tier Check → Badge
 * Enhanced with QStash-inspired patterns: dedup, retry, DLQ.
 */

let initialized = false;

export function initAgentOrchestrator(): void {
  if (initialized) return;
  initialized = true;

  // TRADE EXECUTED → Calculate commission + update volume
  subscribe(AGENT_EVENTS.TRADE_EXECUTED, async (event) => {
    const { userId, volume, fee, exchange, symbol, tradeId } = event.data as {
      userId: string;
      volume: number;
      fee: number;
      exchange: string;
      symbol: string;
      tradeId: string;
    };

    try {
      await processTradeCommission({
        user_id: userId,
        volume,
        fee,
        exchange,
        symbol,
        trade_id: tradeId,
      });

      await publish(
        createEvent(
          AGENT_EVENTS.TRADE_COMMISSION_CALCULATED,
          'orchestrator',
          { userId, volume, fee },
          {
            orgId: event.orgId,
            userId,
            deduplicationId: `commission_${tradeId}`,
            retryConfig: { maxRetries: 3, delays: [1000, 3000, 10000] },
          },
        ),
      );
    } catch (error) {
      logger.error('[Orchestrator] Commission processing failed:', error);
    }
  });

  // COMMISSION CALCULATED → Tier upgrade + badges + referral metrics
  subscribe(AGENT_EVENTS.TRADE_COMMISSION_CALCULATED, async (event) => {
    const { userId } = event.data as { userId: string };

    try {
      const upgraded = await promoteTier(userId);
      if (upgraded) {
        await publish(
          createEvent(AGENT_EVENTS.TIER_UPGRADED, 'orchestrator', { userId }, { orgId: event.orgId, userId }),
        );
      }

      await checkBadgeEligibility(userId);
      await updateRefereeMetrics(userId);
    } catch (error) {
      logger.error('[Orchestrator] Post-commission processing failed:', error);
    }
  });

  // DEPOSIT RECEIVED → Credit wallet + check tier
  subscribe(AGENT_EVENTS.DEPOSIT_RECEIVED, async (event) => {
    const { userId, amount, gateway } = event.data as {
      userId: string;
      amount: number;
      gateway: string;
    };

    logger.info(`[Orchestrator] Deposit $${amount} from ${gateway} for user ${userId}`);
  });

  // ORG CREATED → Initialize org wallet + tier
  subscribe(AGENT_EVENTS.ORG_CREATED, async (event) => {
    const { orgId, ownerId } = event.data as { orgId: string; ownerId: string };
    const supabase = getSupabaseClient();

    try {
      await supabase.from('wallets').insert({
        user_id: ownerId,
        org_id: orgId,
        currency: 'USDT',
        balance: 0,
      });

      logger.info(`[Orchestrator] Org ${orgId} initialized with wallet`);
    } catch (error) {
      logger.error('[Orchestrator] Org initialization failed:', error);
    }
  });

  // WORKFLOW STEP FAILED → Log for monitoring
  subscribe(AGENT_EVENTS.WORKFLOW_STEP_FAILED, async (event) => {
    const { step, error, workflowName } = event.data as {
      step: string;
      error: string;
      workflowName: string;
    };
    logger.error(`[Orchestrator] Workflow "${workflowName}" step "${step}" failed: ${error}`);
  });

  // AGENT STARTED → Track in heartbeats
  subscribe(AGENT_EVENTS.AGENT_STARTED, async (event) => {
    const { agentType, workflowId } = event.data as {
      agentType: string;
      workflowId: string;
    };
    const supabase = getSupabaseClient();
    await supabase.from('agent_heartbeats').upsert(
      {
        agent_id: event.agentId,
        agent_type: agentType,
        status: 'running',
        workflow_id: workflowId,
        org_id: event.orgId || null,
        last_heartbeat: new Date().toISOString(),
      },
      { onConflict: 'agent_id' },
    );
    logger.info(`[Orchestrator] Agent ${event.agentId} started (${agentType})`);
  });

  // AGENT STOPPED → Mark inactive
  subscribe(AGENT_EVENTS.AGENT_STOPPED, async (event) => {
    const supabase = getSupabaseClient();
    await supabase
      .from('agent_heartbeats')
      .update({ status: 'stopped', last_heartbeat: new Date().toISOString() })
      .eq('agent_id', event.agentId);
    logger.info(`[Orchestrator] Agent ${event.agentId} stopped`);
  });

  // AGENT ERROR → Log + mark unhealthy
  subscribe(AGENT_EVENTS.AGENT_ERROR, async (event) => {
    const { error: agentError, severity } = event.data as {
      error: string;
      severity: 'warn' | 'critical';
    };
    const supabase = getSupabaseClient();
    await supabase
      .from('agent_heartbeats')
      .update({ status: 'error', last_heartbeat: new Date().toISOString() })
      .eq('agent_id', event.agentId);
    logger.error(`[Orchestrator] Agent ${event.agentId} error (${severity}): ${agentError}`);
  });

  // TRADE COMMISSION CALCULATED → Aggregate org volume + check org tier upgrade
  subscribe(AGENT_EVENTS.TRADE_COMMISSION_CALCULATED, async (event) => {
    if (!event.orgId) return;

    const supabase = getSupabaseClient();
    try {
      // Aggregate all member volumes for this org
      const { data: members } = await supabase.from('org_members').select('user_id').eq('org_id', event.orgId);

      if (!members || members.length === 0) return;

      const userIds = members.map((m) => m.user_id);
      const { data: tiers } = await supabase.from('user_tiers').select('monthly_volume').in('user_id', userIds);

      const totalOrgVolume = tiers?.reduce((sum, t) => sum + (t.monthly_volume || 0), 0) || 0;

      // Update org monthly_volume
      await supabase
        .from('organizations')
        .update({ monthly_volume: totalOrgVolume, updated_at: new Date().toISOString() })
        .eq('id', event.orgId);

      logger.info(`[Orchestrator] Org ${event.orgId} volume aggregated: $${totalOrgVolume}`);
    } catch (error) {
      logger.error('[Orchestrator] Org volume aggregation failed:', error);
    }
  });

  logger.info('[Orchestrator] Agent workflow orchestrator initialized (QStash-enhanced)');
}
