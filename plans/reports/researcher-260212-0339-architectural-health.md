# Báo cáo Sức khỏe Kiến trúc ApexOS

**Ngày báo cáo:** 12/02/2026
**Người thực hiện:** Antigravity Researcher

## 1. Tổng quan

Dựa trên phân tích codebase tại `/Users/macbookprom1/mekong-cli/apps/apex-os`, hệ thống hiện tại có cấu trúc Next.js tiêu chuẩn nhưng đang gặp phải một số vấn đề về kiến trúc và nợ kỹ thuật cần giải quyết để đảm bảo khả năng mở rộng và bảo trì.

## 2. Circular Dependencies (Phụ thuộc vòng)

Đã phát hiện **1 cặp phụ thuộc vòng nghiêm trọng** cần xử lý ngay lập tức:

### 🔴 Cặp 1: Logic nghiệp vụ phụ thuộc vào UI
- **File A:** `src/lib/quant/SignalLogic.ts` (Logic tính toán tín hiệu)
- **File B:** `src/components/dashboard/AlphaDashboard.tsx` (Giao diện Dashboard)
- **Mô tả:**
  - `SignalLogic.ts` import `SignalType` và `TradePlan` từ `AlphaDashboard.tsx`.
  - `AlphaDashboard.tsx` import hàm `generateQuantSignal` từ `SignalLogic.ts`.
- **Vi phạm:** Nguyên tắc Clean Architecture. Logic nghiệp vụ (Layer bên trong) không được phụ thuộc vào UI (Layer bên ngoài). Việc import Type từ Component file khiến Logic bị ràng buộc chặt chẽ với implementation của UI.
- **Giải pháp:**
  - Tạo file mới `src/types/trading.ts` hoặc `src/lib/quant/types.ts`.
  - Di chuyển các interface `SignalType`, `Signal`, `TradePlan` từ `AlphaDashboard.tsx` sang file type mới.
  - Cả `SignalLogic.ts` và `AlphaDashboard.tsx` đều import từ file type này.

### 🟡 Cặp 2 (False Positive/Minor): Self-reference
- **File:** `src/lib/analytics-mock.ts`
- **Mô tả:** Công cụ phát hiện ghi nhận self-reference. Kiểm tra nội dung file cho thấy file này độc lập. Có thể bỏ qua.

## 3. Phân tích Cấu trúc & Nợ Kỹ thuật

### 3.1. Technical Debt (Đã được ghi nhận trong TECHNICAL_DEBT.md)
- **Analytics & Monitoring:** Hiện đang dùng Mock (`console.log`) thay vì service thật (PostHog/Sentry).
- **Hardcoded Values:**
  - Giá sản phẩm cũ ($49/$99) còn tồn tại trong nhiều file UI, xung đột với giá mới ($29/$97).
  - Commission rates trong `tier-manager.ts` sai lệch so với cấu hình thống nhất.
- **Verification Logic:** Code xác thực Exchange đang bị comment out, sử dụng mock data.

### 3.2. Cấu trúc thư mục
- **`src/lib`:** Đang chứa lẫn lộn giữa utility functions, mock services, và core business logic (`quant/`).
  - *Kiến nghị:* Tách `src/lib/quant` thành module riêng hoặc service layer rõ ràng hơn (`src/services/quant`).
- **Barrel Files:** Dự án ít sử dụng `index.ts` để export (kết quả quét `index.ts` rỗng). Điều này tốt cho tree-shaking nhưng có thể làm import path dài dòng.

## 4. Kế hoạch hành động (Kiến nghị)

1. **[CRITICAL] Refactor Circular Dependency:**
   - Tạo `src/types/trading.ts`.
   - Di chuyển type definitions.
   - Cập nhật import ở `SignalLogic.ts` và `AlphaDashboard.tsx`.

2. **[HIGH] Fix Conflict Audit:**
   - Sửa giá hardcoded và commission rates theo `CONFLICT_AUDIT_CRITICAL.md`.

3. **[MEDIUM] Clean Architecture:**
   - Định nghĩa rõ boundary giữa Logic và UI. Tuyệt đối không import bất cứ thứ gì từ `src/components` vào `src/lib` hoặc `src/hooks` (trừ khi là shared UI hooks).

## 5. Kết luận

Hệ thống hoạt động nhưng mong manh do phụ thuộc vòng giữa core logic và UI. Việc refactor tách Type definition là chi phí thấp nhưng mang lại giá trị cao về độ ổn định. Cần ưu tiên xử lý trước khi mở rộng tính năng Quant Signal.
