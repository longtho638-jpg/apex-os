# Apex OS - Data Integrity Check - QUICK START GUIDE
## Hướng Dẫn Nhanh Kiểm tra Toàn vẹn Dữ liệu

---

## 🎯 5 Phút Khởi động

### Bước 1️⃣: Đăng nhập Gemini CLI
```bash
gemini login --google

# Chọn: Google AI Ultra subscription
# Xác thực trong trình duyệt
```

### Bước 2️⃣: Chạy Kiểm tra
```bash
# Option A: Chạy script (Khuyến nghị)
./launch-gemini-data-integrity.sh

# Option B: Chạy nhanh chóng
./launch-gemini-data-integrity.sh --quick

# Option C: Chạy với báo cáo email
./launch-gemini-data-integrity.sh --email admin@apex.com
```

### Bước 3️⃣: Xem Kết quả
```bash
# Tất cả báo cáo lưu ở:
ls -lh .data-integrity-reports/

# Mở báo cáo HTML
open .data-integrity-reports/data-integrity-*.html
```

---

## ⚡ Các Lệnh Phổ biến

### Full Check (15-20 phút)
```bash
./launch-gemini-data-integrity.sh
```
**Kiểm tra toàn bộ 13 bảng, tất cả FK, PnL, security...**

### Quick Check (5 phút)
```bash
./launch-gemini-data-integrity.sh --quick
```
**Chỉ kiểm tra: Tables, FK orphaned, balances**

### Email Report
```bash
./launch-gemini-data-integrity.sh --email your@email.com
```
**Gửi báo cáo trực tiếp đến email**

### Manual Gemini Command
```bash
gemini task "$(cat .gemini/GEMINI_DATA_INTEGRITY_PROMPT.md)"
```
**Chạy trực tiếp từ Gemini CLI**

---

## 📊 Kết quả Mong Đợi

✅ **Nếu Thành công:**
```
Status: ✅ PASS
Integrity Score: 99.99%
Critical Issues: 0
Warnings: 0
```

⚠️ **Nếu Có Vấn đề:**
```
Status: ⚠️ REVIEW NEEDED
Integrity Score: 95.5%
Critical Issues: 2
  - 5 orphaned orders
  - 3 PnL calculation errors
```

---

## 📁 Các File Tạo Ra

| File | Mô tả |
|------|-------|
| `data-integrity-*.json` | Machine-readable format (cho automation) |
| `data-integrity-*.html` | Báo cáo trực quan (mở trong trình duyệt) |
| `data-integrity-*.log` | Chi tiết log của tất cả checks |
| `gemini-output-*.txt` | Raw output từ Gemini CLI |
| `summary-*.txt` | Tóm tắt ngắn gọn |

**Tất cả lưu ở:** `.data-integrity-reports/`

---

## 🛠️ Troubleshooting

### Problem: "Gemini CLI not found"
```bash
# Cài đặt
npm install -g @google/generative-ai-cli

# Hoặc dùng với npx
npx @google/generative-ai-cli@latest ...
```

### Problem: "Not logged in"
```bash
# Đăng nhập lại
gemini login --google

# Kiểm tra status
gemini status
```

### Problem: "DATABASE_URL not set"
```bash
# Tạo file .env.local
cp .env.example .env.local

# Thêm DATABASE_URL
echo "DATABASE_URL=postgresql://user:pass@host/db" >> .env.local

# Source environment
source .env.local
```

### Problem: "Timeout"
```bash
# Tăng timeout cho quick check
./launch-gemini-data-integrity.sh --quick

# Nếu vẫn fail, kiểm tra database connection:
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

---

## 📈 Hàng ngày - Tự động hóa

### Cách 1: Crontab (Linux/Mac)
```bash
# Mở crontab
crontab -e

# Thêm dòng này (chạy 2 AM UTC hàng ngày)
0 2 * * * cd /Users/macbookprom1/apex-os && ./launch-gemini-data-integrity.sh --quick

# Hoặc với email
0 2 * * * cd /Users/macbookprom1/apex-os && ./launch-gemini-data-integrity.sh --quick --email admin@apex.com
```

### Cách 2: PM2 (Node.js)
```bash
# Cài PM2
npm install -g pm2

# Tạo script
pm2 start "./launch-gemini-data-integrity.sh --quick" \
  --name "data-integrity-check" \
  --cron "0 2 * * *"

# Kiểm tra
pm2 list
pm2 save
```

### Cách 3: GitHub Actions (CI/CD)
```yaml
# .github/workflows/data-integrity-check.yml
name: Data Integrity Check
on:
  schedule:
    - cron: '0 2 * * *'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @google/generative-ai-cli
      - run: ./launch-gemini-data-integrity.sh --quick
      - uses: actions/upload-artifact@v3
        with:
          name: integrity-reports
          path: .data-integrity-reports/
```

---

## 📊 Giải Thích Các Metrics

### Integrity Score
- **99.9-100%**: ✅ Excellent - Không cần action
- **95-99.9%**: ⚠️ Good - Review warnings
- **90-95%**: 🔴 Fair - Có vấn đề cần fix
- **<90%**: 🛑 Critical - Hành động ngay

### Critical Issues vs Warnings
| Loại | Ví dụ | Hành động |
|------|-------|----------|
| **Critical** | Orphaned data, negative balance | Fix trong 2-4 giờ |
| **Warning** | Stale sessions, slow queries | Fix trong 24 giờ |
| **Info** | Performance tips | Fix trong 1 tuần |

---

## 🚨 Khi Phát hiện Vấn đề

1. **Đọc báo cáo**: Xem `data-integrity-*.json`
2. **Xác định**: Bảng nào bị ảnh hưởng
3. **Lượng hóa**: Bao nhiêu records bị ảnh hưởng
4. **Fix**: Gemini sẽ provide SQL/code fix
5. **Verify**: Chạy lại kiểm tra để confirm

**Ví dụ Fix:**
```bash
# Nếu có orphaned orders
gemini task "
Fix orphaned orders in Apex Platform:
1. Find all orders without valid user_id
2. Provide DELETE statement
3. Verify no data loss
4. Prevent future occurrences
"

# Hoặc dùng Python audit
python3 scripts/apex-data-integrity-audit.py --full
```

---

## 💡 Pro Tips

### Tip 1: Giữ lịch sử báo cáo
```bash
# Archive old reports
tar -czf .data-integrity-reports-backup-$(date +%Y%m).tar.gz .data-integrity-reports/
```

### Tip 2: So sánh báo cáo
```bash
# Xem sự thay đổi từ hôm qua
diff <(jq '.stats' .data-integrity-reports/data-integrity-yesterday.json) \
     <(jq '.stats' .data-integrity-reports/data-integrity-today.json)
```

### Tip 3: Set up alerts
```bash
# Nếu integrity score < 99%, gửi alert
if [ $(jq '.summary.integrity_score' report.json) -lt 99 ]; then
    echo "Alert: Low integrity score" | mail -s "Data Integrity Alert" admin@apex.com
fi
```

### Tip 4: Integrate với monitoring
```bash
# Đưa metrics lên Datadog/New Relic
curl -X POST https://api.datadoghq.com/api/v1/series \
  -H "DD-API-KEY: YOUR_KEY" \
  -d "{
    \"series\": [{
      \"metric\": \"apex.data_integrity.score\",
      \"points\": [[$(date +%s), 99.99]],
      \"tags\": [\"environment:production\"]
    }]
  }"
```

---

## 📞 Liên Hệ & Support

| Vấn đề | Giải pháp |
|--------|-----------|
| Script không chạy | Kiểm tra quyền: `chmod +x launch-gemini-data-integrity.sh` |
| Gemini timeout | Chạy quick version: `--quick` |
| Database error | Kiểm tra `.env.local` và DATABASE_URL |
| Email không gửi | Kiểm tra mail command: `which mail` |
| Crontab không chạy | Kiểm tra logs: `log show` (Mac) hoặc `/var/log/cron` (Linux) |

---

## ✨ Kết luận

Bạn vừa setup một **hệ thống kiểm tra tính toàn vẹn dữ liệu tự động** cho Apex Platform! 

🎯 **Mục tiêu:**
- ✅ Data Integrity Score ≥ 99.9%
- ✅ Zero Critical Issues
- ✅ 100% Data Integrity
- ✅ Hàng ngày tự động check

**Start Now:**
```bash
./launch-gemini-data-integrity.sh
```

**Questions?** Tham khảo `.gemini/DATA_INTEGRITY_CHECK_GUIDE.md` để có chi tiết đầy đủ.
