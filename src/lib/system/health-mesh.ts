import { getSupabaseClient } from '@/lib/supabase';

export async function checkSystemHealth() {
  const supabase = getSupabaseClient();
  const services = ['database', 'openrouter', 'binance_feed'];
  
  for (const service of services) {
      let status = 'healthy';
      let latency = 0;
      const start = Date.now();

      try {
          if (service === 'database') {
              await supabase.from('users').select('count', { count: 'exact', head: true });
          } else if (service === 'openrouter') {
              // Mock Ping
              await new Promise(r => setTimeout(r, Math.random() * 100));
          }
          // ... other checks
      } catch (e) {
          status = 'down';
      }
      latency = Date.now() - start;

      // Log Health
      await supabase.from('system_health_logs').insert({
          service,
          status,
          latency_ms: latency,
          action_taken: status === 'down' ? 'alert_admin' : 'none',
          created_at: new Date().toISOString()
      });
  }
}
