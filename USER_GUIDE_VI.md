# Hướng Dẫn Sử Dụng ApexOS

**Phiên bản:** 1.0.0  
**Cập nhật:** 19/11/2025

---

## 🌟 Chào Mừng Đến Với ApexOS

ApexOS là hệ thống vận hành giao dịch thông minh được hỗ trợ bởi các tác nhân AI. Hướng dẫn này sẽ giúp bạn bắt đầu và hiểu tất cả tính năng.

---

## 📖 Mục Lục

1. [Bắt Đầu Nhanh](#bắt-đầu-nhanh)
2. [Tổng Quan Dashboard](#tổng-quan-dashboard)
3. [Terminal Giao Dịch](#terminal-giao-dịch)
4. [Bảng Điều Khiển Admin](#bảng-điều-khiển-admin)
5. [Hiểu Dữ Liệu Của Bạn](#hiểu-dữ-liệu-của-bạn)
6. [Giải Thích Các AI Agent](#giải-thích-các-ai-agent)
7. [Câu Hỏi Thường Gặp](#câu-hỏi-thường-gặp)

---

## 🚀 Bắt Đầu Nhanh

### Bước 1: Truy Cập ApexOS

Mở trình duyệt và vào:
```
http://localhost:3000/dashboard
```

### Bước 2: Kết Nối Sàn Giao Dịch

1. Nhấn nút **"Kết Nối Sàn"**
2. Chọn sàn của bạn (Binance, Bybit, hoặc OKX)
3. Nhập API credentials **CHỈ ĐỌC**
4. Nhấn **"Kết Nối"**

**⚠️ Lưu Ý Bảo Mật:** ApexOS chỉ cần quyền ĐỌC. Không bao giờ cho quyền GIAO DỊCH.

### Bước 3: Chờ Đồng Bộ

Hệ thống sẽ tự động:
- Lấy lịch sử giao dịch
- Tính PnL của bạn
- Phân tích phí hoàn trả
- Kiểm tra mức độ rủi ro

Mất 1-3 phút cho lần đồng bộ đầu tiên.

---

## 📊 Tổng Quan Dashboard

### Chỉ Số Quan Trọng

#### 1. **Tổng PnL (30 Ngày)**
- Hiển thị lãi/lỗ trong 30 ngày gần nhất
- Xanh = Lãi, Đỏ = Lỗ
- Đã trừ tất cả phí

**Ví dụ:**
```
Tổng PnL: +$4,291.00
Tỷ lệ thắng: 62.5%
```

#### 2. **Rebate Nhận Được**
- Tiền hoàn lại từ phí sàn
- ApexOS đàm phán tỷ lệ tốt hơn cho bạn
- Tự động tính hàng tháng

**Cách hoạt động:**
```
Bạn trả $1,000 phí
Sàn trả Apex $200 hoa hồng
Bạn nhận lại $170 (85%)
Apex giữ $30 (15%)
```

#### 3. **Điểm Rủi Ro**
- **Thấp:** An toàn, không rủi ro thanh lý
- **Trung bình:** Theo dõi vị thế
- **Cao:** Giảm đòn bẩy ngay lập tức

**Được hỗ trợ bởi:** The Guardian Agent (AI quản lý rủi ro)

---

## 💹 Terminal Giao Dịch

### Theo Dõi Thị Trường Real-Time

Hiển thị giá live từ Binance cho:
- BTC/USDT
- ETH/USDT
- SOL/USDT
- BNB/USDT
- Và nhiều hơn...

**Tính năng:**
- ✅ Cập nhật giá trực tiếp (WebSocket)
- ✅ % thay đổi 24h
- ✅ Click để chọn thị trường

### Agentic Insights

Ba cảnh báo AI:

#### 1. Dự Đoán Phí
- Dự đoán chi phí funding
- Cảnh báo khi tỷ lệ tăng đột biến
- Đề xuất điều chỉnh vị thế

#### 2. Quét Biến Động
- Phát hiện điều kiện thị trường rủi ro cao
- Cảnh báo về slippage
- Gợi ý lệnh limit vs lệnh market

#### 3. Đánh Giá Setup Giao Dịch
- Điểm tin cậy AI
- Tâm lý tăng/giảm/trung tính
- Dựa trên nhiều chỉ báo

---

## 🛡️ Bảng Điều Khiển Admin

**Truy cập:** http://localhost:3000/admin  
**Mật khẩu:** `admin123` (đổi khi production!)

### Các Tab

#### 1. Quản Lý User
- Xem tất cả users
- Kiểm tra khối lượng giao dịch
- Ban tài khoản đáng ngờ

#### 2. Đối Soát Tài Chính
- Tổng phí thu được
- Rebate đã phân phối
- Biên lợi nhuận Apex
- Xử lý thanh toán

#### 3. Sức Khỏe Hệ Thống
- Uptime API
- Tỷ lệ lỗi
- Kết nối đang hoạt động
- Logs agent real-time

---

## 📈 Hiểu Dữ Liệu Của Bạn

### Tính PnL

ApexOS sử dụng phương pháp **FIFO (First-In, First-Out)**:

**Ví dụ:**
```
Mua 1 BTC @ $40,000
Mua 1 BTC @ $42,000
Bán 2 BTC @ $45,000

Tính PnL:
BTC thứ nhất: ($45,000 - $40,000) - phí = $4,960
BTC thứ hai: ($45,000 - $42,000) - phí = $2,960
Tổng PnL: $7,920
```

### Các Loại Phí

1. **Phí Giao Dịch**
   - Maker: 0.02% (khi đặt lệnh limit)
   - Taker: 0.04% (khi lấy lệnh sẵn có)

2. **Phí Funding**
   - Trả mỗi 8 giờ trên futures vĩnh viễn
   - Tỷ lệ dương = Short trả Long
   - Tỷ lệ âm = Long trả Short

3. **Rebate**
   - Phần hoa hồng của bạn
   - Tính hàng tháng
   - Trả tự động

---

## 🤖 Giải Thích Các AI Agent

### 1. The Collector
**Vai trò:** Thu thập dữ liệu  
**Nhiệm vụ:**
- Lấy giá BTC/crypto
- Đồng bộ giao dịch từ sàn
- Cập nhật snapshot portfolio

**Trạng thái:** Luôn chạy

---

### 2. The Auditor
**Vai trò:** Kế toán phí  
**Nhiệm vụ:**
- Đối soát phí (kiểm tra tính quá)
- Tính rebate của bạn
- Tạo báo cáo thuế

**Độ chính xác:** ±0.01 USD

---

### 3. The Guardian
**Vai trò:** Quản lý rủ ro  
**Nhiệm vụ:**
- Theo dõi giá thanh lý
- Cảnh báo đòn bẩy quá mức
- Theo dõi chi phí funding rate

**Mức cảnh báo:**
- 🟢 **An toàn:** Không cần hành động
- 🟡 **Cảnh báo:** Theo dõi sát
- 🔴 **Nguy kịch:** Giảm vị thế NGAY

---

## ❓ Câu Hỏi Thường Gặp

### H: Tại sao PnL của tôi âm?
**Đ:** Kiểm tra:
1. Đã tính phí chưa?
2. Có giao dịch thua không?
3. Chi phí funding rate cao?

Dùng tab Auditor để xem chi tiết.

---

### H: Rebate được tính như thế nào?
**Đ:** 
```
Phí Của Bạn × Tỷ Lệ Hoa Hồng × Phần Của Bạn
Ví dụ: $1,000 × 20% × 85% = $170 rebate
```

---

### H: Dữ liệu của tôi có an toàn không?
**Đ:**
✅ API keys mã hóa AES-256  
✅ Chỉ quyền đọc (không giao dịch)  
✅ RLS (Row-Level Security) trên database  
✅ Lưu trữ tại Supabase (SOC 2 compliant)

---

**Được tạo với ❤️ bởi ApexOS Team**
