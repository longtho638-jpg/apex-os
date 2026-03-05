# Báo Cáo Rà Soát Codebase ApexOS - 2026-02-14

## 1. Tổng Quan
Báo cáo này tổng hợp kết quả rà soát codebase `apex-os` tập trung vào chất lượng mã nguồn, an toàn kiểu dữ liệu và bảo mật hệ thống theo tiêu chuẩn Binh Pháp.

- **Thời gian rà soát**: 2026-02-14
- **Phạm vi**: Thư mục `src/`, `supabase/`, và các file cấu hình chính.
- **Công cụ sử dụng**: `grep`, `ls`, `pnpm audit`, phân tích thủ công.

## 2. Kết Quả Chi Tiết

### 🔴 Nợ Kỹ Thuật (Tech Debt)
- **Tình trạng**: ⚠️ Cần lưu ý
- **Phát hiện**:
  - Tìm thấy nhiều `console.log`, `TODO`, `FIXME` rải rác trong codebase.
  - File `src/lib/notifications.test.ts` chứa nhiều `console.log` (chấp nhận được trong test).
  - File `src/lib/logger.ts` sử dụng `console.log` để output log (đây là wrapper hợp lệ, nhưng cần đảm bảo `maskSensitiveData` hoạt động chính xác).
- **Đánh giá**: Mặc dù không tìm thấy vi phạm nghiêm trọng trong logic chính, việc tồn đọng nhiều `TODO` cho thấy nhiều tính năng chưa hoàn thiện hoặc cần tối ưu.

### 🟢 An Toàn Kiểu Dữ Liệu (Type Safety)
- **Tình trạng**: ✅ Tốt
- **Phát hiện**:
  - Không tìm thấy việc sử dụng `any`, `as any`, `<any>` trong thư mục `src/**/*.{ts,tsx}`.
  - Một số file script (`scripts/*.ts`) có sử dụng `any`, nhưng nằm ngoài phạm vi production code.
- **Đánh giá**: Team tuân thủ rất tốt kỷ luật về TypeScript trong mã nguồn chính.

### 🟡 Bảo Mật (Security)
- **Tình trạng**: ⚠️ Khá tốt nhưng cần cải thiện dependencies
- **Phát hiện**:
  - **Hardcoded Secrets**: Không tìm thấy trong `src/`.
  - **Middleware (`src/middleware.ts`)**:
    - Đã thiết lập CSP với `nonce`.
    - Có logic fallback secret cho môi trường dev (`dev-secret-only-for-local-testing...`). **Cảnh báo**: Cần đảm bảo biến môi trường `SUPABASE_JWT_SECRET` luôn được thiết lập trong production để tránh dùng fallback này.
  - **Logging (`src/lib/logger.ts`)**:
    - Đã tích hợp `maskSensitiveData` để ẩn các trường nhạy cảm (password, token, key...).
  - **Database (`supabase/migrations/20251127_rls_policies.sql`)**:
    - RLS đã được kích hoạt (`ENABLE ROW LEVEL SECURITY`) cho các bảng quan trọng (`user_tiers`, `referral_network`, v.v.).
    - Các policy phân quyền rõ ràng (user chỉ xem được dữ liệu của mình).
  - **Dependencies**:
    - `pnpm audit` phát hiện **3 lỗ hổng mức High** và **1 lỗ hổng mức Low**.
    - Các thư viện bị ảnh hưởng: `xlsx`, `fastify` (trong `apps/com-anh-duong-10x` và `apps/engine`, có thể ảnh hưởng gián tiếp hoặc do monorepo).

## 3. Đề Xuất Sửa Lỗi (Top 5 File Quan Trọng)

### 1. `package.json` & Lockfile
- **Vấn đề**: Các lỗ hổng bảo mật trong dependencies.
- **Hành động**: Chạy `pnpm update` hoặc nâng cấp thủ công các gói `xlsx` và `fastify` lên phiên bản đã vá lỗi.

### 2. `src/middleware.ts`
- **Vấn đề**: Logic fallback secret tiềm ẩn rủi ro nếu cấu hình sai.
- **Hành động**: Thêm log cảnh báo mạnh (hoặc throw error ngay cả khi không phải production nếu muốn nghiêm ngặt) khi sử dụng fallback secret.
```typescript
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: SUPABASE_JWT_SECRET is not defined in production');
}
// Đề xuất thêm:
if (!jwtSecret) {
  console.warn('WARNING: Using insecure default JWT secret. Do not use in production!');
}
```

### 3. `src/lib/logger.ts`
- **Vấn đề**: Danh sách `SENSITIVE_KEYS` có thể chưa bao phủ hết các trường hợp mới.
- **Hành động**: Rà soát và bổ sung các từ khóa nhạy cảm mới nếu có (ví dụ: `card_number`, `cvv`, `secret_key`). Đảm bảo log level production không ghi quá nhiều thông tin dư thừa.

### 4. Các file chứa `TODO` / `FIXME`
- **Vấn đề**: Nợ kỹ thuật tồn đọng.
- **Hành động**: Review các `TODO` này. Nếu không còn cần thiết thì xóa, nếu quan trọng thì chuyển thành task cụ thể trong hệ thống quản lý task.

### 5. `src/app/api/v1/auth/login/route.ts`
- **Vấn đề**: Logic xác thực phức tạp.
- **Hành động**: Đảm bảo unit test bao phủ đủ các trường hợp: login thành công, sai pass, rate limit, MFA required, và lỗi kết nối Supabase.

## 4. Kết Luận
Codebase `apex-os` có chất lượng nền tảng tốt, đặc biệt là về Type Safety và cấu trúc bảo mật (Middleware, RLS). Các vấn đề chính cần giải quyết ngay là cập nhật dependencies để vá lỗ hổng bảo mật và dọn dẹp nợ kỹ thuật (TODOs).

**Điểm đánh giá sơ bộ**: 8.5/10
