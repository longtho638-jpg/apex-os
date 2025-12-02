# Gemini CLI - Data Integrity Check Prompt
## Hướng dẫn Kiểm tra Toàn vẹn Dữ liệu cho Apex Platform

---

## 🎯 Mục đích
Sử dụng prompt này với **Gemini CLI** để tự động kiểm tra tính toàn vẹn dữ liệu trên toàn bộ Apex Platform, đảm bảo **không có dữ liệu bị mất** hoặc **hỏng hóc**.

---

## 📋 Các Bước Thực hiện

### Bước 1: Khởi động Gemini CLI
```bash
# Nếu chưa cài đặt
npm install -g @google/generative-ai-cli

# Đăng nhập
gemini login --google

# Chọn: Google AI Ultra
```

### Bước 2: Chạy Kiểm tra
```bash
# Copy prompt dưới đây vào Gemini CLI
gemini task @data-integrity-check

# Hoặc copy-paste trực tiếp:
gemini task "
[COPY FULL PROMPT BELOW]
"
```

---

## 🔍 FULL PROMPT FOR GEMINI CLI

```
You are a Data Integrity Expert for Apex OS trading platform.

OBJECTIVE:
Perform comprehensive data integrity verification on the Apex Platform database.
Ensure NO data loss, corruption, or inconsistencies exist across ALL tables.

DATABASE TABLES TO CHECK:
1. users
2. admin_users
3. wallets
4. orders
5. positions
6. order_book
7. automation_rules
8. copy_trading_leaders
9. copy_trading_followers
10. trading_signals
11. audit_logs
12. security_alerts
13. agent_heartbeats

COMPREHENSIVE CHECKS REQUIRED:

═══════════════════════════════════════════════════════════════════
PHASE 1: TABLE STRUCTURE VERIFICATION
═══════════════════════════════════════════════════════════════════

For EACH table:
1. Verify table exists and is accessible
2. Check all expected columns are present
3. Verify column data types are correct
4. Check constraints (PRIMARY KEY, UNIQUE, NOT NULL)
5. Count total rows
6. Get last modified timestamp
7. Calculate table size

Expected Output:
✓ [TABLE_NAME] - [ROW_COUNT] rows - [SIZE] KB - Status: OK

═══════════════════════════════════════════════════════════════════
PHASE 2: FOREIGN KEY INTEGRITY
═══════════════════════════════════════════════════════════════════

Verify all relationships:

1. orders.user_id → users.id
   - All orders have valid user_id
   - No orphaned orders
   - Count mismatches

2. positions.user_id → users.id
   - All positions have valid user_id
   - Check for orphaned positions

3. wallets.user_id → users.id (1:1 relationship)
   - Every user has exactly one wallet
   - No duplicate wallets per user

4. automation_rules.user_id → users.id
   - All rules reference valid users

5. copy_trading_leaders.user_id → users.id
   - All leaders are valid users

6. copy_trading_followers.leader_id → copy_trading_leaders.id
   - All followers reference valid leaders

7. trading_signals.user_id → users.id
   - All signals reference valid users

8. audit_logs.admin_id → admin_users.id
   - All logs reference valid admins

9. security_alerts.user_id → users.id
   - All alerts reference valid users

Output Format:
[RELATIONSHIP] - Valid: [YES/NO] - Orphaned: [COUNT] - Status: [OK/FAILED]

═══════════════════════════════════════════════════════════════════
PHASE 3: DATA QUALITY CHECKS
═══════════════════════════════════════════════════════════════════

3.1 USER DATA:
- Total users count
- Users with valid email format
- Users with valid phone (if present)
- Email uniqueness verification
- No duplicate phone numbers
- created_at ≤ updated_at for all users
- Status distribution (active/inactive/suspended)

3.2 WALLET DATA:
- Total wallets count
- Verify 1:1 relationship with users
- All balances ≥ 0 (no negative balances)
- Total balance sum
- Currency validation (USD, EUR, etc)
- No missing or NULL balance fields
- Created timestamp consistency

3.3 ORDERS DATA:
- Total orders count
- Order status distribution:
  * Pending orders
  * Filled orders
  * Cancelled orders
  * Expired orders
- Order ID uniqueness verification
- Price validation (> 0)
- Quantity validation (> 0)
- Timestamp sequence (created_at < updated_at < filled_at)
- Symbol format validation
- No duplicate orders within 1 second for same user

3.4 POSITIONS DATA:
- Total positions count
- Open vs closed positions distribution
- Entry price validation (> 0)
- Exit price validation (if closed)
- Size validation (> 0)
- Leverage within limits (if applicable)
- Timestamp sequence validation
- PnL calculation correctness

3.5 ORDER BOOK DATA:
- Total active limit orders
- Price level distribution
- No stale orders (older than 24h)
- Order queue integrity
- Bid-ask spread validation

3.6 AUTOMATION RULES DATA:
- Total rules count
- Rule trigger validation
- Stop loss values reasonable
- Take profit values reasonable
- No circular dependencies

Output Format:
[CATEGORY] - [CHECK] - [RESULT] - [COUNT/DETAIL]

═══════════════════════════════════════════════════════════════════
PHASE 4: BUSINESS LOGIC VERIFICATION
═══════════════════════════════════════════════════════════════════

4.1 PnL CALCULATION ACCURACY:
For sample of positions:
- Calculate: PnL = (current_price - entry_price) × size × direction
- Compare with stored PnL value
- Check percentage: (PnL / entry_value) × 100
- Variance threshold: ±0.001%
- Report any mismatches

4.2 ORDER EXECUTION CORRECTNESS:
- All filled orders have execution_price
- Execution_price within reasonable range
- Execution timestamp is valid
- Order quantity matches execution quantity

4.3 BALANCE CONSISTENCY:
- Sum all wallet balances
- Verify consistency with transaction history
- Check for negative balances (CRITICAL)
- Verify deposit/withdrawal transactions

4.4 COPY TRADING VALIDATION:
- All followers have valid leader relationships
- Follower account balance sufficient
- Copy trading rules are valid
- Trade replication matches

4.5 TRADING SIGNAL VALIDATION:
- All signals have valid user_id
- Signal timestamp is recent
- Confidence score 0-100
- RSI and MACD values realistic

Output Format:
[VALIDATION] - [STATUS] - [DETAILS] - [RISK_LEVEL]

═══════════════════════════════════════════════════════════════════
PHASE 5: SECURITY & COMPLIANCE CHECK
═══════════════════════════════════════════════════════════════════

5.1 AUTHENTICATION:
- No plaintext passwords found
- All passwords using bcrypt (check cost factor ≥ 10)
- All passwords have valid salt
- Admin passwords strong validation

5.2 SESSION MANAGEMENT:
- Active sessions have valid user_id
- Session expiry times correct
- No orphaned sessions
- Session token format validation

5.3 MFA COMPLIANCE:
- MFA-enabled users have valid secrets
- Recovery codes are hashed
- MFA timestamp consistency
- No expired MFA setups

5.4 IP WHITELIST VALIDATION:
- All IPs in valid format (IPv4/IPv6)
- No duplicate IPs per user
- Last used timestamp reasonable
- Whitelist not empty for restricted accounts

5.5 AUDIT LOG INTEGRITY:
- All critical actions logged
- 100% coverage of important operations
- 90-day retention enforced
- No gaps in timestamp sequences
- Log timestamps in correct order

5.6 ENCRYPTION STATUS:
- Sensitive fields encrypted
- No plaintext API keys or secrets
- Encryption key rotation status
- Encryption algorithm validation

Output Format:
[SECURITY_AREA] - [COMPLIANCE] - [ISSUES_FOUND] - [RISK_LEVEL]

═══════════════════════════════════════════════════════════════════
PHASE 6: PERFORMANCE & OPTIMIZATION
═══════════════════════════════════════════════════════════════════

6.1 DATABASE PERFORMANCE:
- Query response time (target: < 100ms)
- Slow query log review
- N+1 query detection
- Index efficiency scores

6.2 CACHE CONSISTENCY:
- Redis cache data matches database
- Cache expiry times appropriate
- Cache hit rates (target: > 95%)
- No stale data in cache

6.3 DATA REPLICATION:
- Supabase replica lag (target: < 1s)
- All data synced to replicas
- No replication errors
- Replica consistency verified

6.4 TABLE STATISTICS:
- Statistics current and accurate
- Index usage statistics
- Query plan optimization
- Dead tuple removal status

Output Format:
[PERFORMANCE_METRIC] - [VALUE] - [THRESHOLD] - [STATUS]

═══════════════════════════════════════════════════════════════════
PHASE 7: ANOMALY DETECTION
═══════════════════════════════════════════════════════════════════

Identify unusual patterns:

7.1 VOLUME ANOMALIES:
- Daily transaction volume vs average
- Peak volume times
- Unusual trading patterns
- Account activity spikes

7.2 DATA ANOMALIES:
- Unusual price movements (> 5%)
- Order size outliers
- Balance changes unexplained
- Timestamp anomalies

7.3 DUPLICATE DETECTION:
- Duplicate user accounts
- Duplicate orders
- Duplicate transactions
- Similar wallet addresses

Output Format:
[ANOMALY_TYPE] - [SEVERITY] - [IMPACT] - [RECOMMENDATION]

═══════════════════════════════════════════════════════════════════
PHASE 8: GENERATE COMPREHENSIVE REPORT
═══════════════════════════════════════════════════════════════════

CREATE A DETAILED REPORT WITH:

1. EXECUTIVE SUMMARY:
   - Overall Status: PASS / FAIL
   - Data Integrity Score: X/100
   - Critical Issues: X
   - Warnings: X
   - Timestamp: YYYY-MM-DD HH:MM:SS
   - Duration: X minutes

2. TABLE SUMMARY:
   - Table Name | Row Count | Status | Issues
   - (table for each)

3. CRITICAL ISSUES (if any):
   - Issue Description
   - Affected Tables
   - Data Count
   - Recommended Action
   - Urgency Level

4. WARNINGS (if any):
   - Warning Description
   - Affected Records Count
   - Impact Assessment
   - Suggested Fix

5. DETAILED FINDINGS:
   - Foreign Key Status
   - Data Quality Score
   - Business Logic Validation
   - Security Compliance
   - Performance Metrics

6. RECOMMENDATIONS:
   - Priority 1 (Critical - immediate action):
   - Priority 2 (High - within 24h):
   - Priority 3 (Medium - within 1 week):

7. COMPLIANCE CHECKLIST:
   - [ ] All tables verified
   - [ ] Foreign keys valid
   - [ ] No data corruption detected
   - [ ] No data loss identified
   - [ ] Security standards met
   - [ ] Performance acceptable
   - [ ] Audit trail complete

═══════════════════════════════════════════════════════════════════
OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════════

1. Format: Structured with headers and sections
2. Tables: Use markdown tables for data
3. Issues: Highlight in red/critical if found
4. Summary: One-page executive summary
5. JSON: Provide machine-readable format for automation
6. Timestamp: Include all timestamps in UTC
7. Metrics: Include all metrics with units

═══════════════════════════════════════════════════════════════════
SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════

✅ Data Integrity Score ≥ 99.9%
✅ Zero Critical Issues
✅ Zero Data Loss
✅ Zero Data Corruption
✅ 100% Foreign Key Validity
✅ 100% Audit Trail Completeness
✅ All Security Standards Met
✅ No Orphaned Records
✅ All Balances Valid (≥ 0)
✅ All Timestamps Consistent

═══════════════════════════════════════════════════════════════════
EXECUTE IMMEDIATELY AND REPORT COMPLETE FINDINGS
═══════════════════════════════════════════════════════════════════
```

---

## 🚀 Cách Sử dụng

### Option 1: Sử dụng CLI Command
```bash
# Copy prompt và chạy
gemini task "$(cat .gemini/GEMINI_DATA_INTEGRITY_PROMPT.md)"
```

### Option 2: Sử dụng file
```bash
# Tạo file task
cat > .gemini/data-integrity-task.txt << 'EOF'
[PASTE PROMPT CONTENT]
EOF

# Chạy task
gemini execute .gemini/data-integrity-task.txt
```

### Option 3: Chạy tự động hàng ngày
```bash
# Thêm vào crontab
0 2 * * * gemini task "$(cat /path/to/.gemini/GEMINI_DATA_INTEGRITY_PROMPT.md)" > /tmp/integrity-check.txt

# Hoặc dùng PM2
pm2 start "gemini task" --name "data-integrity-check" --cron "0 2 * * *"
```

---

## 📊 Kết quả Mong Đợi

Gemini sẽ trả về:
- ✅ Chi tiết từng bảng (row count, size, status)
- ✅ Danh sách FK orphaned records (nếu có)
- ✅ Data quality score
- ✅ Security compliance report
- ✅ Performance metrics
- ✅ Anomalies detected
- ✅ Actionable recommendations
- ✅ Overall integrity score (target: ≥99.9%)

---

## 🎯 Khi Chạy Thành công

Bạn sẽ thấy output như:

```
═══════════════════════════════════════════════════════════════════
DATA INTEGRITY AUDIT REPORT - Apex Platform
═══════════════════════════════════════════════════════════════════

Status: ✅ PASS
Integrity Score: 99.99%
Timestamp: 2025-12-02 02:00:00 UTC
Duration: 15 minutes

TABLE SUMMARY:
- users: 150 rows - OK
- orders: 1,250 rows - OK
- positions: 320 rows - OK
- wallets: 150 rows - OK
- (all other tables) - OK

FOREIGN KEY STATUS:
✓ orders.user_id → users.id: 1,250/1,250 valid (0 orphaned)
✓ positions.user_id → users.id: 320/320 valid (0 orphaned)
✓ wallets.user_id → users.id: 150/150 valid (0 orphaned)
(all other FKs valid)

DATA QUALITY:
✓ No negative balances found
✓ No PnL calculation errors
✓ All timestamps consistent
✓ No duplicate records
✓ 100% encryption compliance

SECURITY:
✓ All passwords bcrypt-hashed
✓ No plaintext secrets
✓ MFA fully configured
✓ Audit trail complete (100%)

PERFORMANCE:
✓ Query time: 45ms avg
✓ Cache hit rate: 96.5%
✓ Replica lag: 0.2s
✓ All indexes optimal

CRITICAL ISSUES: 0
WARNINGS: 0

RECOMMENDATIONS:
(None - system is healthy)

COMPLIANCE CHECKLIST: ✅ ALL PASSED
```

---

## ⚠️ Nếu Phát hiện Vấn đề

Gemini sẽ cố gắng:
1. **Xác định** vấn đề chính xác
2. **Lượng hóa** impact (bao nhiêu records bị ảnh hưởng)
3. **Cung cấp** SQL/code fix nếu cần
4. **Đề xuất** preventive measures

Ví dụ:
```
CRITICAL ISSUE: 5 orphaned orders found
- Order IDs: [123, 456, 789, ...]
- Reason: User account deleted but orders remained
- Impact: $500 in pending orders
- Fix: DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users)
- Prevention: Add CASCADE DELETE constraint
```

---

## 📞 Support

Nếu cần hỗ trợ:
1. Kiểm tra `.claude/` folder để hiểu cấu trúc
2. Tham khảo `docs/` folder để hiểu logic
3. Chạy script `scripts/apex-data-integrity-audit.py` để tự động kiểm tra
4. Contact team nếu vấn đề không giải quyết được

---

## ✨ Kết luận

Prompt này được thiết kế để **Gemini CLI tự động kiểm tra toàn bộ dữ liệu** mà không cần can thiệp của con người.

**Mục tiêu: Data Integrity Score ≥ 99.99%** ✅
