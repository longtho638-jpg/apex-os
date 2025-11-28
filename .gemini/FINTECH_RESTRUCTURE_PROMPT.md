# Prompt: Tái Cấu Trúc Toàn Diện Apex-OS theo Chuẩn Fintech

## 🎯 Mục Tiêu

Thực hiện **tái cấu trúc thuật toán toàn diện** cho Apex-OS (trading platform) đảm bảo chuẩn **Fintech-grade**, ánh xạ theo khung **MASTER Agentic Business Plan 2026 Zero→IPO** (VN/SEA).

## 📋 Input Requirements

### 1. Đọc Bắt Buộc (Mandatory Reads)
- **Master Plan**: `docs/00_MASTER-Agentic-BizPlan-OS.json` (Đã được copy vào project)
- **Project Context**: `.gemini/DAILY_UPDATE.md`
- **Current Architecture**: `docs/SYSTEM_ARCHITECTURE.md` (if exists)
- **Code Standards**: `docs/CODE_STANDARDS.md`

### 2. Agents to Consult
- `.ai/agents/code-reviewer.md` - Security & Performance
- `.ai/agents/database-admin.md` - Data architecture
- `.ai/agents/ui-ux-designer.md` - User experience
- `.ai/agents/tester.md` - Testing strategy

## 📐 Framework: Tri-Layer Analysis

Phân tích Apex-OS theo **3 lớp song song** từ Master Plan:

### Layer 1: [Business]
**Focus**: Chiến lược, mô hình kinh doanh, thị trường, sản phẩm, tài chính, vận hành

**Tasks**:
1. ✅ Xác định **stage hiện tại** của Apex-OS:
   - [ ] Zero → Problem-Solution Fit
   - [ ] PMF → Product-Market Fit
   - [ ] Scale → Scaling
   - [ ] Pre-IPO/IPO

2. ✅ Ánh xạ **features hiện tại** vào business model:
   - Trading Engine (core product)
   - Money Engine (monetization)
   - Rebate System (revenue model)
   - Multi-exchange Integration (market expansion)

3. ✅ Gap Analysis:
   - Features thiếu so với chuẩn fintech
   - Revenue streams chưa khai thác
   - Market segments chưa phục vụ

### Layer 2: [Agentic]
**Focus**: Vai trò của AI/Agent, quy trình auto, input/output của agent, KPI cho agent

**Tasks**:
1. ✅ Inventory **AI/Agent components**:
   - Guardian Agent (risk management)
   - Auditor Agent (reconciliation)
   - Signal Generator (ML/AI trading signals)
   - Agent orchestration patterns

2. ✅ Agentic KPIs:
   - Agent response time
   - Accuracy metrics
   - Automation percentage
   - Agent collaboration efficiency

3. ✅ Agentic Gaps:
   - Missing agent roles
   - Manual processes that should be automated
   - Agent coordination improvements

### Layer 3: [Governance/IPO]
**Focus**: Kiểm soát nội bộ, pháp lý, rủi ro, chuẩn IPO, board, audit, compliance

**Tasks**:
1. ✅ Security & Compliance Audit:
   - Authentication (currently: localStorage → MUST migrate to HttpOnly cookies)
   - Authorization (RLS policies)
   - Data encryption
   - Audit logging
   - Regulatory compliance (fintech regulations)

2. ✅ Risk Management:
   - Trading risk controls
   - Financial risk (wallet security, withdrawal limits)
   - Operational risk (uptime, disaster recovery)
   - Cybersecurity

3. ✅ IPO Readiness:
   - Code quality metrics
   - Test coverage (current: >90% ✅)
   - Documentation completeness
   - Governance structure

## 🏗️ Architecture Restructuring Plan

### Phase 1: Foundation Layer (Week 1-2)
**Objective**: Establish fintech-grade security & data architecture

#### 1.1 Security Hardening
```
Priority: P0 (CRITICAL)

Tasks:
- [ ] Migrate auth tokens from localStorage to HttpOnly cookies
- [ ] Implement API rate limiting (currently partial)
- [ ] Add request signing for sensitive operations
- [ ] Implement CSRF protection
- [ ] Add IP whitelisting for admin operations
- [ ] Setup WAF (Web Application Firewall)

Agents: code-reviewer, database-admin
```

#### 1.2 Database Architecture
```
Priority: P0 (CRITICAL)

Tasks:
- [ ] Review ALL RLS policies for completeness
- [ ] Add database connection pooling
- [ ] Implement query optimization monitoring
- [ ] Setup read replicas for analytics
- [ ] Add database backup automation
- [ ] Implement point-in-time recovery

Agents: database-admin
```

#### 1.3 Audit & Compliance
```
Priority: P0 (CRITICAL)

Tasks:
- [ ] Implement comprehensive audit logging
- [ ] Add user action tracking
- [ ] Setup log retention policy
- [ ] Create compliance dashboard
- [ ] Implement GDPR/data privacy controls

Agents: code-reviewer, database-admin
```

### Phase 2: Agentic Layer Enhancement (Week 3-4)
**Objective**: Optimize AI/Agent systems for automation

#### 2.1 Agent Orchestration
```
Priority: P1 (HIGH)

Tasks:
- [ ] Implement agent coordination framework
- [ ] Add agent performance monitoring
- [ ] Create agent fallback mechanisms
- [ ] Implement agent A/B testing
- [ ] Add agent versioning

Agents: All agents
```

#### 2.2 Automation Expansion
```
Priority: P1 (HIGH)

Tasks:
- [ ] Auto-reconciliation improvements
- [ ] Auto-risk assessment
- [ ] Auto-compliance checking
- [ ] Auto-report generation
- [ ] Auto-anomaly detection

Agents: All agents
```

### Phase 3: Business Layer Optimization (Week 5-6)
**Objective**: Enhance product-market fit & revenue

#### 3.1 Feature Enhancement
```
Priority: P1 (HIGH)

Tasks:
- [ ] Advanced order types (limit, stop-loss, OCO)
- [ ] Portfolio rebalancing automation
- [ ] Social trading features
- [ ] Copy trading
- [ ] Strategy marketplace

Agents: ui-ux-designer, code-reviewer
```

#### 3.2 Revenue Optimization
```
Priority: P1 (HIGH)

Tasks:
- [ ] Dynamic fee structure
- [ ] Premium tier features
- [ ] Institutional trading support
- [ ] API access monetization
- [ ] Data analytics products

Agents: ui-ux-designer
```

## 📊 Deliverables

### 1. Architecture Audit Report
**File**: `FINTECH_ARCHITECTURE_AUDIT.md`

**Contents**:
- Current state analysis (Tri-layer)
- Gap analysis per layer
- Priority matrix (P0/P1/P2)
- Risk assessment
- Compliance checklist

### 2. Restructuring Roadmap
**File**: `FINTECH_RESTRUCTURE_ROADMAP.md`

**Contents**:
- 6-week detailed plan
- Phase breakdown (Foundation, Agentic, Business)
- Resource allocation
- Dependencies & blockers
- Success metrics per phase

### 3. Implementation Tasks
**File**: `task.md` (update existing)

**Contents**:
- Actionable checklist grouped by phase
- Agent assignments
- Estimated effort
- Progress tracking

### 4. Compliance Matrix
**File**: `FINTECH_COMPLIANCE_MATRIX.md`

**Contents**:
- Regulatory requirements (VN/SEA)
- Current compliance status
- Gaps & remediation plan
- IPO readiness score

## 🎬 Execution Instructions for Gemini CLI

### Step 1: Initial Analysis (30 min)
```bash
# Read master plan
cat docs/00_MASTER-Agentic-BizPlan-OS.json

# Read project context
cat .gemini/DAILY_UPDATE.md

# Scan codebase
find src backend -type f -name "*.ts" -o -name "*.py" | head -50
```

### Step 2: Tri-Layer Mapping (1 hour)
```markdown
Create: FINTECH_ARCHITECTURE_AUDIT.md

For each layer (Business, Agentic, Governance):
1. List current state
2. Map to master plan sections
3. Identify gaps
4. Assign priority (P0/P1/P2)
```

### Step 3: Roadmap Creation (1 hour)
```markdown
Create: FINTECH_RESTRUCTURE_ROADMAP.md

For each phase (Foundation, Agentic, Business):
1. Define objectives
2. Break down into tasks
3. Estimate effort (hours/days)
4. Identify dependencies
5. Set success metrics
```

### Step 4: Task Breakdown (30 min)
```markdown
Update: task.md

Add new phases:
## Phase 9: Fintech Foundation
## Phase 10: Agentic Enhancement
## Phase 11: Business Optimization

Mark tasks by agent:
- [code-reviewer] Security hardening
- [database-admin] RLS policy audit
- [tester] Integration test suite
```

### Step 5: Compliance Check (30 min)
```markdown
Create: FINTECH_COMPLIANCE_MATRIX.md

Include:
- VN fintech regulations
- SEA fintech standards
- Data privacy (GDPR/PDPA)
- Security standards (ISO 27001, SOC 2)
- IPO readiness criteria
```

## 🔍 Quality Gates

Before considering the restructuring complete, ensure:

- [ ] **Security**: All P0 security issues addressed
- [ ] **Testing**: >95% coverage for critical paths
- [ ] **Documentation**: All new architecture documented
- [ ] **Compliance**: All regulatory gaps identified with remediation plan
- [ ] **Performance**: No regressions, improvements measured
- [ ] **Agents**: All agent roles clearly defined and implemented

## 💬 Output Format

Use conventional commit format for all changes:
```
feat(fintech): implement [feature]
fix(security): resolve [vulnerability]
docs(compliance): add [regulation] documentation
refactor(architecture): restructure [component]
```

## 🎯 Success Criteria

The restructuring is successful when:

1. **Tri-Layer Complete**: All 3 layers analyzed, mapped, and gaps identified
2. **Roadmap Clear**: 6-week plan with actionable tasks
3. **Compliance Ready**: Compliance matrix shows path to 100%
4. **IPO-Ready Architecture**: Code/docs meet IPO standards
5. **Agentic Maturity**: Agent KPIs defined and tracked

---

**Start the task by confirming you have read:**
1. Master Agentic Business Plan JSON (docs/00_MASTER-Agentic-BizPlan-OS.json) ✅
2. DAILY_UPDATE.md ✅
3. All 6 agents in `.ai/agents/` ✅

Then proceed with Step 1: Initial Analysis.
