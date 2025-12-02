# 🎯 Gemini CLI Tools Index
## Apex OS - Tất cả Công cụ Gemini CLI

---

## 📚 Data Integrity Check Suite

### 🔍 Kiểm Tra Tính Toàn vẹn Dữ liệu

| Tài liệu | Mục đích | Thời gian | Bắt đầu |
|---------|---------|----------|--------|
| **README_DATA_INTEGRITY.md** | Overview của toàn bộ package | 10 min | [Đọc](README_DATA_INTEGRITY.md) |
| **QUICK_START_DATA_INTEGRITY.md** | Khởi động nhanh + commands | 5 min | [Bắt đầu](QUICK_START_DATA_INTEGRITY.md) |
| **DATA_INTEGRITY_CHECK_GUIDE.md** | Chi tiết + troubleshooting | 30 min | [Chi tiết](DATA_INTEGRITY_CHECK_GUIDE.md) |
| **GEMINI_DATA_INTEGRITY_PROMPT.md** | Prompt cho Gemini CLI | 10 min | [Chạy](GEMINI_DATA_INTEGRITY_PROMPT.md) |

---

## ⚡ Quick Commands

### 🚀 Chạy Kiểm Tra Ngay
```bash
# Full check (20 min)
./launch-gemini-data-integrity.sh

# Quick check (5 min)
./launch-gemini-data-integrity.sh --quick

# With email report
./launch-gemini-data-integrity.sh --email admin@apex.com
```

### 📊 Xem Báo Cáo
```bash
# List all reports
ls -lh .data-integrity-reports/

# Open latest HTML report
open .data-integrity-reports/data-integrity-*.html

# View latest JSON report
cat .data-integrity-reports/data-integrity-*.json | jq '.'
```

### 🤖 Gemini CLI Commands
```bash
# Login
gemini login --google

# Check status
gemini status

# Run full audit via Gemini
gemini task "$(cat .gemini/GEMINI_DATA_INTEGRITY_PROMPT.md)"

# Run quick check
gemini task "Run quick data integrity check"
```

---

## 🎯 Use Cases

### Daily Check (5 min)
**Lệnh:**
```bash
./launch-gemini-data-integrity.sh --quick
```
**Kiểm tra:** Tables, FK, orphaned records, balances

### Weekly Review (20 min)
**Lệnh:**
```bash
./launch-gemini-data-integrity.sh
```
**Kiểm tra:** Toàn bộ hệ thống, PnL, security, performance

### Manual Investigation
**Lệnh:**
```bash
gemini task "
Check [TABLE_NAME] integrity:
- Row count
- NULL fields
- Invalid relationships
- Anomalies
"
```

### Setup Automation
**Lệnh:**
```bash
# Crontab (daily 2 AM UTC)
0 2 * * * cd /path/to/apex-os && ./launch-gemini-data-integrity.sh --quick

# PM2 (with ecosystem.config.js)
pm2 start launch-gemini-data-integrity.sh --cron "0 2 * * *"
```

---

## 🏗️ File Structure

```
.gemini/
├── INDEX_GEMINI_TOOLS.md              ← Bạn đang đọc
├── README_DATA_INTEGRITY.md           ← Overview
├── QUICK_START_DATA_INTEGRITY.md      ← 5-minute setup
├── DATA_INTEGRITY_CHECK_GUIDE.md      ← Full guide
├── GEMINI_DATA_INTEGRITY_PROMPT.md    ← Prompt (copy-paste)
└── cron-data-integrity-check.sh       ← Auto script

../scripts/
└── apex-data-integrity-audit.py       ← Python tool

../
└── launch-gemini-data-integrity.sh    ← Main script

.data-integrity-reports/
├── data-integrity-YYYYMMDD-HHMMSS.json
├── data-integrity-YYYYMMDD-HHMMSS.html
├── data-integrity-YYYYMMDD-HHMMSS.log
└── gemini-output-YYYYMMDD-HHMMSS.txt
```

---

## 🚀 Getting Started

### For Beginners
1. Read: [QUICK_START_DATA_INTEGRITY.md](QUICK_START_DATA_INTEGRITY.md)
2. Run: `./launch-gemini-data-integrity.sh --quick`
3. Check: `.data-integrity-reports/`

### For Advanced Users
1. Read: [DATA_INTEGRITY_CHECK_GUIDE.md](DATA_INTEGRITY_CHECK_GUIDE.md)
2. Use: [GEMINI_DATA_INTEGRITY_PROMPT.md](GEMINI_DATA_INTEGRITY_PROMPT.md)
3. Setup: Automation + alerts

### For Automation
1. Check: [README_DATA_INTEGRITY.md](README_DATA_INTEGRITY.md#-integration-examples)
2. Setup: Crontab / PM2 / GitHub Actions
3. Monitor: Daily automated checks

---

## 📊 Metrics You'll See

### Perfect Score ✅
```
Status: PASS
Integrity Score: 99.99%
Critical Issues: 0
Warnings: 0
```

### Good Status ⚠️
```
Status: REVIEW NEEDED
Integrity Score: 98.5%
Critical Issues: 0
Warnings: 3
```

### Action Needed 🔴
```
Status: FAILED
Integrity Score: 95.0%
Critical Issues: 2
Warnings: 8
```

---

## 🔧 Troubleshooting Paths

### Script won't run?
→ [QUICK_START - Troubleshooting](QUICK_START_DATA_INTEGRITY.md#-troubleshooting)

### Gemini CLI issues?
→ [DATA_INTEGRITY_CHECK_GUIDE - Handling Errors](DATA_INTEGRITY_CHECK_GUIDE.md#-%E2%80%8E-xử-lý-lỗi)

### Need custom check?
→ [GEMINI_DATA_INTEGRITY_PROMPT](GEMINI_DATA_INTEGRITY_PROMPT.md) (modify prompt)

### Setup automation?
→ [README_DATA_INTEGRITY - Integration Examples](README_DATA_INTEGRITY.md#-integration-examples)

---

## 📈 Typical Results

### After First Run
- See all tables enumerated
- Get baseline metrics
- Identify any existing issues
- Generate baseline report

### Daily Runs
- Trend analysis
- Anomaly detection
- Performance tracking
- Alert on changes

### Weekly Reviews
- Deep dive analysis
- Security compliance
- Performance optimization
- Archive for records

---

## 🎯 Success Criteria

✅ **Goal:** Data Integrity Score ≥ 99.9%

### Components
- ✅ 13 tables verified
- ✅ 9 FK relationships valid
- ✅ 0 orphaned records
- ✅ 0 data corruption
- ✅ 100% audit coverage
- ✅ Security compliance
- ✅ Performance optimal

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| Quick Start | [QUICK_START_DATA_INTEGRITY.md](QUICK_START_DATA_INTEGRITY.md) |
| Full Guide | [DATA_INTEGRITY_CHECK_GUIDE.md](DATA_INTEGRITY_CHECK_GUIDE.md) |
| Gemini Prompt | [GEMINI_DATA_INTEGRITY_PROMPT.md](GEMINI_DATA_INTEGRITY_PROMPT.md) |
| Main Script | `../launch-gemini-data-integrity.sh` |
| Python Tool | `../scripts/apex-data-integrity-audit.py` |
| Reports | `.data-integrity-reports/` |

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| **Script not executable** | `chmod +x launch-gemini-data-integrity.sh` |
| **Gemini not found** | `npm install -g @google/generative-ai-cli` |
| **Not logged in** | `gemini login --google` |
| **Database error** | Check `.env.local` for DATABASE_URL |
| **Timeout** | Use `--quick` flag |
| **Email not working** | Check mail command or SMTP config |

---

## 🎓 Learning Path

```
Beginner (5 min)
└─ QUICK_START_DATA_INTEGRITY.md
   └─ Run: ./launch-gemini-data-integrity.sh --quick

Intermediate (30 min)
└─ DATA_INTEGRITY_CHECK_GUIDE.md
   └─ Understand all checks
   └─ Review sample reports

Advanced (1 hour)
└─ GEMINI_DATA_INTEGRITY_PROMPT.md
   └─ Customize checks
   └─ Setup automation
   └─ Integrate with monitoring

Expert (Ongoing)
└─ Maintain daily checks
└─ Archive reports
└─ Trend analysis
└─ Performance tuning
```

---

## 🎯 Next Steps

### Right Now (5 min)
1. Run: `./launch-gemini-data-integrity.sh --quick`
2. Open report: `.data-integrity-reports/`

### Today (30 min)
1. Read: [QUICK_START_DATA_INTEGRITY.md](QUICK_START_DATA_INTEGRITY.md)
2. Understand all checks
3. Review any issues

### This Week (2 hours)
1. Setup automation (cron/PM2)
2. Configure email alerts
3. Archive baseline report

### Going Forward
1. Run daily (automated)
2. Review weekly reports
3. Act on critical issues within 4h
4. Archive for compliance

---

## 📝 Documentation Map

```
Apex OS - Data Integrity
│
├─ Quick Start (5 min)
│  └─ QUICK_START_DATA_INTEGRITY.md
│
├─ Full Guide (30 min)
│  └─ DATA_INTEGRITY_CHECK_GUIDE.md
│
├─ Automation (10 min)
│  └─ GEMINI_DATA_INTEGRITY_PROMPT.md
│
└─ Reference (always)
   └─ README_DATA_INTEGRITY.md

Implementation
│
├─ Shell Script
│  └─ launch-gemini-data-integrity.sh
│
├─ Python Script
│  └─ scripts/apex-data-integrity-audit.py
│
└─ Results
   └─ .data-integrity-reports/
```

---

## ✨ Summary

**What You Have:**
- ✅ Complete data integrity check system
- ✅ Automated daily checks
- ✅ Detailed reporting
- ✅ Alert system
- ✅ Compliance ready

**What to Do:**
```bash
# Start here:
./launch-gemini-data-integrity.sh --quick

# Then check:
open .data-integrity-reports/data-integrity-*.html
```

**Time Investment:**
- Initial setup: 5 minutes
- Daily run: 5 minutes (automated)
- Weekly review: 15 minutes
- Monthly archive: 5 minutes

**Benefit:**
99.99% data integrity + zero data loss risk ✅

---

## 🚀 Start Here

**Choose your path:**

- 🏃 **I want quick results** → [QUICK_START_DATA_INTEGRITY.md](QUICK_START_DATA_INTEGRITY.md)
- 📖 **I want to understand everything** → [DATA_INTEGRITY_CHECK_GUIDE.md](DATA_INTEGRITY_CHECK_GUIDE.md)
- 🤖 **I want to customize checks** → [GEMINI_DATA_INTEGRITY_PROMPT.md](GEMINI_DATA_INTEGRITY_PROMPT.md)
- 📚 **I want reference docs** → [README_DATA_INTEGRITY.md](README_DATA_INTEGRITY.md)

**First command to run:**
```bash
./launch-gemini-data-integrity.sh --quick
```

Good luck! 🎯
