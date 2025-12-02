# 🛠️ CORE SYSTEM COMPLETION ROADMAP (LẤP ĐẦY KHOẢNG TRỐNG)

**Mục tiêu:** Chuyển đổi ApexOS từ trạng thái "Giao diện Demo" sang "Hệ thống Vận hành Thực tế" trước ngày mở bán (Launch Day). Đảm bảo không có tính năng "bánh vẽ" nào gây rủi ro uy tín.

---

## 🛑 PHASE 1: FINANCIAL CORE (TRÁI TIM TÀI CHÍNH) - **ƯU TIÊN CAO NHẤT**
*Lý do: Sai tiền là chết. Hệ thống Viral 4 Level cần chạy chính xác từng xu.*

### 1.1. Cơ chế "Ví ảo" (Internal Ledger)
- [ ] **Database:** Tạo bảng `user_wallets` và `wallet_transactions` (Sổ cái kế toán).
- [ ] **Logic:** Mọi giao dịch (Rebate, Ref, Upgrade) phải ghi log dòng tiền (Credit/Debit). Không cộng trừ ngang.
- [ ] **Trạng thái hiện tại:** Chưa có. Đang hiển thị số giả.

### 1.2. Script Phân Phối Hoa Hồng (The Viral Engine)
- [ ] **Input:** Dữ liệu Trade Volume (Giả lập hoặc Nhập file Excel từ sàn trả về).
- [ ] **Process:** 
    1. Quét User Tier (Free/Pro/Elite).
    2. Tính Self-Rebate.
    3. Truy xuất cây phả hệ (Upline 4 đời).
    4. Tính hoa hồng từng tầng (theo `unified-tiers.ts`).
- [ ] **Output:** Cộng tiền vào `user_wallets`.
- [ ] **Trạng thái hiện tại:** Chỉ có logic trên giấy, chưa có Code chạy.

---

## 🔗 PHASE 2: EXCHANGE AGGREGATOR (KẾT NỐI DỮ LIỆU THẬT)
*Lý do: User cần thấy tài sản thật của họ trên Dashboard.*

### 2.1. Quản lý API Key An toàn
- [ ] **Feature:** User nhập API Key (Binance/OKX).
- [ ] **Security:** Mã hóa AES-256 trước khi lưu xuống DB (Không lưu plain text).
- [ ] **Validation:** Gọi thử 1 lệnh API check balance ngay khi nhập để báo "Connected".
- [ ] **Trạng thái hiện tại:** Form UI có, nhưng chưa lưu và chưa mã hóa thật.

### 2.2. Portfolio Sync (Đồng bộ tài sản)
- [ ] **Logic:** Cronjob chạy (ví dụ 1 tiếng/lần) dùng API Key user để kéo số dư ví về.
- [ ] **Hiển thị:** Cập nhật số liệu trên Dashboard/Wallet thật thay vì số cứng.
- [ ] **Trạng thái hiện tại:** Đang dùng Mock Data.

---

## 🧠 PHASE 3: AI SIGNAL & MARKETPLACE (SẢN PHẨM LÕI)
*Lý do: User trả tiền để mua cái này.*

### 3.1. AI Signal Generator (Automated)
- [ ] **Logic:** Viết một script đơn giản phân tích giá (RSI, MACD) của BTC/ETH mỗi 4 giờ.
- [ ] **Action:** Tự động bắn tín hiệu vào bảng `trading_signals`.
- [ ] **Mục đích:** Đảm bảo Dashboard luôn có tín hiệu mới ("Live") mà không cần Admin nhập tay.
- [ ] **Trạng thái hiện tại:** Cần nhập tay hoặc Mock.

### 3.2. Strategy Marketplace (Social Trading)
- [ ] **Feature:** Cho phép Leader (Elite/Whale) đăng bài phân tích/Share kèo.
- [ ] **Cơ chế:** User thường có thể "Follow" hoặc "Unlock" bài viết (có phí hoặc miễn phí).
- [ ] **Mục đích:** Lấp đầy nội dung khi AI chưa đủ thông minh. Dùng người giỏi để giữ chân người mới.
- [ ] **Trạng thái hiện tại:** Chưa bắt đầu.

---

## 🛡️ PHASE 4: RISK & SECURITY (LỜI HỨA THƯƠNG HIỆU)
*Lý do: Khẳng định đẳng cấp Institutional Grade.*

### 4.1. Risk Guardian Worker
- [ ] **Logic:** Một Process chạy ngầm quét danh mục đầu tư của User.
- [ ] **Alert:** Nếu sụt giảm > 10% trong 1h -> Gửi Email/Telegram cảnh báo.
- [ ] **Trạng thái hiện tại:** UI có, Backend chưa chạy.

---

## 📅 LỘ TRÌNH THỰC HIỆN (ESTIMATED: 10-14 NGÀY)

1. **Ngày 1-3:** Build **Phase 1 (Financial Core)**. Xây DB ví và Engine chia tiền. (Critical)
2. **Ngày 4-6:** Build **Phase 2 (Exchange Connect)**. Mã hóa Key và Sync thử Balance Binance.
3. **Ngày 7-10:** Build **Phase 3 (Marketplace)**. Tạo sân chơi cho Leader.
4. **Ngày 11-12:** Build **Phase 4 (Risk Alert)** & Auto Signal Script.
5. **Ngày 13-14:** Audit toàn diện & Fix Bug.

---

**QUYẾT ĐỊNH CỦA ADMIN:**
Anh duyệt lộ trình này thì em sẽ bắt đầu ngay vào **Phase 1: Financial Core** (Tạo ví và Sổ cái dòng tiền) đầu tiên. Đây là phần quan trọng nhất để hệ thống có thể "chạy tiền" thật.
