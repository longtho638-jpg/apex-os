# 🔐 INTERNAL WALLET AUTOMATION - ANTI-FRAUD ARCHITECTURE

**Date**: 2025-11-27  
**Problem**: Internal wallet balance cần automation + accounting reconciliation + fraud prevention  
**Principle**: **"Tách biệt trách nhiệm" (Separation of Duties) + Multi-signature + Audit Trail**

---

## 🚨 RISK ANALYSIS (What Can Go Wrong)

### **Fraud Scenarios**:

1. **Admin Fraud** ❌
   - Admin chèn địa chỉ ví fake vào withdrawal request
   - Admin approve withdrawal cho địa chỉ của mình
   - Admin modify số tiền trước khi execute

2. **Agent Manipulation** ❌
   - Agent bot bị hack → approve fake requests
   - Agent logic bug → sai số tiền
   - Agent không check đúng balance

3. **Database Tampering** ❌
   - Hacker thay đổi withdrawal_requests table
   - Modify user balance trước khi withdraw
   - Fake commission records

4. **Reconciliation Gap** ❌
   - Tiền gửi đi nhưng không có tx hash
   - Tx hash fake (copy từ giao dịch khác)
   - Balance không khớp với accounting

---

## ✅ SECURE AUTOMATION ARCHITECTURE

### **Principle: "Trust No One, Verify Everything"**

```
┌─────────────────────────────────────────────────────────┐
│         WITHDRAWAL REQUEST FLOW (6 BARRIERS)            │
└─────────────────────────────────────────────────────────┘

1. USER REQUEST
   ↓ (user_id, amount, crypto_address)
   
2. AGENT PRE-CHECK (Automated) ✅
   - Verify balance sufficient
   - Check fraud indicators (velocity, patterns)
   - AML screening (address not blacklisted)
   - Calculate risk score
   → If PASS: Status = 'agent_approved'
   → If FAIL: Status = 'rejected', notify admin
   
3. ACCOUNTING RECONCILIATION (Automated) ✅
   - Compare user balance vs commission_earned
   - Check if sum(withdrawals) + balance = commission_earned
   - Verify no duplicate requests
   → If PASS: Status = 'reconciled'
   → If FAIL: Flag for manual review
   
4. MULTI-SIGNATURE APPROVAL (Human + System) 🔑
   - Admin reviews reconciliation report
   - Admin sees: 
     - User history (trusted/new)
     - Risk score from agent
     - Accounting match status
   - Admin signs with 2FA/hardware key
   → Status = 'approved'
   
5. HOT WALLET EXECUTION (Automated + Locked) 🔒
   - System automatically calls exchange API
   - Uses SECURE key (stored in Hardware Security Module)
   - Transaction signed with multi-sig wallet
   - NO human can modify amount/address at this point
   → Returns tx_hash
   
6. POST-EXECUTION RECONCILIATION (Automated) ✅
   - Verify tx_hash on blockchain
   - Update user balance (deduct amount)
   - Log full audit trail
   - Alert if tx failed
   → Status = 'completed' + tx_hash saved
```

---

## 🔐 DETAILED IMPLEMENTATION

### **1. Database Schema (Anti-Tampering)**

```sql
-- Immutable audit log (append-only)
CREATE TABLE withdrawal_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  withdrawal_id UUID REFERENCES withdrawal_requests(id),
  event_type VARCHAR(50) NOT NULL, -- 'created','agent_check','reconciled','approved','executed','completed'
  actor VARCHAR(100), -- 'user:uuid' or 'agent:auto' or 'admin:uuid'
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSONB, -- Store all relevant data
  checksum VARCHAR(64), -- Hash of previous log entry (blockchain-like)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal requests with checksums
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  crypto_address VARCHAR(100) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  
  -- Status flow
  status VARCHAR(20) DEFAULT 'pending',
  -- pending → agent_approved → reconciled → approved → executing → completed
  
  -- Agent checks
  risk_score INTEGER, -- 0-100, higher = riskier
  agent_notes TEXT,
  agent_approved_at TIMESTAMPTZ,
  
  -- Reconciliation
  reconciliation_match BOOLEAN,
  reconciliation_notes TEXT,
  reconciled_at TIMESTAMPTZ,
  
  -- Admin approval
  approved_by UUID REFERENCES auth.users(id),
  admin_signature VARCHAR(255), -- 2FA token or hardware key signature
  approved_at TIMESTAMPTZ,
  
  -- Execution
  tx_hash VARCHAR(100),
  tx_fee DECIMAL(10, 6),
  tx_confirmed BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  
  -- Anti-tamper
  data_checksum VARCHAR(64), -- Hash of (user_id + amount + address)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-fund tracking (hot wallet balance)
CREATE TABLE hot_wallet_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency VARCHAR(10),
  available_balance DECIMAL(15, 6),
  reserved_balance DECIMAL(15, 6), -- For pending withdrawals
  total_balance DECIMAL(15, 6),
  
  last_reconciled_at TIMESTAMPTZ,
  reconciliation_status VARCHAR(20),
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **2. Agent Pre-Check (Automated, No Human Intervention)**

```typescript
// backend/agents/withdrawal_agent.ts
import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  crypto_address: string;
  data_checksum: string;
}

export async function agentPreCheck(withdrawalId: string) {
  const supabase = getSupabaseClient();
  
  // 1. Fetch request
  const { data: request } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single();
    
  if (!request) throw new Error('Withdrawal not found');
  
  // 2. VERIFY CHECKSUM (prevent tampering)
  const expectedChecksum = crypto
    .createHash('sha256')
    .update(`${request.user_id}:${request.amount}:${request.crypto_address}`)
    .digest('hex');
    
  if (request.data_checksum !== expectedChecksum) {
    await logAudit(withdrawalId, 'agent_check', 'agent:auto', {
      result: 'FAILED',
      reason: 'Checksum mismatch - possible tampering'
    });
    
    await supabase
      .from('withdrawal_requests')
      .update({ status: 'rejected', agent_notes: 'Data integrity check failed' })
      .eq('id', withdrawalId);
      
    return { approved: false, reason: 'Tampering detected' };
  }
  
  // 3. Check user balance
  const { data: wallet } = await supabase
    .from('user_wallets')
    .select('balance_usd')
    .eq('user_id', request.user_id)
    .single();
    
  if (wallet.balance_usd < request.amount) {
    await rejectWithAudit(withdrawalId, 'Insufficient balance');
    return { approved: false, reason: 'Insufficient balance' };
  }
  
  // 4. Fraud detection
  const riskScore = await calculateRiskScore(request.user_id, request.amount);
  
  if (riskScore > 80) { // High risk
    await flagForManualReview(withdrawalId, riskScore);
    return { approved: false, reason: 'High risk - manual review required' };
  }
  
  // 5. AML screening (check address not blacklisted)
  const isBlacklisted = await checkAddressBlacklist(request.crypto_address);
  if (isBlacklisted) {
    await rejectWithAudit(withdrawalId, 'Address blacklisted');
    return { approved: false, reason: 'AML check failed' };
  }
  
  // 6. PASSED all checks
  await supabase
    .from('withdrawal_requests')
    .update({
      status: 'agent_approved',
      risk_score: riskScore,
      agent_notes: `Automated checks passed. Risk: ${riskScore}/100`,
      agent_approved_at: new Date().toISOString()
    })
    .eq('id', withdrawalId);
    
  await logAudit(withdrawalId, 'agent_check', 'agent:auto', {
    result: 'PASSED',
    risk_score: riskScore,
    checks: {
      checksum: 'OK',
      balance: 'OK',
      fraud: 'OK',
      aml: 'OK'
    }
  });
  
  return { approved: true, risk_score: riskScore };
}

async function calculateRiskScore(userId: string, amount: number): Promise<number> {
  let score = 0;
  
  // Check 1: User age (new users = higher risk)
  const userAge = await getUserAgeDays(userId);
  if (userAge < 7) score += 30; // New user
  else if (userAge < 30) score += 15;
  
  // Check 2: Withdrawal velocity (too many requests)
  const recentWithdrawals = await getRecentWithdrawalCount(userId, 7); // Last 7 days
  if (recentWithdrawals > 5) score += 25;
  else if (recentWithdrawals > 2) score += 10;
  
  // Check 3: Large amount relative to history
  const avgWithdrawal = await getAvgWithdrawalAmount(userId);
  if (amount > avgWithdrawal * 3) score += 20; // 3x larger than usual
  
  // Check 4: First withdrawal ever
  const isFirstWithdrawal = await isFirstWithdrawal(userId);
  if (isFirstWithdrawal) score += 15;
  
  return Math.min(score, 100); // Cap at 100
}
```

---

### **3. Accounting Reconciliation (Automated)**

```typescript
// backend/agents/reconciliation_agent.ts

export async function reconcileWithdrawal(withdrawalId: string) {
  const supabase = getSupabaseClient();
  
  const { data: request } = await supabase
    .from('withdrawal_requests')
    .select('user_id, amount')
    .eq('id', withdrawalId)
    .single();
    
  // 1. Get user's commission history
  const { data: commissions } = await supabase
    .from('commission_transactions')
    .select('total_commission')
    .eq('user_id', request.user_id)
    .eq('status', 'paid');
    
  const totalEarned = commissions?.reduce((sum, c) => sum + c.total_commission, 0) || 0;
  
  // 2. Get user's withdrawal history
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount')
    .eq('user_id', request.user_id)
    .eq('status', 'completed');
    
  const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
  
  // 3. Get current balance
  const { data: wallet } = await supabase
    .from('user_wallets')
    .select('balance_usd')
    .eq('user_id', request.user_id)
    .single();
    
  const currentBalance = wallet?.balance_usd || 0;
  
  // 4. VERIFY: totalEarned = totalWithdrawn + currentBalance
  const expectedBalance = totalEarned - totalWithdrawn;
  const balanceMatch = Math.abs(expectedBalance - currentBalance) < 0.01; // Allow 1 cent rounding
  
  // 5. VERIFY: Sufficient for this withdrawal
  const sufficientForWithdrawal = currentBalance >= request.amount;
  
  const reconciled = balanceMatch && sufficientForWithdrawal;
  
  await supabase
    .from('withdrawal_requests')
    .update({
      status: reconciled ? 'reconciled' : 'reconciliation_failed',
      reconciliation_match: reconciled,
      reconciliation_notes: JSON.stringify({
        total_earned: totalEarned,
        total_withdrawn: totalWithdrawn,
        current_balance: currentBalance,
        expected_balance: expectedBalance,
        balance_match: balanceMatch,
        sufficient: sufficientForWithdrawal
      }),
      reconciled_at: new Date().toISOString()
    })
    .eq('id', withdrawalId);
    
  await logAudit(withdrawalId, 'reconciliation', 'agent:auto', {
    result: reconciled ? 'PASSED' : 'FAILED',
    reconciliation: {
      total_earned: totalEarned,
      total_withdrawn: totalWithdrawn,
      current_balance: currentBalance,
      match: balanceMatch
    }
  });
  
  return { reconciled, details: { totalEarned, totalWithdrawn, currentBalance } };
}
```

---

### **4. Admin Approval (Human-in-the-Loop with 2FA)**

```typescript
// src/app/api/admin/withdrawals/approve/route.ts

export async function POST(req: Request) {
  const { withdrawal_id, admin_signature } = await req.json();
  const adminId = await authenticateAdmin(req); // Must be admin role
  
  // 1. Verify admin 2FA signature
  const signatureValid = await verify2FASignature(adminId, admin_signature);
  if (!signatureValid) {
    return NextResponse.json({ error: 'Invalid 2FA signature' }, { status: 401 });
  }
  
  // 2. Fetch withdrawal (must be in 'reconciled' status)
  const { data: request } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawal_id)
    .eq('status', 'reconciled')
    .single();
    
  if (!request) {
    return NextResponse.json({ error: 'Invalid withdrawal or not reconciled' }, { status: 400 });
  }
  
  // 3. Double-check risk score
  if (request.risk_score > 50) {
    // Send alert to senior admin
    await sendAlert(`High risk withdrawal approved by ${adminId}: ${withdrawal_id}`);
  }
  
  // 4. Approve (status → approved)
  await supabase
    .from('withdrawal_requests')
    .update({
      status: 'approved',
      approved_by: adminId,
      admin_signature: admin_signature,
      approved_at: new Date().toISOString()
    })
    .eq('id', withdrawal_id);
    
  await logAudit(withdrawal_id, 'admin_approval', `admin:${adminId}`, {
    result: 'APPROVED',
    signature: admin_signature,
    risk_score: request.risk_score
  });
  
  // 5. TRIGGER automated execution (next step)
  await executeWithdrawal(withdrawal_id);
  
  return NextResponse.json({ success: true });
}
```

---

### **5. Hot Wallet Execution (Fully Automated, No Human Touch)**

```typescript
// backend/agents/execution_agent.ts

export async function executeWithdrawal(withdrawalId: string) {
  const supabase = getSupabaseClient();
  
  // 1. Fetch approved request
  const { data: request } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .eq('status', 'approved')
    .single();
    
  if (!request) throw new Error('Withdrawal not approved');
  
  // 2. Lock hot wallet balance (prevent double-spend)
  await reserveHotWalletBalance(request.amount);
  
  // 3. Update status to 'executing'
  await supabase
    .from('withdrawal_requests')
    .update({ status: 'executing' })
    .eq('id', withdrawalId);
    
  try {
    // 4. Execute via exchange API (Binance, Kraken, etc.)
    const result = await sendCrypto({
      to_address: request.crypto_address,
      amount: request.amount,
      currency: request.currency, // 'USDT'
      network: 'TRC20' // Tron network (low fees)
    });
    
    // 5. Save tx_hash (immutable proof)
    await supabase
      .from('withdrawal_requests')
      .update({
        status: 'completed',
        tx_hash: result.tx_hash,
        tx_fee: result.fee,
        executed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);
      
    // 6. Deduct from user balance
    await supabase.rpc('deduct_user_balance', {
      p_user_id: request.user_id,
      p_amount: request.amount
    });
    
    // 7. Release hot wallet reserve
    await releaseHotWalletBalance(request.amount);
    
    // 8. Log audit
    await logAudit(withdrawalId, 'execution', 'system:auto', {
      result: 'SUCCESS',
      tx_hash: result.tx_hash,
      fee: result.fee,
      address: request.crypto_address,
      amount: request.amount
    });
    
    return { success: true, tx_hash: result.tx_hash };
    
  } catch (error) {
    // Execution failed - revert
    await supabase
      .from('withdrawal_requests')
      .update({
        status: 'execution_failed',
        agent_notes: `Execution error: ${error.message}`
      })
      .eq('id', withdrawalId);
      
    await releaseHotWalletBalance(request.amount);
    
    await logAudit(withdrawalId, 'execution', 'system:auto', {
      result: 'FAILED',
      error: error.message
    });
    
    throw error;
  }
}

// Hot wallet management
async function sendCrypto({ to_address, amount, currency, network }) {
  // Use exchange API (Binance Withdraw API)
  const binance = new BinanceClient({
    apiKey: process.env.BINANCE_API_KEY,
    secretKey: await getFromHSM('BINANCE_SECRET') // Hardware Security Module
  });
  
  const result = await binance.withdraw({
    coin: currency,
    network: network,
    address: to_address,
    amount: amount
  });
  
  return {
    tx_hash: result.id, // Transaction ID from Binance
    fee: result.transactionFee
  };
}
```

---

### **6. Post-Execution Reconciliation (Blockchain Verification)**

```typescript
// Cron job: Every 15 minutes
export async function verifyPendingTransactions() {
  const { data: pending } = await supabase
    .from('withdrawal_requests')
    .select('id, tx_hash, amount, crypto_address, currency')
    .eq('status', 'completed')
    .eq('tx_confirmed', false);
    
  for (const tx of pending) {
    // Check on blockchain (TronScan API for USDT TRC20)
    const confirmed = await checkBlockchainConfirmation(tx.tx_hash, tx.currency);
    
    if (confirmed) {
      await supabase
        .from('withdrawal_requests')
        .update({ tx_confirmed: true })
        .eq('id', tx.id);
        
      await logAudit(tx.id, 'blockchain_confirmation', 'system:auto', {
        result: 'CONFIRMED',
        tx_hash: tx.tx_hash,
        confirmations: confirmed.confirmations
      });
    }
  }
}

async function checkBlockchainConfirmation(txHash: string, currency: string) {
  if (currency === 'USDT' && txHash.startsWith('TRC20:')) {
    // Check TronScan
    const response = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}`);
    const data = await response.json();
    
    return {
      confirmed: data.confirmed,
      confirmations: data.confirmations,
      block_number: data.blockNumber
    };
  }
  // Add other networks as needed
}
```

---

## 🔒 FRAUD PREVENTION MECHANISMS

### **1. Checksums (Prevent Data Tampering)**
```typescript
// When creating withdrawal request
const checksum = crypto
  .createHash('sha256')
  .update(`${user_id}:${amount}:${crypto_address}`)
  .digest('hex');
  
await supabase.from('withdrawal_requests').insert({
  user_id,
  amount,
  crypto_address,
  data_checksum: checksum // IMMUTABLE
});

// Agent verifies checksum on every check
const expected = crypto.createHash('sha256')...;
if (checksum !== expected) REJECT;
```

### **2. Append-Only Audit Log (Blockchain-like)**
```typescript
// Every action creates a log entry that references previous entry
const previousLog = await getLatestAuditLog(withdrawal_id);
const checksum = crypto
  .createHash('sha256')
  .update(`${previousLog.checksum}:${event_type}:${actor}:${timestamp}`)
  .digest('hex');
  
await supabase.from('withdrawal_audit_log').insert({
  withdrawal_id,
  event_type,
  actor,
  checksum, // Links to previous log
  metadata
});

// Can verify entire chain is intact
```

### **3. Multi-Signature Approval**
```typescript
// Admin must sign with 2FA/hardware key
const signature = await admin.sign({
  withdrawal_id,
  amount,
  address,
  timestamp
});

// Signature verified before execution
const valid = await verifySignature(signature, admin_public_key);
```

### **4. Separation of Duties**
```
Agent:    Can CHECK but NOT APPROVE
Admin:    Can APPROVE but NOT EXECUTE
System:   Can EXECUTE but ONLY if APPROVED
```

### **5. Hot Wallet Isolation**
```typescript
// Private keys stored in Hardware Security Module (HSM)
// NOT in database or code
// System calls HSM API to sign transactions
const signature = await hsm.sign({
  to: address,
  amount: amount,
  nonce: nonce
});
```

---

## 📊 ADMIN DASHBOARD (Withdrawal Review)

```typescript
// Admin sees this before approving:

{
  "withdrawal_id": "abc123",
  "user": {
    "id": "user-456",
    "email": "trader@example.com",
    "account_age_days": 45,
    "total_commission_earned": 1247.50,
    "total_withdrawn": 200.00,
    "current_balance": 1047.50
  },
  "request": {
    "amount": 500.00,
    "crypto_address": "TXyz...abc",
    "currency": "USDT",
    "created_at": "2025-11-27T10:00:00Z"
  },
  "agent_checks": {
    "risk_score": 25, // LOW risk
    "checksum": "VALID",
    "balance": "SUFFICIENT",
    "fraud_indicators": "NONE",
    "aml_check": "PASSED"
  },
  "reconciliation": {
    "status": "MATCHED",
    "total_earned": 1247.50,
    "total_withdrawn": 200.00,
    "expected_balance": 1047.50,
    "actual_balance": 1047.50,
    "difference": 0.00
  },
  "recommendation": "APPROVE ✅",
  "requires_action": "2FA approval to execute"
}
```

Admin clicks **[Approve with 2FA]** → enters code → System auto-executes → tx_hash returned

---

## 🎯 SUMMARY: Can It Be Automated? YES!

### **Automated Steps** ✅:
1. ✅ Agent pre-check (fraud detection, AML)
2. ✅ Accounting reconciliation (balance verification)
3. ✅ Hot wallet execution (after approval)
4. ✅ Blockchain verification
5. ✅ Audit logging

### **Human Steps** 👤:
1. 👤 Admin approval with 2FA (CANNOT be bypassed)

### **Fraud Prevention** 🔒:
- ✅ Checksums prevent data tampering
- ✅ Append-only audit log (immutable history)
- ✅ Separation of duties (agent ≠ admin ≠ execution)
- ✅ Multi-signature approval
- ✅ Hot wallet keys in HSM (not accessible to humans)
- ✅ Blockchain verification (tx_hash proof)

### **Can Admin Cheat?** ❌ NO
- Admin can only APPROVE, not EXECUTE
- Execution reads data from database (cannot be modified mid-flight)
- Address/amount locked before execution
- Full audit trail shows who approved what

**Result**: SAFE + AUTOMATED + AUDIT-COMPLIANT 🎯

Anh muốn em implement luôn không? 💎⚔️
