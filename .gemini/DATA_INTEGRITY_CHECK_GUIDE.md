# Hướng Dẫn Kiểm Tra Tính Toàn Vẹn Dữ Liệu - Gemini CLI
## Data Integrity Verification for Apex Platform

---

## 📋 Nội Dung
1. [Khởi động](#khởi-động)
2. [Kiểm tra Cơ bản](#kiểm-tra-cơ-bản)
3. [Kiểm tra Nâng cao](#kiểm-tra-nâng-cao)
4. [Quy trình Toàn Diện](#quy-trình-toàn-diện)
5. [Xử Lý Lỗi](#xử-lý-lỗi)
6. [Báo Cáo](#báo-cáo)

---

## 🚀 Khởi động

### Bước 1: Đăng nhập Gemini CLI
```bash
# Nếu chưa đăng nhập
gemini login --google

# Xác thực trong trình duyệt, sau đó quay lại terminal
# Chọn Google AI Ultra subscription
```

### Bước 2: Kiểm tra Kết nối Database
```bash
# Kiểm tra Supabase connection
gemini code --generate "
Check Supabase connection:
- Verify database is accessible
- Test connection pool
- Get current connection status
"
```

### Bước 3: Khởi tạo Kiểm tra
```bash
gemini create-task --task "apex-data-integrity-check"
```

---

## ✅ Kiểm tra Cơ bản

### 1. Kiểm tra Toàn vẹn Bảng Dữ liệu
```bash
gemini code --generate "
Check table integrity for Apex Platform:
1. Users Table:
   - Count total users
   - Verify no null primary keys
   - Check email uniqueness
   - Validate phone_verified flags
   - Check created_at vs updated_at consistency

2. Wallets Table:
   - Verify all users have wallets
   - Check balance >= 0
   - Sum balances match total
   - Validate currency codes

3. Orders Table:
   - Count by status (pending, filled, cancelled)
   - Check order_id uniqueness
   - Verify user_id exists in users
   - Validate timestamps (created < updated)
   - Check price > 0, quantity > 0
   - Verify symbol format

4. Positions Table:
   - Check position_id uniqueness
   - Verify user_id exists
   - Check open_price > 0, size > 0
   - Validate entry_time < current_time
   - Check PnL calculation accuracy

5. Audit Logs Table:
   - Verify action is not null
   - Check admin_id exists
   - Validate timestamp
   - Check description format
"
```

### 2. Kiểm tra Tham chiếu Ngoại khóa
```bash
gemini code --generate "
Verify Foreign Key Relationships:

Check these relationships:
1. orders.user_id → users.id (all orders have valid user)
2. positions.user_id → users.id
3. wallets.user_id → users.id (1:1 relationship)
4. automation_rules.user_id → users.id
5. copy_trading_leaders.user_id → users.id
6. copy_trading_followers.leader_id → copy_trading_leaders.id
7. trading_signals.user_id → users.id
8. audit_logs.admin_id → admin_users.id
9. security_alerts.user_id → users.id

Return:
- Total orphaned records per relationship
- List of problematic IDs
- Recommendation for cleanup
"
```

### 3. Kiểm tra Tính Nhất quán Dữ liệu
```bash
gemini code --generate "
Check Data Consistency:

1. Balance Consistency:
   - Sum all wallet balances
   - Compare with total deposited funds
   - Check for negative balances

2. Order Status Consistency:
   - Count pending orders > 24h old
   - Verify filled orders have execution price
   - Check cancelled orders have reason

3. Position Status:
   - Open positions vs closed positions ratio
   - Verify all open positions have wallets
   - Check leverage is within limits

4. Trading Volume:
   - Daily volume by symbol
   - Weekly trading patterns
   - Monthly growth/decline trends

5. Copy Trading Consistency:
   - Verify all followers have active leaders
   - Check copy trading rules are valid
   - Verify follower balances sufficient
"
```

---

## 🔍 Kiểm tra Nâng cao

### 1. Kiểm tra Sự Toàn vẹn PnL
```bash
gemini code --generate "
Validate PnL Calculations:

For each position:
1. Calculate PnL = (current_price - entry_price) × size × direction
2. Compare with stored PnL
3. Calculate percentage yield = PnL / (entry_price × size)
4. Verify percentage matches stored value

Return:
- Positions with incorrect PnL
- Variance threshold exceeded (>0.001%)
- Recommendations for fix

Check:
- Closed positions PnL matches history
- Open positions PnL matches current price
- Floating PnL vs realized PnL separation
"
```

### 2. Kiểm tra Tính An toàn Giao dịch
```bash
gemini code --generate "
Verify Transaction Safety:

1. Order History:
   - All filled orders have execution timestamps
   - No duplicate orders (same symbol, size, user, within 1s)
   - Order execution sequence is correct

2. Stop Loss & Take Profit:
   - All automation rules have valid triggers
   - No circular dependencies
   - Trigger values are realistic

3. Risk Limits:
   - No position exceeds size limits
   - Leverage not exceeding platform max
   - Total exposure within limits

4. Margin Requirements:
   - Calculate required margin per user
   - Compare with available balance
   - Flag under-collateralized accounts

5. Price Data Integrity:
   - Latest price timestamp recent (< 60s)
   - No price gaps > 5%
   - Trading pairs in sync across services
"
```

### 3. Kiểm tra Bảo mật & Tuân thủ
```bash
gemini code --generate "
Security & Compliance Checks:

1. Authentication:
   - All users have password hash
   - All passwords are salted (bcrypt)
   - No plaintext passwords found

2. Session Management:
   - All active sessions have valid user_id
   - Session expiry times are correct
   - No orphaned sessions

3. MFA Configuration:
   - MFA-enabled users have valid secrets
   - Recovery codes are hashed
   - MFA timestamps are consistent

4. IP Whitelist:
   - All whitelisted IPs are valid format
   - No duplicate IPs per user
   - Last used timestamps are recent

5. Audit Trail:
   - All critical actions logged
   - Audit logs cannot be modified
   - 90-day retention enforced
   - No gaps in timestamp sequences

6. Encryption:
   - Sensitive data encrypted at rest
   - No plaintext API keys
   - Encryption keys rotated correctly
"
```

### 4. Kiểm tra Hiệu suất & Tối ưu hóa
```bash
gemini code --generate "
Performance & Optimization Checks:

1. Index Usage:
   - All foreign keys are indexed
   - Query performance is optimal
   - No table scans on large tables

2. Data Size:
   - Audit logs not exceeding limits
   - Orphaned data cleaned up
   - Table statistics current

3. Replication Status:
   - Supabase replica lag < 1s
   - All data synced correctly
   - No replication errors

4. Cache Consistency:
   - Redis cache data matches database
   - Cache expiry times appropriate
   - No stale data in cache

5. Query Performance:
   - Slow query log review
   - N+1 query detection
   - Connection pool efficiency
"
```

---

## 🔁 Quy trình Toàn Diện

### Chạy Kiểm tra Hoàn chỉnh
```bash
gemini task "
Execute comprehensive data integrity verification for Apex Platform:

STEP 1: Pre-Check (5 min)
[✓] Verify Gemini CLI version
[✓] Check database connectivity
[✓] Verify API access
[✓] Confirm timestamps

STEP 2: Basic Integrity (10 min)
[✓] Run table structure verification
[✓] Check all tables exist
[✓] Verify column types
[✓] Test data insertion/query

STEP 3: Data Quality (15 min)
[✓] Check foreign key relationships
[✓] Verify referential integrity
[✓] Find orphaned records
[✓] Check for duplicates

STEP 4: Business Logic (20 min)
[✓] Verify PnL calculations
[✓] Check order execution correctness
[✓] Validate trading rules
[✓] Verify balance calculations

STEP 5: Security (10 min)
[✓] Check encryption status
[✓] Verify MFA integrity
[✓] Audit user permissions
[✓] Review security logs

STEP 6: Performance (10 min)
[✓] Check query performance
[✓] Verify index efficiency
[✓] Monitor cache hit rates
[✓] Review resource usage

STEP 7: Generate Report (5 min)
[✓] Summarize findings
[✓] List issues found
[✓] Provide remediation steps
[✓] Save report with timestamp

Total Time: ~75 minutes
"
```

### Lệnh Tự động hóa Toàn bộ
```bash
# Tạo script kiểm tra tự động
gemini code --generate "
Create an automated data integrity check script:

File: scripts/data-integrity-check.sh

Features:
1. Runs all checks in sequence
2. Captures timestamp and environment
3. Generates JSON report
4. Sends alerts if issues found
5. Archives reports daily
6. Compares with baseline
7. Flags data anomalies

Output:
- Console log (real-time)
- JSON report (archival)
- Email notification (issues)
- Dashboard widget (status)

Run daily at 2 AM UTC via cron
"
```

---

## 🛠️ Xử Lý Lỗi

### Lỗi Phổ biến & Giải pháp

```bash
gemini code --generate "
Handle common data integrity issues:

Issue 1: Orphaned Orders
ERROR: Order user_id references non-existent user
SOLUTION:
- Delete orphaned orders
- Refund wallet if applicable
- Create audit log entry
- Alert admin

Issue 2: Incorrect PnL
ERROR: Stored PnL ≠ Calculated PnL
SOLUTION:
- Recalculate from price history
- Update position PnL
- Check for price data gaps
- Verify order execution

Issue 3: Negative Balance
ERROR: Wallet balance < 0
SOLUTION:
- Investigate transactions
- Check for race conditions
- Verify last update timestamp
- Compensate if system error

Issue 4: Stale Sessions
ERROR: Sessions older than expiry
SOLUTION:
- Delete expired sessions
- Force user re-login
- Log security event
- Monitor for anomalies

Issue 5: Cache Mismatch
ERROR: Redis data ≠ Database
SOLUTION:
- Rebuild cache from database
- Verify consistency
- Monitor for future issues
- Increase cache TTL if needed

Issue 6: Replication Lag
ERROR: Replica data not synced
SOLUTION:
- Check Supabase status
- Monitor replica lag
- Disable reads from replica
- Wait for sync completion
"
```

---

## 📊 Báo Cáo

### Định dạng Báo cáo
```bash
gemini code --generate "
Generate comprehensive data integrity report:

Report Structure:

HEADER:
- Timestamp
- Platform version
- Database size
- Total users/transactions

EXECUTIVE SUMMARY:
- Overall integrity score (0-100)
- Critical issues count
- Warning count
- Info count

DETAILED FINDINGS:
1. Data Quality
   - Completeness: X%
   - Accuracy: X%
   - Consistency: X%

2. Referential Integrity
   - Valid foreign keys: X%
   - Orphaned records: X
   - Duplicates found: X

3. Business Logic
   - PnL calculation errors: X
   - Order mismatches: X
   - Balance discrepancies: X

4. Security
   - Encryption status: OK
   - Audit coverage: X%
   - Access violations: X

5. Performance
   - Query avg time: Xms
   - Index efficiency: X%
   - Cache hit rate: X%

RECOMMENDATIONS:
- Priority 1 (Critical): [list]
- Priority 2 (High): [list]
- Priority 3 (Medium): [list]

ARCHIVE:
- Save as: data-integrity-[YYYYMMDD-HHMMSS].json
- Store in: ./.data-integrity-reports/
- Retention: 90 days
"
```

### Lệnh Xuất Báo cáo
```bash
# Xuất báo cáo theo định dạng khác nhau
gemini report --format json --output reports/
gemini report --format html --output reports/
gemini report --format csv --output reports/

# Gửi báo cáo qua email
gemini report --email admin@apex.com --format html

# So sánh với báo cáo trước đó
gemini report --compare --days 7
```

---

## 📝 Checklist Kiểm tra

### Hàng ngày (5 phút)
- [ ] Check database status
- [ ] Verify no orphaned records from yesterday
- [ ] Review error logs
- [ ] Check wallet balances total

### Hàng tuần (30 phút)
- [ ] Run full integrity check
- [ ] Verify PnL calculations
- [ ] Check for slow queries
- [ ] Review access logs

### Hàng tháng (2 giờ)
- [ ] Full system audit
- [ ] Performance analysis
- [ ] Security review
- [ ] Backup verification

---

## 🎯 Chỉ số Chính (KPIs)

```bash
gemini metrics --track "
Key Metrics to Monitor:

1. Data Integrity Score: ≥ 99.9%
2. Orphaned Records: ≤ 0
3. PnL Accuracy: ± 0.001%
4. Cache Hit Rate: ≥ 95%
5. Query Response Time: < 100ms
6. Audit Log Coverage: 100%
7. Backup Success Rate: 100%
8. Security Violations: 0

Set alerts when:
- Integrity score drops below 99.5%
- Any orphaned records found
- PnL variance exceeds threshold
- Cache hit rate drops below 90%
- Query time exceeds 500ms
"
```

---

## 🔗 Tài Nguyên Liên Quan

- `/backend/services/` - Các service kiểm tra
- `/docs/` - Tài liệu hệ thống
- `MIGRATION_VERIFICATION_CHECKLIST.md` - Kiểm tra migration
- `VERIFICATION_CHECKPOINT.md` - Điểm kiểm tra

---

## ✨ Kết luận

Sử dụng hướng dẫn này với Gemini CLI để:
1. **Đảm bảo** tính toàn vẹn dữ liệu
2. **Phát hiện** lỗi sớm
3. **Tuân thủ** tiêu chuẩn bảo mật
4. **Tối ưu** hiệu suất hệ thống
5. **Tự động hóa** quy trình kiểm tra

**Mục tiêu: Đạt 99.99% Data Integrity Score** ✅
