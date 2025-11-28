# Message for Gemini CLI

Xin chào Gemini! Đây là hướng dẫn cho bạn:

## 📁 Files Location

Các file bạn cần đã được đặt đúng vị trí:

1. **Implementation Plan**: 
   ```
   docs/payment_integration_plan.md
   ```
   ✅ File này chứa toàn bộ kế hoạch chi tiết (26KB)

2. **Daily Update (Project Context)**:
   ```
   .gemini/DAILY_UPDATE.md
   ```
   ✅ File này chứa project context và workflow

3. **Agents (Consult before coding)**:
   ```
   .ai/agents/code-reviewer.md
   .ai/agents/database-admin.md
   .ai/agents/tester.md
   .ai/agents/ui-ux-designer.md
   ```
   ✅ Tất cả agents đã có sẵn

## 🚀 Next Steps

**Bạn nên thực hiện theo thứ tự**:

### Step 1: Read Documentation (5 min)
```bash
# 1. Read project context
cat .gemini/DAILY_UPDATE.md

# 2. Read implementation plan
cat docs/payment_integration_plan.md

# 3. Check agents
ls -la .ai/agents/
```

### Step 2: Phase 1 - Setup (30 min)

#### Install Dependencies
```bash
npm install @polar-sh/sdk zod
npm install -D @types/node
```

#### Create Directory Structure
```bash
mkdir -p src/lib/payments
mkdir -p src/app/api/webhooks/polar
mkdir -p src/app/api/webhooks/binance-pay
mkdir -p src/app/api/checkout
mkdir -p src/components/payments
mkdir -p src/config
mkdir -p supabase/migrations
```

#### Verify Structure
```bash
tree -L 3 src/lib src/app/api src/components -I node_modules
```

### Step 3: Begin Implementation

**Sau khi setup xong**, bắt đầu với:
1. Config file: `src/config/payment-tiers.ts`
2. Polar client: `src/lib/payments/polar-client.ts`
3. Database migration: `supabase/migrations/20251126_payment_system.sql`

## 📝 Important Notes

1. **Use Test Mode** credentials khi có
2. **Follow implementation plan** trong `docs/payment_integration_plan.md`
3. **Consult agents** trước khi code:
   - Database → `.ai/agents/database-admin.md`
   - Security → `.ai/agents/code-reviewer.md`
   - Testing → `.ai/agents/tester.md` 

4. **Conventional Commits**:
   ```bash
   feat(payment): add Polar integration
   feat(payment): add Binance Pay integration
   test(payment): add webhook tests
   ```

## ✅ Ready to Start?

Confirm you can see these files:
```bash
ls -la docs/payment_integration_plan.md
ls -la .gemini/DAILY_UPDATE.md
ls -la .ai/agents/
```

If all files found, proceed with **Phase 1: Setup**! 🚀
