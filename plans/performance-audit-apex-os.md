# Kế hoạch Kiểm toán Hiệu suất & Hạ tầng (Performance & Infrastructure Audit) cho apps/apex-os

## Mục tiêu
Đánh giá toàn diện 10 lớp hạ tầng của dự án `apps/apex-os` theo tiêu chuẩn "Enterprise Grade".

## Phạm vi (10 Lớp)
1.  **Database (Cơ sở dữ liệu)**: Schema, migrations, RLS, backups.
2.  **Server (Máy chủ)**: Hosting, Edge Functions, hiệu suất.
3.  **Networking (Mạng)**: DNS, SSL, Headers bảo mật.
4.  **Cloud (Đám mây)**: Nhà cung cấp, khả năng mở rộng, chi phí.
5.  **CI/CD**: Quy trình kiểm thử và triển khai tự động.
6.  **Security (Bảo mật)**: Xác thực, quản lý bí mật, bảo vệ (headers, rate limit).
7.  **Monitoring (Giám sát)**: Theo dõi lỗi (Sentry), APM, logs.
8.  **Containers**: Dockerfile, orchestration (nếu có).
9.  **CDN**: Caching, phân phối biên (Edge).
10. **Backup**: Kế hoạch phục hồi thảm họa (DR), quy trình sao lưu.

## Các bước thực hiện

### Bước 1: Khám phá & Điều tra (Investigation)
Sử dụng các công cụ `ls`, `grep`, `cat` để kiểm tra các file cấu hình quan trọng:
-   **Database**: `supabase/`, `src/lib/supabase/`
-   **Server/Cloud/CDN**: `next.config.mjs`, `vercel.json`
-   **CI/CD**: `.github/workflows/`, `package.json`
-   **Security**: `middleware.ts`, `.env.example`
-   **Monitoring**: `sentry.*.config.ts`
-   **Containers**: `Dockerfile`, `docker-compose.yml`

### Bước 2: Đánh giá & Chấm điểm (Evaluation)
-   So sánh hiện trạng với tiêu chuẩn Enterprise.
-   Chấm điểm từng lớp trên thang 1-10.

### Bước 3: Báo cáo (Reporting)
-   Tổng hợp kết quả vào file báo cáo chi tiết: `plans/reports/actual-fullstack-audit-[DATE]-apex-os.md`.
-   Ngôn ngữ: Tiếng Việt.

## Đầu ra mong đợi
Một báo cáo kiểm toán đầy đủ, nêu rõ các điểm mạnh, điểm yếu, điểm số và các khuyến nghị cải thiện.
