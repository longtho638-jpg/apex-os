# 🔍 Data Integrity Check - Complete Package
## Apex OS - Kiểm Tra Tính Toàn Vẹn Dữ Liệu

---

## 📦 Package Contents

Tài liệu này cung cấp một **package hoàn chỉnh** để kiểm tra tính toàn vẹn dữ liệu trên Apex Platform.

### 📄 Các File Có Sẵn

```
.gemini/
├── README_DATA_INTEGRITY.md              ← Bạn đang đọc
├── QUICK_START_DATA_INTEGRITY.md         ← Khởi động nhanh (5 phút)
├── DATA_INTEGRITY_CHECK_GUIDE.md         ← Hướng dẫn chi tiết
├── GEMINI_DATA_INTEGRITY_PROMPT.md       ← Prompt cho Gemini CLI
└── cron-data-integrity-check.sh          ← Script tự động hóa

../
├── launch-gemini-data-integrity.sh       ← Script chính
└── scripts/
    └── apex-data-integrity-audit.py      ← Python audit tool
```

---

## 🚀 Bắt Đầu Ngay

### 1️⃣ Đăng nhập Gemini CLI
```bash
gemini login --google
```

### 2️⃣ Chạy Kiểm tra
```bash
./launch-gemini-data-integrity.sh
```

### 3️⃣ Xem Kết quả
```bash
open .data-integrity-reports/data-integrity-*.html
```

**Xong!** ✅

---

## 📖 Hướng Dẫn Chi Tiết

| File | Mục đích | Thời gian |
|------|---------|----------|
| **QUICK_START_DATA_INTEGRITY.md** | Khởi động nhanh + lệnh phổ biến | 5 phút |
| **DATA_INTEGRITY_CHECK_GUIDE.md** | Kiểm tra đầy đủ + xử lý lỗi | 30 phút |
| **GEMINI_DATA_INTEGRITY_PROMPT.md** | Prompt cho Gemini, chạy thủ công | 10 phút |

---

## 🎯 Mục Tiêu & KPIs

### Primary Metrics
- **Data Integrity Score**: ≥ 99.9%
- **Orphaned Records**: 0
- **Data Corruption**: 0
- **PnL Accuracy**: ± 0.001%

### Secondary Metrics
- **Foreign Key Validity**: 100%
- **Audit Trail Completeness**: 100%
- **Security Compliance**: 100%
- **Performance**: < 100ms queries

---

## 🔄 Chu Kỳ Kiểm Tra

### 🔹 Hàng Ngày (Tự động)
```bash
# 2 AM UTC hàng ngày
0 2 * * * ./launch-gemini-data-integrity.sh --quick
```

### 🔹 Hàng Tuần (Thủ công)
```bash
./launch-gemini-data-integrity.sh  # Full check
```

### 🔹 Hàng Tháng (Chi tiết)
```bash
# Phân tích sâu + performance review
gemini task "$(cat GEMINI_DATA_INTEGRITY_PROMPT.md)"
```

---

## 📊 Các Kiểm Tra Được Thực Hiện

### 1️⃣ Table Structure (5 phút)
- ✅ All tables exist
- ✅ All columns present
- ✅ Data types correct
- ✅ Constraints valid

### 2️⃣ Foreign Key Integrity (5 phút)
- ✅ No orphaned records
- ✅ All FKs valid
- ✅ Referential integrity OK

### 3️⃣ Data Quality (10 phút)
- ✅ No null primary keys
- ✅ No negative balances
- ✅ Unique constraints OK
- ✅ No duplicates

### 4️⃣ Business Logic (10 phút)
- ✅ PnL calculations correct
- ✅ Orders executed properly
- ✅ Positions tracking OK
- ✅ Copy trading valid

### 5️⃣ Security (5 phút)
- ✅ Passwords encrypted
- ✅ MFA configured
- ✅ Audit logs complete
- ✅ Compliance met

### 6️⃣ Performance (5 phút)
- ✅ Queries fast
- ✅ Cache efficient
- ✅ Indexes optimal
- ✅ Replication synced

**Total: ~40 minutes for full check**

---

## 💾 Database Tables Checked

```
13 Tables Total:
├── users              (Authentication & profiles)
├── admin_users        (Admin accounts)
├── wallets            (User balances)
├── orders             (Trading orders)
├── positions          (Open/closed trades)
├── order_book         (Limit order matching)
├── automation_rules   (SL/TP triggers)
├── copy_trading_leaders
├── copy_trading_followers
├── trading_signals    (ML signals)
├── audit_logs         (Security trail)
├── security_alerts    (Security events)
└── agent_heartbeats   (Service health)
```

---

## 🛠️ Implementation Details

### Technology Stack
- **CLI**: Gemini AI
- **Python**: Data audit automation
- **Bash**: Orchestration & scheduling
- **Database**: Supabase (PostgreSQL)

### Output Formats
- **JSON**: Machine-readable (for alerts/automation)
- **HTML**: Human-readable (for review)
- **TXT**: Log files (for debugging)
- **CSV**: Data export (if needed)

### Storage
- **Location**: `.data-integrity-reports/`
- **Retention**: 90 days (auto-cleanup)
- **Size**: ~1-5 MB per full check

---

## 🚨 Alert System

### Critical Issues (Action within 2-4 hours)
```
❌ Negative wallet balance
❌ Orphaned order records
❌ PnL calculation errors
❌ Encryption failures
❌ Audit trail gaps
```

### Warnings (Action within 24 hours)
```
⚠️  Stale sessions (>7 days)
⚠️  Slow queries (>500ms)
⚠️  High cache miss rate
⚠️  Replication lag
⚠️  Missing indexes
```

### Info (Action within 1 week)
```
ℹ️  Performance optimization tips
ℹ️  Unused indexes
ℹ️  Query optimization suggestions
ℹ️  Storage cleanup opportunities
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db

# Optional
GEMINI_API_KEY=your-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=admin@apex.com
SMTP_PASS=your-password
ALERT_EMAIL=admin@apex.com
```

### Script Parameters
```bash
# Full check
./launch-gemini-data-integrity.sh

# Quick check (5 min)
./launch-gemini-data-integrity.sh --quick

# Scheduled mode
./launch-gemini-data-integrity.sh --scheduled

# With email
./launch-gemini-data-integrity.sh --email admin@apex.com
```

---

## 📊 Sample Report Output

```
╔════════════════════════════════════════════════════════════════════╗
║           APEX OS - DATA INTEGRITY AUDIT REPORT                   ║
╚════════════════════════════════════════════════════════════════════╝

Status: ✅ PASSED
Integrity Score: 99.99%
Timestamp: 2025-12-02 02:00:00 UTC
Duration: 22 minutes

TABLE STATUS:
✓ users:                150 rows
✓ wallets:              150 rows
✓ orders:             1,250 rows
✓ positions:            320 rows
(all other tables OK)

FOREIGN KEY INTEGRITY:
✓ All 9 relationships valid
✓ Zero orphaned records
✓ 100% referential integrity

DATA QUALITY:
✓ No negative balances
✓ No PnL errors
✓ No duplicates
✓ All timestamps consistent

SECURITY:
✓ Encryption: OK
✓ Authentication: OK
✓ Audit logs: 100% coverage
✓ MFA: Configured

PERFORMANCE:
✓ Query time: 45ms avg
✓ Cache hit: 96.5%
✓ Replica lag: 0.2s

CRITICAL ISSUES: 0
WARNINGS: 0

Overall: ✅ EXCELLENT - NO ACTION NEEDED
```

---

## 🎓 Best Practices

### ✅ Do's
- Run quick check daily (automated)
- Run full check weekly
- Archive reports monthly
- Review warnings within 24h
- Monitor critical metrics

### ❌ Don'ts
- Don't ignore critical issues
- Don't skip security checks
- Don't run during peak traffic
- Don't share raw reports publicly
- Don't delete audit logs

---

## 🔗 Related Resources

- `/docs/` - System documentation
- `/backend/services/` - Service implementations
- `MIGRATION_VERIFICATION_CHECKLIST.md` - Migration checks
- `VERIFICATION_CHECKPOINT.md` - General verification

---

## 🐛 Troubleshooting

### Issue: Script doesn't run
```bash
# Check permissions
chmod +x launch-gemini-data-integrity.sh
chmod +x scripts/apex-data-integrity-audit.py

# Check shebang
head -1 launch-gemini-data-integrity.sh
```

### Issue: Gemini timeout
```bash
# Use quick check instead
./launch-gemini-data-integrity.sh --quick

# Or increase timeout in script
```

### Issue: Database connection fails
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Issue: No email sent
```bash
# Check mail command
which mail

# Configure SMTP in script
# Edit launch-gemini-data-integrity.sh
```

---

## 📈 Integration Examples

### GitHub Actions
```yaml
name: Data Integrity Check
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: ./launch-gemini-data-integrity.sh --quick
      - uses: actions/upload-artifact@v3
```

### Datadog Integration
```python
from datadog import initialize, api
api.Metric.send(
    metric='apex.integrity_score',
    points=99.99,
    tags=['environment:prod']
)
```

### Slack Alert
```bash
# Send to Slack on critical issue
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"Data Integrity Issue Found"}'
```

---

## 📞 Support & Maintenance

### Regular Maintenance
- Daily: Quick check (automated)
- Weekly: Full check (manual review)
- Monthly: Archive + analysis
- Quarterly: Performance tuning

### Contact
For issues or questions:
1. Check logs: `.data-integrity-reports/`
2. Review docs: `.gemini/` folder
3. Run diagnostic: `./launch-gemini-data-integrity.sh --quick`

---

## 🎯 Success Metrics

When properly configured, you should see:
- ✅ **Integrity Score**: 99.9%+
- ✅ **Critical Issues**: 0
- ✅ **Data Loss**: 0
- ✅ **Orphaned Records**: 0
- ✅ **Audit Coverage**: 100%

---

## 🏁 Next Steps

1. **Start Now**: `./launch-gemini-data-integrity.sh`
2. **Schedule Daily**: Add to crontab (see QUICK_START)
3. **Setup Alerts**: Configure email notifications
4. **Monitor**: Review reports in browser
5. **Maintain**: Keep reports for compliance

---

## 📝 Version Info

- **Created**: 2025-12-02
- **Status**: Production Ready ✅
- **Last Updated**: 2025-12-02
- **Compatibility**: Apex OS v1.0+

---

## ✨ Summary

This package provides everything needed to:
- ✅ Verify data integrity automatically
- ✅ Detect issues early
- ✅ Ensure compliance
- ✅ Monitor performance
- ✅ Archive for audits

**Goal: 99.99% Data Integrity** 🎯

Start with: `./launch-gemini-data-integrity.sh`
