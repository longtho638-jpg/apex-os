# Tổng hợp kiến thức: ApexOS

## 1. Bảo mật và CSP cho TradingView WebSockets
Trong quá trình phát triển ApexOS, chúng tôi đã gặp vấn đề về Content Security Policy (CSP) khi tích hợp TradingView WebSockets. Để giải quyết, chúng tôi đã phải cập nhật `next.config.ts` để cho phép kết nối đến các domain của TradingView.

**Bài học**: Khi tích hợp các dịch vụ bên thứ ba sử dụng WebSocket hoặc các tài nguyên bên ngoài khác, luôn kiểm tra và cấu hình CSP một cách cẩn thận để đảm bảo tính bảo mật mà không làm gián đoạn chức năng. Cần whitelist cả HTTPS và WSS (WebSocket Secure) cho các domain tương ứng.

## 2. Cơ chế Referral và xử lý lỗi xác thực
Một vấn đề khác liên quan đến cơ chế Referral, nơi API trả về lỗi 401 Unauthorized do thiếu header xác thực. Giải pháp được triển khai là thêm một fallback để kiểm tra thông tin xác thực từ cookie nếu header Authorization không tồn tại.

**Bài học**: Luôn đảm bảo các cơ chế xác thực được xử lý mạnh mẽ cho cả header và cookie, đặc biệt là trong các luồng dữ liệu nhạy cảm như Referral. Cần có cơ chế fallback hoặc kiểm tra đa lớp để tránh các lỗi xác thực không mong muốn có thể ảnh hưởng đến trải nghiệm người dùng và tính toàn vẹn của dữ liệu.

## 3. Hệ thống phân quyền theo Tier
Hệ thống ApexOS áp dụng cơ chế phân quyền dựa trên các cấp độ (Tier-based visibility), được mô tả chi tiết trong `DASHBOARD_ARCHITECTURE.md`. Cơ chế này đảm bảo mỗi người dùng chỉ có thể truy cập thông tin và tính năng phù hợp với cấp độ của họ (User, $99, Admin).

**Bài học**: Việc thiết kế hệ thống phân quyền rõ ràng từ đầu là rất quan trọng. Sử dụng tài liệu kiến trúc để định nghĩa từng cấp độ, các quyền truy cập tương ứng và cách chúng tương tác với giao diện người dùng và API. Điều này giúp dễ dàng mở rộng và duy trì hệ thống trong tương lai, đồng thời giảm thiểu rủi ro bảo mật do truy cập trái phép.

## 4. Cấu trúc Test Suite
Hệ thống test của ApexOS sử dụng Vitest, với các cấu hình riêng biệt cho các loại test khác nhau:
- `vitest.config.ts`: Cấu hình test chung cho các file `src/**/*.test.{ts,tsx}` và `backend/**/*.test.{ts,tsx}`.
- `vitest.security.config.ts`: Cấu hình chuyên biệt cho các bài kiểm tra bảo mật, được chạy thông qua `scripts/security-test.ts`.

**Bài học**: Việc phân tách các cấu hình test cho phép tùy chỉnh sâu hơn và tối ưu hóa quá trình kiểm thử. Các test bảo mật nên được tách riêng và có cấu hình đặc biệt để đảm bảo chúng chạy hiệu quả và tập trung vào các kịch bản tấn công tiềm năng. Duy trì các script riêng để chạy từng loại test giúp dễ dàng tích hợp vào quy trình CI/CD và nhận phản hồi nhanh chóng về các khía cạnh cụ thể của chất lượng code.