# 🎯 GEMINI TASK: REALTIME COMMISSION + AUTO ANONYMOUS PAYOUT

**Priority**: CRITICAL (Financial + Security)  
**Complexity**: HIGH  
**Risk**: HIGH (handling real money)  
**Timeline**: 4 weeks  
**Assigned To**: Gemini CLI

---

## ⚠️ **CRITICAL WARNINGS**

> [!CAUTION]
> **This task handles REAL MONEY and user funds. Extreme care required.**
> - Every withdrawal is irreversible once executed
> - Security vulnerabilities could lead to fund loss
> - Fraud prevention is CRITICAL
> - All changes must be audited and tested extensively

> [!IMPORTANT]
> **Before Starting:**
> 1. Read ALL 3 documents: COMMISSION_PAYOUT_ALTERNATIVES.md, WITHDRAWAL_AUTOMATION_SECURITY.md, implementation_plan.md
> 2. Understand the full flow from commission → withdrawal → execution
> 3. Set up a TESTNET environment before touching mainnet
> 4. Use NOWPayments SANDBOX mode for testing

---

## 📋 **TASK OVERVIEW**

### **Objective**:
Implement a secure, realtime commission system with automated anonymous payouts that is:
- ✅ REALTIME: Users see balance update <1 second after trade
- ✅ AUTOMATED: Admin approves → System auto-executes withdrawal
- ✅ ANONYMOUS: No KYC/KYB via NOWPayments
- ✅ FRAUD-PROOF: Admin cannot manipulate amounts/addresses
- ✅ TRANSPARENT: Every payout has blockchain tx_hash

### **What This Replaces**:
- ❌ Monthly commission calculation → REALTIME calculation
- ❌ Manual Binance withdrawals → AUTO via NOWPayments
- ❌ Monthly batch payouts → INSTANT on-demand withdrawals

---

## 📚 **REQUIRED READING**

**Before coding, READ these files in order**:

1. **`docs/COMMISSION_PAYOUT_ALTERNATIVES.md`**
   - Section: "Option 2: NOWPayments"
   - Understand: API integration, mass payout, fees
   
2. **`docs/WITHDRAWAL_AUTOMATION_SECURITY.md`**
   - ALL SECTIONS (critical for security)
   - Focus on: Checksums, Separation of Duties, Audit Trail
   
3. **`implementation_plan.md`** (in artifacts)
   - Complete implementation guide
   - Code examples for each step

4. **`src/lib/viral-economics/commission-calculator.ts`**
   - Existing commission logic (monthly)
   - Needs to be adapted for realtime

---

## 🏗️ **IMPLEMENTATION PHASES**

### **Phase 1: Database Foundation** (Week 1)

**Goal**: Add tables and functions for realtime balance tracking

**Tasks**:
1. Create migration: `supabase/migrations/20251127_realtime_wallet_system.sql`
2. Add tables:
   ```sql
   -- User wallet balances
   CREATE TABLE user_wallets (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) UNIQUE,
     balance_usd DECIMAL(10, 2) DEFAULT 0,
     reserved_balance DECIMAL(10, 2) DEFAULT 0, -- For pending withdrawals
     total_earned DECIMAL(15, 2) DEFAULT 0,
     total_withdrawn DECIMAL(15, 2) DEFAULT 0,
     last_commission_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Commission transactions (realtime)
   CREATE TABLE commission_events (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     amount DECIMAL(10, 2) NOT NULL,
     source VARCHAR(50) NOT NULL, -- 'trading_rebate', 'l1_commission', 'l2_commission', etc.
     from_user_id UUID REFERENCES auth.users(id), -- If commission from referral
     trade_id UUID, -- Reference to original trade
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Withdrawal requests
   CREATE TABLE withdrawal_requests (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     amount DECIMAL(10, 2) NOT NULL,
     crypto_address VARCHAR(100) NOT NULL,
     currency VARCHAR(10) DEFAULT 'USDT',
     network VARCHAR(20) DEFAULT 'TRC20',
     
     status VARCHAR(30) DEFAULT 'pending',
     -- Status flow: pending → agent_approved → approved → executing → completed
     
     risk_score INTEGER,
     agent_notes TEXT,
     agent_approved_at TIMESTAMPTZ,
     
     approved_by UUID REFERENCES auth.users(id),
     approved_at TIMESTAMPTZ,
     
     tx_hash VARCHAR(100),
     tx_fee DECIMAL(10, 6),
     payout_provider VARCHAR(50), -- 'nowpayments', 'smart_contract'
     executed_at TIMESTAMPTZ,
     
     data_checksum VARCHAR(64) NOT NULL, -- CRITICAL for fraud prevention
     
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Immutable audit log
   CREATE TABLE withdrawal_audit_log (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     withdrawal_id UUID REFERENCES withdrawal_requests(id),
     event_type VARCHAR(50) NOT NULL,
     actor VARCHAR(100) NOT NULL, -- 'user:uuid', 'agent:auto', 'admin:uuid', 'system:auto'
     previous_status VARCHAR(30),
     new_status VARCHAR(30),
     metadata JSONB,
     checksum VARCHAR(64), -- Hash linking to previous log entry
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. Create PostgreSQL functions:
   ```sql
   -- Credit user balance (realtime)
   CREATE OR REPLACE FUNCTION credit_user_balance_realtime(
     p_user_id UUID,
     p_amount DECIMAL,
     p_source VARCHAR,
     p_metadata JSONB
   ) RETURNS VOID AS $$
   BEGIN
     -- Update wallet balance
     UPDATE user_wallets
     SET balance_usd = balance_usd + p_amount,
         total_earned = total_earned + p_amount,
         last_commission_at = NOW(),
         updated_at = NOW()
     WHERE user_id = p_user_id;
     
     -- Create commission event
     INSERT INTO commission_events (user_id, amount, source, metadata)
     VALUES (p_user_id, p_amount, p_source, p_metadata);
   END;
   $$ LANGUAGE plpgsql;
   
   -- Reserve balance for withdrawal
   CREATE OR REPLACE FUNCTION reserve_balance_for_withdrawal(
     p_user_id UUID,
     p_amount DECIMAL,
     p_withdrawal_id UUID
   ) RETURNS BOOLEAN AS $$
   DECLARE
     v_balance DECIMAL;
   BEGIN
     SELECT balance_usd INTO v_balance
     FROM user_wallets
     WHERE user_id = p_user_id
     FOR UPDATE; -- Lock row
     
     IF v_balance < p_amount THEN
       RETURN FALSE;
     END IF;
     
     UPDATE user_wallets
     SET balance_usd = balance_usd - p_amount,
         reserved_balance = reserved_balance + p_amount
     WHERE user_id = p_user_id;
     
     RETURN TRUE;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Release reserved balance (if withdrawal fails)
   CREATE OR REPLACE FUNCTION release_reserved_balance(
     p_user_id UUID,
     p_amount DECIMAL
   ) RETURNS VOID AS $$
   BEGIN
     UPDATE user_wallets
     SET balance_usd = balance_usd + p_amount,
         reserved_balance = reserved_balance - p_amount
     WHERE user_id = p_user_id;
   END;
   $$ LANGUAGE plpgsql;
   ```

4. Add RLS policies:
   ```sql
   -- Users can only see their own wallet
   ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own wallet"
     ON user_wallets FOR SELECT
     USING (auth.uid() = user_id);
   
   -- Users can view own commission events
   ALTER TABLE commission_events ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own commissions"
     ON commission_events FOR SELECT
     USING (auth.uid() = user_id);
   
   -- Users can create withdrawal requests
   ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can create own withdrawals"
     ON withdrawal_requests FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can view own withdrawals"
     ON withdrawal_requests FOR SELECT
     USING (auth.uid() = user_id);
   ```

**Testing Phase 1**:
```bash
# Run migration
supabase db push

# Seed test data
psql -c "INSERT INTO user_wallets (user_id, balance_usd) VALUES (...)"

# Test balance credit
psql -c "SELECT credit_user_balance_realtime(...)"

# Verify balance updated
psql -c "SELECT * FROM user_wallets WHERE user_id = ..."
```

**Checkpoint**: Database schema ready, functions working

---

### **Phase 2: Realtime Commission Calculation** (Week 1-2)

**Goal**: Replace monthly commission with realtime updates

**Tasks**:

1. Create realtime commission service: `src/lib/viral-economics/realtime-commission.ts`
   ```typescript
   import { getSupabaseClient } from '@/lib/supabase';
   import { TIERS, EXCHANGE_AVG_REBATE_RATE } from './tier-manager';
   
   export async function processTradeCommission(trade: {
     user_id: string;
     volume: number;
     fee: number;
     exchange: string;
   }) {
     const supabase = getSupabaseClient();
     
     // 1. Calculate user's own rebate
     const { data: tierData } = await supabase
       .from('user_tiers')
       .select('tier')
       .eq('user_id', trade.user_id)
       .single();
       
     const userTier = tierData?.tier || 'FREE';
     const exchangeRebate = trade.volume * EXCHANGE_AVG_REBATE_RATE;
     const userRebate = exchangeRebate * TIERS[userTier].rebate;
     
     // Credit user balance INSTANTLY
     await supabase.rpc('credit_user_balance_realtime', {
       p_user_id: trade.user_id,
       p_amount: userRebate,
       p_source: 'trading_rebate',
       p_metadata: {
         trade_volume: trade.volume,
         exchange: trade.exchange
       }
     });
     
     // 2. Calculate referral commissions (L1-L4)
     const referrers = await getReferralChain(trade.user_id, 4);
     
     for (const ref of referrers) {
       const { data: refTier } = await supabase
         .from('user_tiers')
         .select('tier, current_commission_rate')
         .eq('user_id', ref.referrer_id)
         .single();
         
       if (!refTier) continue;
       
       const levelMultiplier = [1.0, 0.5, 0.25, 0.125][ref.level - 1];
       const commission = exchangeRebate * (1 - TIERS[userTier].rebate) 
                         * refTier.current_commission_rate 
                         * levelMultiplier;
       
       // Credit referrer balance INSTANTLY
       await supabase.rpc('credit_user_balance_realtime', {
         p_user_id: ref.referrer_id,
         p_amount: commission,
         p_source: `l${ref.level}_commission`,
         p_metadata: {
           from_user: trade.user_id,
           trade_volume: trade.volume,
           level: ref.level
         }
       });
     }
   }
   
   async function getReferralChain(userId: string, maxLevel: number) {
     // Recursive query to get L1-L4 referrers
     // Return: [{ referrer_id, level }]
     // Implementation similar to existing referral_network table logic
   }
   ```

2. Integrate with trading webhook: `src/app/api/webhooks/trade-executed/route.ts`
   ```typescript
   import { processTradeCommission } from '@/lib/viral-economics/realtime-commission';
   
   export async function POST(req: Request) {
     const trade = await req.json();
     
     // Process commission in background (don't block webhook)
     processTradeCommission(trade).catch(err => {
       console.error('Commission processing failed:', err);
       // Send to error tracking (Sentry)
     });
     
     return NextResponse.json({ received: true });
   }
   ```

**Testing Phase 2**:
```bash
# Send test trade webhook
curl -X POST http://localhost:3000/api/webhooks/trade-executed \
  -H "Content-Type: application/json" \
  -d '{"user_id":"...", "volume":100000, "fee":50}'

# Verify balance updated
psql -c "SELECT * FROM user_wallets WHERE user_id = ..."
psql -c "SELECT * FROM commission_events WHERE user_id = ... ORDER BY created_at DESC LIMIT 10"
```

**Checkpoint**: Realtime commission working, balance updates instantly

---

### **Phase 3: Withdrawal Request + Agent Check** (Week 2)

**Goal**: Allow users to request withdrawals with automated fraud detection

**Tasks**:

1. Create withdrawal API: `src/app/api/v1/wallet/withdraw/route.ts`
   ```typescript
   import crypto from 'crypto';
   
   export async function POST(req: Request) {
     const { amount, crypto_address } = await req.json();
     const userId = await authenticateRequest(req);
     
     // Validate inputs
     if (amount < 10) {
       return NextResponse.json({ error: 'Minimum withdrawal: $10' }, { status: 400 });
     }
     
     if (!isValidTronAddress(crypto_address)) {
       return NextResponse.json({ error: 'Invalid USDT TRC20 address' }, { status: 400 });
     }
     
     // Create checksum (CRITICAL for fraud prevention)
     const checksum = crypto
       .createHash('sha256')
       .update(`${userId}:${amount}:${crypto_address}:${Date.now()}`)
       .digest('hex');
     
     // Create withdrawal request
     const { data: request, error } = await supabase
       .from('withdrawal_requests')
       .insert({
         user_id: userId,
         amount,
         crypto_address,
         currency: 'USDT',
         network: 'TRC20',
         status: 'pending',
         data_checksum: checksum
       })
       .select()
       .single();
       
     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
     
     // Reserve balance
     const reserved = await supabase.rpc('reserve_balance_for_withdrawal', {
       p_user_id: userId,
       p_amount: amount,
       p_withdrawal_id: request.id
     });
     
     if (!reserved) {
       await supabase.from('withdrawal_requests').delete().eq('id', request.id);
       return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
     }
     
     // Trigger agent check (async)
     await triggerAgentCheck(request.id);
     
     return NextResponse.json({ 
       request_id: request.id,
       status: 'pending_review',
       estimated_time: '1-3 minutes'
     });
   }
   ```

2. Create agent check service: `src/lib/agents/withdrawal-agent.ts`
   ```typescript
   import crypto from 'crypto';
   
   export async function agentCheckWithdrawal(withdrawalId: string) {
     const { data: request } = await supabase
       .from('withdrawal_requests')
       .select('*')
       .eq('id', withdrawalId)
       .single();
       
     // 1. VERIFY CHECKSUM (critical!)
     const expectedChecksum = crypto
       .createHash('sha256')
       .update(`${request.user_id}:${request.amount}:${request.crypto_address}:${request.created_at}`)
       .digest('hex');
       
     if (request.data_checksum !== expectedChecksum) {
       await rejectWithdrawal(withdrawalId, 'Data integrity check failed');
       return { approved: false };
     }
     
     // 2. Fraud detection
     const riskScore = await calculateRiskScore(request.user_id, request.amount);
     
     if (riskScore > 80) {
       await flagForManualReview(withdrawalId, riskScore);
       return { approved: false, reason: 'High risk - flagged for review' };
     }
     
     // 3. AML check (address not blacklisted)
     const blacklisted = await checkAddressBlacklist(request.crypto_address);
     if (blacklisted) {
       await rejectWithdrawal(withdrawalId, 'Address blacklisted');
       return { approved: false };
     }
     
     // 4. Balance reconciliation
     const reconciled = await reconcileWithdrawal(withdrawalId);
     if (!reconciled) {
       await flagForManualReview(withdrawalId, riskScore);
       return { approved: false, reason: 'Balance reconciliation failed' };
     }
     
     // PASSED all checks
     await supabase
       .from('withdrawal_requests')
       .update({
         status: 'agent_approved',
         risk_score: riskScore,
         agent_approved_at: new Date().toISOString()
       })
       .eq('id', withdrawalId);
       
     // Notify admin
     await notifyAdminForApproval(withdrawalId);
     
     return { approved: true, risk_score: riskScore };
   }
   ```

**Testing Phase 3**:
```bash
# Test withdrawal request
curl -X POST http://localhost:3000/api/v1/wallet/withdraw \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":50, "crypto_address":"TXyz123..."}'

# Check agent processed it
psql -c "SELECT * FROM withdrawal_requests WHERE id = '...'"
# Should show status = 'agent_approved'
```

**Checkpoint**: Withdrawal requests working, agent checks passing

---

### **Phase 4: NOWPayments Integration** (Week 3)

**Goal**: Integrate NOWPayments for auto-execution

**CRITICAL SETUP**:
1. Sign up at https://nowpayments.io (use throwaway email if testing)
2. Get SANDBOX API key (DO NOT use production initially)
3. Add to Vercel env vars:
   ```bash
   NOWPAYMENTS_API_KEY=<sandbox_key>
   NOWPAYMENTS_SANDBOX=true
   ```

**Tasks**:

1. Create NOWPayments client: `src/lib/payments/nowpayments-client.ts`
   ```typescript
   import axios from 'axios';
   
   class NOWPaymentsClient {
     private apiKey: string;
     private baseUrl: string;
     
     constructor() {
       this.apiKey = process.env.NOWPAYMENTS_API_KEY!;
       this.baseUrl = process.env.NOWPAYMENTS_SANDBOX === 'true'
         ? 'https://api-sandbox.nowpayments.io/v1'
         : 'https://api.nowpayments.io/v1';
     }
     
     async createPayout(payout: {
       address: string;
       amount: number;
       currency: string;
       withdrawal_id: string;
     }) {
       try {
         const response = await axios.post(
           `${this.baseUrl}/payout`,
           {
             withdrawals: [{
               address: payout.address,
               currency: payout.currency, // 'usdttrc20'
               amount: payout.amount,
               ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments/${payout.withdrawal_id}`
             }]
           },
           {
             headers: {
               'x-api-key': this.apiKey,
               'Content-Type': 'application/json'
             }
           }
         );
         
         return {
           success: true,
           payout_id: response.data.id,
           status: response.data.status
         };
       } catch (error) {
         console.error('NOWPayments payout failed:', error);
         throw error;
       }
     }
     
     async getPayoutStatus(payoutId: string) {
       const response = await axios.get(
         `${this.baseUrl}/payout/${payoutId}`,
         { headers: { 'x-api-key': this.apiKey } }
       );
       
       return {
         status: response.data.status, // 'FINISHED', 'PENDING', 'FAILED'
         tx_hash: response.data.hash,
         fee: response.data.fee
       };
     }
   }
   
   export const nowPayments = new NOWPaymentsClient();
   ```

2. Create execution worker: `src/lib/agents/execution-agent.ts`
   ```typescript
   import { nowPayments } from '@/lib/payments/nowpayments-client';
   
   export async function executeWithdrawal(withdrawalId: string) {
     const { data: request } = await supabase
       .from('withdrawal_requests')
       .select('*')
       .eq('id', withdrawalId)
       .eq('status', 'approved')
       .single();
       
     if (!request) {
       throw new Error('Withdrawal not approved or not found');
     }
     
     // VERIFY CHECKSUM AGAIN (prevent tampering)
     const checksumValid = verifyChecksum(request);
     if (!checksumValid) {
       await markExecutionFailed(withdrawalId, 'Checksum verification failed');
       throw new Error('Data integrity check failed');
     }
     
     // Update status to executing
     await supabase
       .from('withdrawal_requests')
       .update({ status: 'executing', executed_at: new Date().toISOString() })
       .eq('id', withdrawalId);
       
     try {
       // Execute via NOWPayments
       const result = await nowPayments.createPayout({
         address: request.crypto_address,
         amount: request.amount,
         currency: 'usdttrc20',
         withdrawal_id: withdrawalId
       });
       
       // Poll for completion (NOWPayments processes async)
       const finalStatus = await pollPayoutCompletion(result.payout_id);
       
       // Save tx_hash
       await supabase
         .from('withdrawal_requests')
         .update({
           status: 'completed',
           tx_hash: finalStatus.tx_hash,
           tx_fee: finalStatus.fee,
           payout_provider: 'nowpayments'
         })
         .eq('id', withdrawalId);
         
       // Update wallet (move from reserved to withdrawn)
       await supabase.rpc('finalize_withdrawal', {
         p_user_id: request.user_id,
         p_amount: request.amount
       });
       
       // Log audit trail
       await logAuditEvent(withdrawalId, 'execution_completed', {
         tx_hash: finalStatus.tx_hash,
         provider: 'nowpayments'
       });
       
       return { success: true, tx_hash: finalStatus.tx_hash };
       
     } catch (error) {
       // Execution failed - revert
       await supabase
         .from('withdrawal_requests')
         .update({
           status: 'execution_failed',
           error_message: error.message
         })
         .eq('id', withdrawalId);
         
       // Release reserved balance
       await supabase.rpc('release_reserved_balance', {
         p_user_id: request.user_id,
         p_amount: request.amount
       });
       
       throw error;
     }
   }
   
   async function pollPayoutCompletion(payoutId: string, maxRetries = 10) {
     for (let i = 0; i < maxRetries; i++) {
       const status = await nowPayments.getPayoutStatus(payoutId);
       
       if (status.status === 'FINISHED') {
         return status;
       }
       
       if (status.status === 'FAILED') {
         throw new Error('Payout failed on NOWPayments side');
       }
       
       // Wait 10 seconds before retry
       await new Promise(resolve => setTimeout(resolve, 10000));
     }
     
     throw new Error('Payout timeout - check NOWPayments dashboard');
   }
   ```

3. Create admin approval endpoint: `src/app/api/admin/withdrawals/approve/route.ts`
   ```typescript
   export async function POST(req: Request) {
     const { withdrawal_id, two_fa_code } = await req.json();
     const adminId = await authenticateAdmin(req);
     
     // Verify 2FA
     const twoFAValid = await verify2FA(adminId, two_fa_code);
     if (!twoFAValid) {
       return NextResponse.json({ error: 'Invalid 2FA' }, { status: 401 });
     }
     
     // Update status to approved
     await supabase
       .from('withdrawal_requests')
       .update({
         status: 'approved',
         approved_by: adminId,
         approved_at: new Date().toISOString()
       })
       .eq('id', withdrawal_id)
       .eq('status', 'agent_approved'); // Only approve if agent already checked
       
     // TRIGGER AUTO-EXECUTION
     executeWithdrawal(withdrawal_id).catch(err => {
       console.error('Execution failed:', err);
       // Alert admin
     });
     
     return NextResponse.json({ success: true });
   }
   ```

**Testing Phase 4** (SANDBOX ONLY):
```bash
# 1. Create test withdrawal
# 2. Agent approves it
# 3. Admin approves (triggers execution)
curl -X POST http://localhost:3000/api/admin/withdrawals/approve \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"withdrawal_id":"...", "two_fa_code":"123456"}'

# 4. Check NOWPayments sandbox dashboard
# 5. Verify tx_hash returned
psql -c "SELECT tx_hash, status FROM withdrawal_requests WHERE id = '...'"
```

**Checkpoint**: NOWPayments integration working in sandbox

---

### **Phase 5: Realtime Dashboard** (Week 3-4)

**Goal**: User sees balance and payout history in realtime

**Tasks**:

1. Create realtime wallet component: `src/components/dashboard/RealtimeWallet.tsx`
   ```typescript
   'use client';
   
   import { useEffect, useState } from 'react';
   import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
   
   export function RealtimeWallet() {
     const [balance, setBalance] = useState(0);
     const [recentCommissions, setRecentCommissions] = useState([]);
     const supabase = createClientComponentClient();
     
     useEffect(() => {
       // Subscribe to realtime balance updates
       const channel = supabase
         .channel('wallet_updates')
         .on('postgres_changes', {
           event: 'UPDATE',
           schema: 'public',
           table: 'user_wallets',
           filter: `user_id=eq.${userId}`
         }, (payload) => {
           setBalance(payload.new.balance_usd);
           
           // Show toast notification
           toast.success(`+$${(payload.new.balance_usd - payload.old.balance_usd).toFixed(2)} earned!`);
         })
         .on('postgres_changes', {
           event: 'INSERT',
           schema: 'public',
           table: 'commission_events',
           filter: `user_id=eq.${userId}`
         }, (payload) => {
           setRecentCommissions(prev => [payload.new, ...prev].slice(0, 10));
         })
         .subscribe();
         
       return () => {
         supabase.removeChannel(channel);
       };
     }, []);
     
     return (
       <div className="wallet-dashboard">
         <h2>Commission Wallet</h2>
         <div className="balance">
           <AnimatedNumber value={balance} prefix="$" />
         </div>
         
         <div className="recent-activity">
           {recentCommissions.map(comm => (
             <div key={comm.id} className="commission-item">
               <span>+${comm.amount}</span>
               <span>{comm.source}</span>
               <time>{formatTimeAgo(comm.created_at)}</time>
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```

**Testing Phase 5**:
- Trigger test trade → See balance update in <1 second
- Check commission events appear instantly
- Test on multiple browsers (ensure Realtime working)

**Checkpoint**: Dashboard shows realtime updates

---

## 🔒 **SECURITY CHECKLIST**

Before deploying to production, verify ALL of these:

- [ ] **Checksums**: Every withdrawal has data_checksum, verified on execution
- [ ] **RLS Policies**: Users can only see/modify their own data
- [ ] **Audit Log**: All actions logged to withdrawal_audit_log (immutable)
- [ ] **2FA**: Admin approval requires 2FA code
- [ ] **Separation of Duties**: Admin approves ≠ System executes
- [ ] **Input Validation**: All user inputs sanitized (SQL injection, XSS)
- [ ] **Rate Limiting**: Max 5 withdrawal requests per day per user
- [ ] **AML Screening**: Address blacklist checked before execution
- [ ] **Fraud Detection**: Risk score calculated, high risk flagged
- [ ] **Balance Reconciliation**: total_earned = total_withdrawn + balance
- [ ] **Testnet Testing**: All features tested in sandbox before mainnet
- [ ] **Error Handling**: Failed executions revert balance properly
- [ ] **HSM**: NOWPayments API key stored in Hardware Security Module (or Vercel encrypted env)

---

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests** (Required):
```bash
# Create test files
src/__tests__/lib/viral-economics/realtime-commission.test.ts
src/__tests__/lib/agents/withdrawal-agent.test.ts
src/__tests__/lib/agents/execution-agent.test.ts

# Run tests
npm test

# Must have >90% coverage for:
- Checksum verification
- Risk score calculation
- Balance reconciliation
- Withdrawal execution
```

### **Integration Tests** (Required):
```bash
# Test full flow:
1. User trades → Commission credited (realtime)
2. User requests withdrawal
3. Agent checks (passes)
4. Admin approves
5. System executes (NOWPayments sandbox)
6. Tx_hash returned
7. Balance deducted
8. Audit log complete
```

### **Security Tests** (Required):
```bash
# Attempt to tamper with data:
1. Try to modify amount after request creation → Should fail (checksum mismatch)
2. Try to approve without 2FA → Should fail
3. Try to withdraw more than balance → Should fail
4. Try to access other user's wallet → Should fail (RLS)
5. Try to replay old withdrawal → Should fail (unique checksum)
```

---

## 📊 **DELIVERABLES**

When complete, you must provide:

1. ✅ **Code**:
   - Database migration file
   - All TypeScript files as specified
   - Unit tests (>90% coverage)
   
2. ✅ **Documentation**:
   - API documentation (withdrawal endpoints)
   - Admin guide (how to approve withdrawals)
   - Troubleshooting guide (common errors)
   
3. ✅ **Environment Setup**:
   - `.env.example` with all required vars
   - Vercel deployment config
   - NOWPayments sandbox setup steps
   
4. ✅ **Testing Report**:
   - Unit test results
   - Integration test results
   - Security test results (penetration testing)
   
5. ✅ **Deployment Plan**:
   - Pre-deployment checklist
   - Rollback plan (if something goes wrong)
   - Monitoring setup (Sentry alerts)

---

## ⚠️ **BEFORE PRODUCTION DEPLOYMENT**

> [!CAUTION]
> **DO NOT deploy to production until ALL of these are done:**

1. [ ] All tests passing (unit + integration + security)
2. [ ] Tested in NOWPayments SANDBOX (not production)
3. [ ] Code reviewed by senior developer
4. [ ] Security audit completed
5. [ ] Monitoring alerts configured (Sentry)
6. [ ] Admin 2FA enabled and tested
7. [ ] Rollback plan documented
8. [ ] Users notified of new withdrawal feature
9. [ ] Support team trained on handling withdrawal issues
10. [ ] Legal/compliance review (if required)

---

## 📞 **QUESTIONS OR BLOCKERS**

If you encounter ANY of these, STOP and notify user:

1. ❌ NOWPayments sandbox not working
2. ❌ Checksum verification failing unexpectedly
3. ❌ Balance reconciliation logic unclear
4. ❌ Security vulnerability discovered
5. ❌ Test coverage <90%
6. ❌ Performance issues (realtime updates slow)
7. ❌ Any uncertainty about financial logic

**DO NOT PROCEED if unsure. Real money is at stake.**

---

## 🎯 **SUCCESS CRITERIA**

Task is complete when:

1. ✅ User trades → Balance updates in <1 second
2. ✅ User requests withdrawal → Processed in <3 minutes end-to-end
3. ✅ Admin approves → System auto-executes (no manual touch)
4. ✅ Tx_hash visible on TronScan
5. ✅ Balance deducted correctly
6. ✅ Audit trail complete and immutable
7. ✅ Zero security vulnerabilities found in testing
8. ✅ All tests passing (>90% coverage)

---

**Estimated Effort**: 4 weeks (1 developer)  
**Risk Level**: HIGH  
**Priority**: CRITICAL

Good luck, Gemini! 🚀
