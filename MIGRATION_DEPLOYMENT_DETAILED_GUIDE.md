# 🎯 HƯỚNG DẪN CHI TIẾT: DEPLOY DATABASE MIGRATION

## ⚠️ QUAN TRỌNG - ĐỌC KỸ TRƯỚC KHI LÀM

**Migration này sẽ tạo toàn bộ database schema cho ApexOS.**

**Thời gian:** 5-10 phút
**Độ khó:** Dễ (copy-paste)
**Rủi ro:** Thấp (có thể rollback)

---

## 📋 CHUẨN BỊ

### Bước 0.1: Kiểm tra bạn đang ở đúng project

1. Mở trình duyệt
2. Đi tới: https://supabase.com/dashboard
3. **QUAN TRỌNG:** Chọn đúng project: `ryvpqbuftmlsynmajecx`
4. Xác nhận URL: `https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx`

### Bước 0.2: Copy migration SQL (Đã làm sẵn)

Migration đã được copy vào clipboard rồi. Nếu bị mất, chạy lại:

```bash
cd /Users/macbookprom1/apex-os/apex-os

cat backend/database/master_migration.sql \
    backend/database/tier_migration.sql \
    | pbcopy
```

---

## 🚀 BƯỚC 1: MỞ SUPABASE SQL EDITOR

### 1.1. Vào Dashboard

- URL: https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx
- Đăng nhập nếu chưa

### 1.2. Mở SQL Editor

**Cách 1:** Click vào menu bên trái
```
Dashboard
├─ Table Editor
├─ SQL Editor  <--- CLICK VÀO ĐÂY
├─ Database
└─ ...
```

**Cách 2:** Click trực tiếp link này:
```
https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql
```

### 1.3. Tạo Query mới

- Màn hình SQL Editor sẽ hiện ra
- Click nút **"New Query"** (góc trên bên phải)
- Một tab query trống sẽ mở ra

**Giao diện sẽ trông như thế này:**
```
┌─────────────────────────────────────────┐
│  SQL Editor                   [New Query]│
├─────────────────────────────────────────┤
│                                          │
│  1  -- Paste your SQL here              │
│  2                                       │
│  3                                       │
│                                          │
│                                          │
│  [Cancel]              [Run] [CMD+Enter]│
└─────────────────────────────────────────┘
```

---

## 🚀 BƯỚC 2: PASTE SQL MIGRATION

### 2.1. Xóa nội dung cũ (nếu có)

- Nếu query editor có sẵn nội dung (ví dụ: `-- Paste your SQL here`)
- Bôi đen toàn bộ (CMD+A)
- Xóa (Delete)

### 2.2. Paste migration

**Cách 1:** Keyboard shortcut
```
CMD + V
```

**Cách 2:** Right-click → Paste

**Cách 3:** Menu → Edit → Paste

### 2.3. Kiểm tra nội dung vừa paste

**Scroll lên đầu**, bạn phải thấy:
```sql
-- ============================================================
-- ApexOS - Master Database Schema
-- Version: 2.0 (Supabase Agent Optimized)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Scroll xuống cuối**, bạn phải thấy:
```sql
    return features.get(tier, features["free"])
```

**Kiểm tra dòng số:**
- Phải có khoảng **600-700 dòng**
- Nếu chỉ có vài chục dòng → Copy lại

---

## 🚀 BƯỚC 3: CHẠY MIGRATION

### 3.1. Click nút "Run"

**Vị trí nút:**
- Góc dưới bên phải của editor
- Màu xanh lá
- Text: "Run" hoặc có icon ▶️

**Hoặc dùng keyboard:**
```
CMD + Enter
```

### 3.2. Chờ đợi (QUAN TRỌNG!)

**Quá trình chạy:**
```
[00:00] Starting...
[00:05] Creating tables...
[00:10] Setting up RLS policies...
[00:15] Creating indexes...
[00:20] Running seed data...
[00:25] Creating functions...
[00:30] Complete! ✅
```

**Thời gian dự kiến:** 20-40 giây

**⚠️ LƯU Ý:**
- KHÔNG tắt tab
- KHÔNG refresh trang
- KHÔNG click nút khác
- Chờ cho đến khi thấy thông báo

### 3.3. Xác nhận thành công

**Dấu hiệu THÀNH CÔNG:**

Xuất hiện thông báo màu xanh:
```
✅ Success
   No rows returned
```

HOẶC:

```
✅ Success
   Rows affected: 0
```

HOẶC thấy các thông báo:
```
NOTICE:  relation "users" already exists, skipping
NOTICE:  ✅ Master schema migration complete!
NOTICE:  📊 Tables created: 7
NOTICE:  🔒 RLS enabled on all tables
```

**Dấu hiệu LỖI:**

Xuất hiện thông báo màu đỏ:
```
❌ Error
   relation "..." does not exist
```

HOẶC:

```
❌ Syntax error at or near "..."
```

→ Nếu gặp lỗi, đọc phần "XỬ LÝ LỖI" bên dưới

---

## 🚀 BƯỚC 4: VERIFY MIGRATION

### 4.1. Kiểm tra tables đã tạo

Tạo query mới (hoặc xóa query cũ), paste câu này:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Click **Run**

**KẾT QUẢ MONG ĐỢI:** (11 tables)
```
agent_logs
exchange_connections
founders_circle
guardian_alerts
payment_verifications
portfolio_snapshots
referral_earnings
referrals
sync_jobs
trade_history
users
```

✅ **Nếu thấy đủ 11 tables → THÀNH CÔNG Bước 1!**

### 4.2. Kiểm tra tier system

Paste câu này vào query mới:

```sql
SELECT get_available_founders_slots();
```

Click **Run**

**KẾT QUẢ MONG ĐỢI:**
```
get_available_founders_slots
----------------------------
13
```

✅ **Nếu kết quả là 13 → THÀNH CÔNG Bước 2!**

### 4.3. Kiểm tra users table có tier columns

```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_tier', 'subscription_expires_at', 'payment_tx_id', 'payment_verified', 'joined_at')
ORDER BY column_name;
```

**KẾT QUẢ MONG ĐỢI:** (5 rows)
```
column_name              | data_type
-------------------------|------------------
joined_at                | timestamp with time zone
payment_tx_id            | character varying
payment_verified         | boolean
subscription_expires_at  | timestamp with time zone
subscription_tier        | character varying
```

✅ **Nếu thấy đủ 5 columns → THÀNH CÔNG Bước 3!**

### 4.4. Kiểm tra RLS enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'exchange_connections', 'portfolio_snapshots', 'guardian_alerts', 'agent_logs', 'trade_history', 'sync_jobs')
ORDER BY tablename;
```

**KẾT QUẢ MONG ĐỢI:** Tất cả phải có `rowsecurity = true`
```
tablename                | rowsecurity
-------------------------|------------
agent_logs               | t
exchange_connections     | t
guardian_alerts          | t
portfolio_snapshots      | t
sync_jobs                | t
trade_history            | t
users                    | t
```

✅ **Nếu tất cả đều `true` → THÀNH CÔNG Bước 4!**

---

## 🚀 BƯỚC 5: TEST TỰ ĐỘNG

### 5.1. Quay về Terminal

```bash
cd /Users/macbookprom1/apex-os/apex-os
```

### 5.2. Chạy auto test

```bash
python3 backend/scripts/test_tier_upgrade.py
```

### 5.3. Đợi kết quả

**Output mong đợi:**
```
============================================================
🧪 APEX TIER SYSTEM - AUTOMATED TEST
============================================================

📊 Step 1: Checking Founders Circle status...
   Total Slots: 100
   Claimed: 87
   Available: 13

👤 Step 2: Finding test user...
   User ID: 00000000-0000-0000-0000-000000000000
   Email: test@apexos.dev
   Current Tier: free

⬆️ Step 3: Upgrading user to Founders...
   Claiming slot: #88
   ✅ User updated to Founders tier
   ✅ Founders slot #88 claimed

🔍 Step 4: Verifying upgrade...
   Subscription Tier: founders
   Payment Verified: True
   Payment TxID: test-tx-20241120084634
   Founders Slot: #88
   Claimed At: 2024-11-20T08:46:34

📊 Step 5: Checking available slots after upgrade...
   Available slots: 12
   Change: 13 → 12 (decreased by 1)

📋 Test Summary
   ========================================================
   User Email:        test@apexos.dev
   User ID:           00000000-0000-0000-0000-000000000000
   Old Tier:          free
   New Tier:          founders
   Founders Slot:     #88
   Available Slots:   12/100
   Payment Verified:  True
   ========================================================

✅ All tests passed! Tier upgrade successful!

🎉 Tier system is working correctly!
```

✅ **Nếu thấy "All tests passed!" → HOÀN TOÀN THÀNH CÔNG!**

---

## 🚀 BƯỚC 6: TEST FRONTEND

### 6.1. Refresh Dashboard

```bash
# Mở browser tại:
http://localhost:3000/dashboard
```

### 6.2. Expected Changes

**Nếu user vừa được upgrade, bạn sẽ thấy:**

✅ **Thay đổi trong Header:**
```
Before: Welcome, User (Free Tier)
After:  Welcome, User 👑 Founders #88
```

✅ **Thay đổi trong Sidebar:**
```
Before: Wolf Pack menu HIDDEN
After:  Wolf Pack menu VISIBLE

Before: "Upgrade to Founders" button
After:  Button DISAPPEARED
```

✅ **Thay đổi trong Dashboard:**
```
Before: Upgrade banner at top
After:  Banner DISAPPEARED

Before: Locked metrics (Fees Saved, Referrals)
After:  Metrics UNLOCKED, showing data

Before: "Unlock Premium Features" section
After:  Section DISAPPEARED

New:    Wolf Pack Status panel appeared
```

✅ **Thay đổi trong User Profile (sidebar bottom):**
```
Before: "Free Tier"
After:  "Founders #88"
```

---

## ✅ CHECKLIST HOÀN TẤT

In ra checklist này và đánh dấu từng bước:

- [ ] **Bước 1:** Mở Supabase SQL Editor
- [ ] **Bước 2:** Paste migration SQL (600-700 dòng)
- [ ] **Bước 3:** Click "Run", chờ 20-40 giây
- [ ] **Bước 4.1:** Verify 11 tables created
- [ ] **Bước 4.2:** Verify `get_available_founders_slots()` returns 13
- [ ] **Bước 4.3:** Verify 5 tier columns in users table
- [ ] **Bước 4.4:** Verify RLS enabled on all tables
- [ ] **Bước 5:** Run auto test, see "All tests passed!"
- [ ] **Bước 6:** Refresh dashboard, see Founders UI

**Nếu tất cả ✅ → MIGRATION HOÀN TẤT 100%!**

---

## ❌ XỬ LÝ LỖI

### Lỗi 1: "relation already exists"

**Nguyên nhân:** Bảng đã tồn tại từ trước

**Giải pháp:** KHÔNG CẦN LÀM GÌ
- Migration dùng `CREATE IF NOT EXISTS`
- Lỗi này là BÌNH THƯỜNG
- Chỉ cần kiểm tra bước Verify

### Lỗi 2: "syntax error"

**Nguyên nhân:** SQL bị thiếu hoặc paste sai

**Giải pháp:**
1. Xóa toàn bộ query
2. Copy lại migration:
   ```bash
   cat backend/database/master_migration.sql \
       backend/database/tier_migration.sql \
       | pbcopy
   ```
3. Paste lại
4. Kiểm tra dòng đầu có `CREATE EXTENSION`
5. Kiểm tra dòng cuối có `return features`
6. Run lại

### Lỗi 3: "permission denied"

**Nguyên nhân:** Không có quyền admin

**Giải pháp:**
1. Đảm bảo bạn là owner của project
2. Kiểm tra Settings → Database → Connection string
3. Dùng service_role key thay vì anon key
4. Hoặc liên hệ team owner

### Lỗi 4: Test script báo "Could not find table"

**Nguyên nhân:** Migration chưa chạy thành công

**Giải pháp:**
1. Quay lại Bước 4.1 verify tables
2. Nếu không có 11 tables → Migration thất bại
3. Check lại messages trong SQL Editor
4. Run lại migration

### Lỗi 5: Frontend không thay đổi

**Nguyên nhân:** Browser cache hoặc user chưa upgrade

**Giải pháp:**
1. Hard refresh: CMD+Shift+R
2. Clear localStorage:
   ```javascript
   // Trong browser console:
   localStorage.clear();
   location.reload();
   ```
3. Kiểm tra user có được upgrade chưa:
   ```sql
   SELECT email, subscription_tier 
   FROM users 
   WHERE email = 'your-email@example.com';
   ```

---

## 🆘 ROLLBACK (Nếu Cần)

**Chỉ dùng nếu muốn xóa toàn bộ và bắt đầu lại:**

```sql
-- ⚠️ CẢNH BÁO: Sẽ XÓA TẤT CẢ DỮ LIỆU!

DROP TABLE IF EXISTS referral_earnings CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS payment_verifications CASCADE;
DROP TABLE IF EXISTS founders_circle CASCADE;
DROP TABLE IF EXISTS sync_jobs CASCADE;
DROP TABLE IF EXISTS trade_history CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS guardian_alerts CASCADE;
DROP TABLE IF EXISTS portfolio_snapshots CASCADE;
DROP TABLE IF EXISTS exchange_connections CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Sau đó run lại migration từ đầu
```

---

## 📞 HỖ TRỢ

**Nếu gặp vấn đề:**

1. **Kiểm tra console log:**
   - Supabase SQL Editor có tab "Logs"
   - Xem error messages chi tiết

2. **Screenshot lỗi:**
   - Chụp màn hình error message
   - Chụp kết quả verify queries

3. **Check files:**
   - `backend/database/master_migration.sql`
   - `backend/database/tier_migration.sql`
   - Đảm bảo không bị corrupt

4. **References:**
   - `COMPLETE_MIGRATION_GUIDE.md`
   - `AUTO_TEST_README.md`
   - `TIER_SYSTEM_FINAL_REPORT.md`

---

## 🎉 HOÀN TẤT!

**Sau khi làm xong tất cả steps:**

✅ Database schema complete
✅ Tier system functional  
✅ RLS policies active
✅ Test passed
✅ Frontend working

**🎊 Chúc mừng! ApexOS database infrastructure ready for production!**

---

**Thời gian tổng:** ~10 phút
**Độ phức tạp:** Thấp
**Kết quả:** Production-ready database ✅
