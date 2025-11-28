# ApexOS - $99 Founders Circle Business Logic

## 🎯 Value Proposition

**What Customer Gets for $99:**

### **Tier Comparison:**

| Feature | Free Tier | Founders Circle ($99) |
|---------|-----------|----------------------|
| **Wolf Pack Agents** | View only | Full automation |
| **PnL Calculator** | Manual refresh | Real-time sync |
| **Auditor Agent** | Basic reports | AI-powered audit + rebate claims |
| **Guardian Agent** | Alerts disabled | 24/7 risk monitoring + Slack alerts |
| **Concierge AI** | Limited (10 msg/day) | Unlimited chat |
| **Exchange Connections** | 1 exchange | Unlimited exchanges |
| **Data Retention** | 30 days | Lifetime |
| **API Rate Limit** | 10 req/min | 1000 req/min |
| **Export Reports** | CSV only | PDF + Excel + Tax format |
| **Priority Support** | Email (48h) | Slack/Telegram (2h) |
| **Referral Rebates** | 0% | 20% of referred user fees |
| **VIP Badge** | ❌ | ✅ Founders Circle badge |

---

## 💰 Revenue Model

### **One-Time Payment:**
- **Price:** $99 USD
- **Payment Methods:**
  - Crypto (USDT - BEP20/TRC20)
  - Bank Transfer (VietQR for Vietnam)
  - Credit Card (Stripe - coming soon)

### **Limited Availability:**
- **Total Spots:** 100 (Founders Circle)
- **Current Taken:** 87
- **Remaining:** 13

**After 100 sold:**
- Price increases to $199/year (subscription model)
- Founders get **lifetime** access
- Early adopter advantage

---

## 🔧 Technical Implementation

### **1. Database Schema**

```sql
-- Add subscription tier to users table
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
-- Options: 'free', 'founders', 'premium'

ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMPTZ;
-- NULL = lifetime (for Founders)

ALTER TABLE users ADD COLUMN payment_tx_id VARCHAR(255);
-- Blockchain TxID or bank reference

ALTER TABLE users ADD COLUMN payment_verified BOOLEAN DEFAULT FALSE;

-- Payment verification table
CREATE TABLE payment_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tx_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20), -- 'crypto', 'bank', 'stripe'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'failed'
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Founders Circle tracking
CREATE TABLE founders_circle (
  slot_number INT PRIMARY KEY, -- 1 to 100
  user_id UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  tx_id VARCHAR(255)
);
```

### **2. Backend API Endpoints**

#### **POST /api/v1/payment/initiate**
```python
@router.post("/payment/initiate")
async def initiate_payment(user_id: str, payment_method: str):
    """
    Step 1: User clicks 'Secure My Spot'
    Returns payment address/QR code
    """
    # Check if slots available
    available_slots = 100 - count_founders()
    if available_slots <= 0:
        return {"error": "Founders Circle is full"}
    
    # Generate payment info
    if payment_method == 'crypto':
        address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        return {
            "address": address,
            "amount": "99.00 USDT",
            "network": "BEP20 or TRC20",
            "qr_code": generate_qr(address, 99)
        }
    elif payment_method == 'bank':
        return {
            "account_name": "Apex Financial Technologies",
            "account_number": "1234567890",
            "bank": "Vietcombank",
            "amount": "2,277,000 VND", # ~$99
            "reference": f"APEX{user_id[:8]}"
        }
```

#### **POST /api/v1/payment/verify**
```python
@router.post("/payment/verify")
async def verify_payment(user_id: str, tx_id: str, payment_method: str):
    """
    Step 2: User submits TxID
    Verify on blockchain or bank
    """
    # Create pending verification
    verification = create_verification(user_id, tx_id, payment_method)
    
    if payment_method == 'crypto':
        # Check blockchain (BSC/TRC20)
        result = await verify_blockchain_tx(tx_id, expected_amount=99)
        
        if result['valid']:
            # Mark verified
            upgrade_user_to_founders(user_id, tx_id)
            claim_founders_slot(user_id, tx_id)
            
            return {
                "status": "verified",
                "message": "Welcome to Founders Circle!",
                "tier": "founders",
                "slot_number": get_user_slot(user_id)
            }
        else:
            return {
                "status": "pending",
                "message": "Transaction not found yet. Please wait 5-10 minutes."
            }
    
    elif payment_method == 'bank':
        # Manual verification (admin approval)
        return {
            "status": "pending",
            "message": "Bank transfer verification takes 15-60 minutes. We'll notify you."
        }
```

#### **GET /api/v1/user/tier**
```python
@router.get("/user/tier")
async def get_user_tier(user: dict = Depends(get_current_user)):
    """
    Check user's subscription tier
    Used by frontend to show/hide features
    """
    user_data = fetch_user(user['user_id'])
    
    return {
        "tier": user_data['subscription_tier'], # 'free' or 'founders'
        "is_founders": user_data['subscription_tier'] == 'founders',
        "features": get_tier_features(user_data['subscription_tier']),
        "slot_number": get_user_slot(user['user_id']) if founders else None
    }
```

### **3. Blockchain Verification (Python)**

```python
# backend/integrations/blockchain_verifier.py

from web3 import Web3

BSC_RPC = "https://bsc-dataseed1.binance.org"
TRC_API = "https://apilist.tronscan.org/api/transaction-info"

async def verify_blockchain_tx(tx_id: str, expected_amount: float):
    """
    Verify USDT transaction on BSC or TRC20
    """
    # Try BSC first
    w3 = Web3(Web3.HTTPProvider(BSC_RPC))
    
    try:
        tx = w3.eth.get_transaction(tx_id)
        
        # Check if to our address
        if tx['to'].lower() != "0x71C7656EC7ab88b098defB751B7401B5f6d8976F".lower():
            return {"valid": False, "reason": "Wrong recipient"}
        
        # Decode USDT transfer (ERC20)
        amount = decode_usdt_amount(tx['input'])
        
        if amount >= expected_amount * 0.98:  # Allow 2% slippage
            return {"valid": True, "amount": amount, "network": "BSC"}
        else:
            return {"valid": False, "reason": f"Amount too low: {amount}"}
            
    except:
        # Try TRC20
        return await verify_tron_tx(tx_id, expected_amount)

async def verify_tron_tx(tx_id: str, expected_amount: float):
    """Verify on Tron network"""
    # Implementation using TronScan API
    pass
```

### **4. Frontend Feature Gates**

```typescript
// src/hooks/useFeatureAccess.ts

export function useFeatureAccess() {
  const { user } = useAuth();
  const [tier, setTier] = useState<'free' | 'founders'>('free');

  useEffect(() => {
    fetch(`/api/v1/user/tier`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setTier(data.tier));
  }, [user]);

  return {
    isFounders: tier === 'founders',
    canUseAgent: (agent: string) => {
      if (tier === 'founders') return true;
      
      // Free tier limitations
      if (agent === 'collector') return true; // View only
      if (agent === 'auditor') return false; // Paid only
      if (agent === 'guardian') return false; // Paid only
      if (agent === 'concierge') return 'limited'; // 10 msg/day
    },
    showUpgradePrompt: tier === 'free'
  };
}
```

```tsx
// Example usage in Dashboard
export default function Dashboard() {
  const { isFounders, showUpgradePrompt } = useFeatureAccess();

  return (
    <>
      {showUpgradePrompt && (
        <UpgradeBanner 
          message="Unlock Wolf Pack automation for $99 (Limited: 13/100 spots left)"
          ctaLink="/offer"
        />
      )}

      {/* Auditor Agent - Gated */}
      <AuditorPanel>
        {isFounders ? (
          <AuditorFullAccess />
        ) : (
          <LockedOverlay>
            <Lock /> Founders Circle Only
            <Button onClick={() => router.push('/offer')}>
              Upgrade Now
            </Button>
          </LockedOverlay>
        )}
      </AuditorPanel>
    </>
  );
}
```

---

## 📊 User Journey (Full Flow)

### **Path 1: Free → Founders (New User)**

1. **Land on `/landing`** → See Synergy Core, Wolf Pack
2. **Click "Request Access"** → `/login`
3. **Sign up** → Create free account
4. **Redirect to `/dashboard`** → See limited features
5. **See upgrade banner** → "13/100 spots left"
6. **Click "Upgrade"** → Redirect to `/offer`
7. **Use calculator** → "I'm losing $X/year!"
8. **Click "Secure My Spot"** → Payment modal opens
9. **Choose payment method** → Crypto or Bank
10. **Complete payment** → Paste TxID
11. **Verify** → Backend checks blockchain
12. **Success** → Tier upgraded to 'founders'
13. **Redirect to `/dashboard`** → All features unlocked
14. **Founders badge** → "Slot #88/100"

### **Path 2: Direct Purchase (Savvy User)**

1. **Land on `/`** → Auto-redirect to `/landing`
2. **See headline** → "The Power of Collective"
3. **Scroll to CTA** → "Join Founders Circle"
4. **Click** → Redirect to `/offer`
5. **Read value prop** → Calculator, testimonials
6. **Decide** → "This pays for itself"
7. **Purchase flow** → (same as Path 1, steps 8-14)

### **Path 3: Skip (Budget User)**

1. **Land on `/offer`**
2. **See price** → "$99 too expensive"
3. **Click "Skip offer & Access Basic Terminal"**
4. **Redirect to `/dashboard`** → Free tier
5. **Use limited features** → Manual PnL, view-only agents
6. **Hit paywall** → "Unlock Auditor? Upgrade to Founders"

---

## 🔒 Anti-Fraud Measures

### **1. Payment Verification:**
- Blockchain TxID must match amount + recipient
- Bank transfers verified by admin (OCR on screenshot)
- Stripe webhooks for credit card

### **2. Slot Protection:**
- Each slot claimed only once
- TxID can't be reused
- User can't upgrade twice

### **3. Refund Policy:**
- 30-Day Money Back Guarantee
- If Auditor doesn't save $99+ in fees → Refund
- Downgrade to free tier if refunded

### **4. Admin Dashboard:**
- View all pending verifications
- Manually approve/reject
- See Founders Circle slots (1-100)
- Fraud detection (duplicate TxIDs, suspicious patterns)

---

## 📈 Growth Leverage

### **Viral Mechanics:**

**Referral Program** (Post-Purchase):
- Founders get unique referral link
- 20% of referred user's fees → Rebated
- Example: Refer 10 traders → Extra $500/year passive income

**Social Proof:**
- Display "Slot #88/100" badge prominently
- Leaderboard: "Top Founders by Referrals"
- FOMO: "Only 12 slots left!" banner

**Network Effect:**
- More Founders → Higher collective volume
- Higher volume → Better VIP tiers for ALL
- Synergy Core visualization shows this

---

## 💡 Future Pricing (Post-Founders)

**After 100 sold:**

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | View only, 1 exchange, 30-day history |
| Standard | $29/mo | 2 agents unlocked, 3 exchanges, 90-day history |
| Pro | $99/mo | All 4 agents, unlimited exchanges, lifetime history |
| **Founders** | **$99 ONE-TIME** | Pro features + lifetime access + referral income |

**Founders Privilege:**
- Locked-in price forever
- Never pay subscription
- Grandfather clause for new features
- VIP support priority

---

## ✅ Implementation Checklist

**Backend:**
- [ ] Add `subscription_tier` column to users table
- [ ] Create `payment_verifications` table
- [ ] Create `founders_circle` table (slots 1-100)
- [ ] Build `/payment/initiate` endpoint
- [ ] Build `/payment/verify` endpoint
- [ ] Build blockchain verifier (BSC/TRC20)
- [ ] Build admin approval for bank transfers

**Frontend:**
- [ ] Create `useFeatureAccess()` hook
- [ ] Build `/offer` sales page (already done ✅)
- [ ] Add upgrade banners in Dashboard
- [ ] Add "Locked" overlays on gated features
- [ ] Build payment success flow
- [ ] Show Founders badge in navbar

**Testing:**
- [ ] Test crypto payment on testnet
- [ ] Test bank transfer verification
- [ ] Test feature unlocking
- [ ] Test slot claiming (concurrent users)
- [ ] Test refund flow

**Launch:**
- [ ] Set Founders limit to 100
- [ ] Enable payment processing
- [ ] Monitor first 10 purchases
- [ ] Fix any bugs
- [ ] Scale to 100 ✅

---

*This is the complete business logic for the $99 Founders Circle offer.*

*Ready for implementation when payment processing is enabled.*
