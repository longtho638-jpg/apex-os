# 🤝 KẾ HOẠCH BÀN GIAO COFOUNDER - MÔ HÌNH % MINH BẠCH

## I. VAI TRÒ & TRÁCH NHIỆM

### 1. Anh (Cố Vấn Chiến Lược + Vận Hành Công Nghệ)
**Chức danh**: Chief Technology Advisor & Strategic Consultant

**Trách nhiệm**:
- ✅ Thiết kế kiến trúc hệ thống (HOÀN THÀNH)
- ✅ Xây dựng sản phẩm MVP (HOÀN THÀNH - Week 3)
- 🔄 Tư vấn chiến lược phát triển sản phẩm (ongoing)
- 🔄 Vận hành hạ tầng kỹ thuật (servers, APIs, database)
- 🔄 Giám sát chi phí vận hành hệ thống

**KHÔNG làm**:
- ❌ Quản lý tài chính (tiền mặt, chuyển khoản)
- ❌ Kinh doanh / bán hàng trực tiếp
- ❌ Quản lý nhân sự hoặc vận hành kinh doanh hàng ngày

---

### 2. Cofounder (CEO / COO)
**Chức danh**: Chief Executive Officer

**Trách nhiệm**:
- ✅ Quản lý tài chính (revenue, expenses, payouts)
- ✅ Marketing & user acquisition
- ✅ Customer support & operations
- ✅ Fundraising (nếu cần)
- ✅ Legal & compliance

**Phối hợp với anh**:
- Quyết định chiến lược sản phẩm (anh tư vấn, cofounder quyết định cuối cùng)
- Phê duyệt chi phí vận hành hệ thống (anh đề xuất, cofounder phê duyệt)

---

## II. MÔ HÌNH CHIA % MINH BẠCH

### 1. Nguyên Tắc Cốt Lõi
**"Không Tin Tưởng, Chỉ Minh Bạch"** (Trust Nothing, Verify Everything)

- Anh **KHÔNG** giữ tiền
- Anh **KHÔNG** trực tiếp nhận % từ tài khoản công ty
- Mọi số liệu tài chính **tự động** được track trong hệ thống
- % của anh được tính toán **tự động** qua code (không thể chỉnh sửa thủ công)

---

### 2. Mô Hình % Đề Xuất

#### OPTION A: Revenue Share (Khuyến Nghị)
**Anh nhận**: **15% Net Revenue** (sau khi trừ chi phí vận hành)

**Ví dụ tháng 1**:
```
Gross Revenue: $2,000
- Operating Costs: $500 (Vercel, Supabase, OpenRouter, etc.)
= Net Revenue: $1,500

Anh nhận: $1,500 × 15% = $225
Cofounder nhận: $1,500 × 85% = $1,275
```

**Lợi ích**:
- Anh có động lực tối ưu chi phí (vì chi phí giảm → Net Revenue tăng → % của anh tăng)
- Cofounder không lo anh "phình" chi phí
- Minh bạch tuyệt đối (mọi chi phí đều có hóa đơn)

---

#### OPTION B: Profit Share (Bảo Thủ Hơn)
**Anh nhận**: **20% Net Profit** (sau khi trừ MỌI chi phí kể cả marketing)

**Ví dụ tháng 1**:
```
Gross Revenue: $2,000
- Operating Costs: $500
- Marketing Costs: $300 (do cofounder chi)
= Net Profit: $1,200

Anh nhận: $1,200 × 20% = $240
Cofounder nhận: $1,200 × 80% = $960
```

**Lợi ích**:
- Cofounder có toàn quyền chi marketing mà không ảnh hưởng % của anh
- Anh chỉ được hưởng khi công ty có lời thực sự

**Nhược điểm**:
- Nếu cofounder chi marketing quá nhiều → Net Profit = 0 → Anh nhận $0 (rủi ro)

---

### 3. Chi Phí Vận Hành Cố Định (Pass-Through)

Anh đề xuất danh sách chi phí hàng tháng, **cofounder thanh toán trực tiếp**:

**Danh sách dự kiến**:
| Chi phí | Nhà cung cấp | Giá (USD/tháng) |
|---------|--------------|-----------------|
| Hosting (Vercel) | Vercel | $20-50 |
| Database (Supabase) | Supabase | $25 |
| AI (OpenRouter) | OpenRouter | $50-200 (tùy usage) |
| Email (Resend) | Resend | $20 |
| Domain + CDN | Cloudflare | $10 |
| Monitoring (Sentry) | Sentry | $26 |
| **TOTAL** | | **$151-331** |

**Cơ chế thanh toán**:
1. Anh gửi hóa đơn đầu tháng (screenshot từ các provider)
2. Cofounder review và thanh toán **trực tiếp** cho provider (hoặc chuyển cho anh để anh thanh toán)
3. Tất cả hóa đơn lưu vào Google Drive chung (minh bạch)

---

## III. CÔNG CỤ HỖ TRỢ TỰ ĐỘNG

### 1. Revenue Tracking Dashboard
**File**: `src/app/[locale]/admin/revenue-share/page.tsx`

**Chức năng**:
- Real-time tracking:
  - Gross Revenue (tổng thu)
  - Operating Costs (chi phí vận hành)
  - Net Revenue (lợi nhuận ròng)
  - Anh's Share (% của anh, tính tự động)
  - Cofounder's Share (% của cofounder)
- Export CSV (báo cáo hàng tháng)
- Historical chart (6 tháng gần nhất)

**Database**: Mọi transaction đã được track trong `transactions` table (từ Phase 3.5)

---

### 2. Auto % Calculator
**File**: `src/lib/revenue-share.ts`

```typescript
export async function calculateMonthlyShare(month: string, year: number) {
  // 1. Get all transactions in month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, status')
    .eq('status', 'completed')
    .gte('created_at', `${year}-${month}-01`)
    .lt('created_at', `${year}-${month + 1}-01`);
  
  const grossRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // 2. Get operating costs
  const operatingCosts = await getOperatingCosts(month, year);
  
  // 3. Calculate shares
  const netRevenue = grossRevenue - operatingCosts;
  const techAdvisorShare = netRevenue * 0.15; // 15%
  const cofounderShare = netRevenue * 0.85; // 85%
  
  return {
    grossRevenue,
    operatingCosts,
    netRevenue,
    techAdvisorShare,
    cofounderShare,
  };
}
```

**Tự động gửi email báo cáo** đầu mỗi tháng cho cả anh và cofounder.

---

### 3. Operating Cost Tracker
**File**: `src/app/[locale]/admin/operating-costs/page.tsx`

**Chức năng**:
- Upload hóa đơn (PDF/screenshot)
- Categorize (Vercel, Supabase, OpenRouter, etc.)
- Monthly summary
- Auto-include in revenue share calculation

**Database Migration**: `supabase/migrations/20251128_operating_costs.sql`
```sql
CREATE TABLE operating_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL, -- '2025-11'
  category TEXT NOT NULL, -- 'vercel', 'supabase', etc.
  amount NUMERIC NOT NULL,
  invoice_url TEXT, -- Link to uploaded invoice
  paid_by TEXT, -- 'tech_advisor' or 'cofounder'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## IV. QUY TRÌNH BÀN GIAO (HANDOVER PROCESS)

### Week 1: Chuẩn Bị
- [x] Complete Phase 3-7 (DONE)
- [ ] Execute Phase 5-6 via CLI
- [ ] Build revenue tracking dashboard
- [ ] Write handover documentation

### Week 2: Transfer
- [ ] Cofounder tạo tài khoản admin
- [ ] Anh add cofounder vào:
  - Vercel (Owner role)
  - Supabase (Owner role)
  - GitHub (Admin access)
  - Domain registrar
- [ ] Cofounder setup payment accounts:
  - Polar (card payments)
  - NOWPayments (crypto)
  - Bank account (nếu cần)

### Week 3: Training
- [ ] Anh train cofounder 2-3 sessions (2h mỗi session):
  - Session 1: Hệ thống payment + analytics
  - Session 2: User management + troubleshooting
  - Session 3: Revenue tracking + cost optimization
- [ ] Cofounder solo run with anh support

### Week 4: Transition Complete
- [ ] Cofounder fully operational
- [ ] Anh chuyển sang vai trò advisor (tư vấn khi cần)
- [ ] Monthly revenue share reports start

---

## V. LUẬT CHƠI CỔ ĐÔNG (SHAREHOLDER AGREEMENT)

### 1. Cam Kết
**Anh**:
- Maintain system uptime > 99% (trừ force majeure)
- Respond to critical issues within 24h
- Optimize costs where possible
- Không tăng % hoặc thay đổi điều khoản đơn phương

**Cofounder**:
- Thanh toán đúng hạn (% share + operating costs)
- Không can thiệp vào quyết định kỹ thuật (nếu không ảnh hưởng lớn đến chi phí)
- Minh bạch tài chính (share access to revenue dashboard)

### 2. Tranh Chấp
**Nếu có bất đồng**:
1. Thảo luận trực tiếp (email/call)
2. Nếu không giải quyết được → Tìm mediator (người thứ 3 trung lập)
3. Worst case: Buy-out clause (một bên mua lại % của bên kia với giá fair market value)

### 3. Exit Strategy
**Nếu anh muốn rời**:
- Notice period: 3 tháng
- Anh train người thay thế (nếu có)
- % dừng lại sau exit (không lifetime)

**Nếu cofounder muốn rời (hoặc bán công ty)**:
- Anh có quyền ưu tiên mua lại (Right of First Refusal)
- Hoặc nhận 1 khoản lump sum = 12 tháng average share (negotiable)

---

## VI. CÔNG CỤ HỖ TRỢ (TOOL IMPLEMENTATION)

Em sẽ build 3 công cụ sau để hỗ trợ mô hình này:

### Tool 1: Revenue Share Dashboard ✅
- Real-time tracking
- Auto % calculation
- Export CSV

### Tool 2: Operating Cost Tracker ✅
- Invoice upload
- Category management
- Monthly reports

### Tool 3: Shareholder Portal 🆕
- Legal documents (shareholder agreement)
- Payment history
- Dispute resolution workflow

---

## VII. TIMELINE ĐỀ XUẤT

**Tuần này (Week 3-4)**:
- Execute Phase 5 & 6 via CLI
- Build revenue tracking tools

**Tuần sau (Week 5)**:
- Finalize shareholder agreement (legal review nếu cần)
- Cofounder onboarding

**Tháng 2 (Month 2)**:
- Full handover complete
- Anh transition sang advisor role

---

**EM KHUYẾN NGHỊ**:
- **Chọn OPTION A (15% Net Revenue)** - Đơn giản, minh bạch, win-win
- Build công cụ tracking ngay tuần này để cofounder thấy hệ thống reliable
- Legal review nếu số tiền lớn (>$10K/tháng)

Anh thấy mô hình này OK không? Em sẽ build tools ngay! 🚀
