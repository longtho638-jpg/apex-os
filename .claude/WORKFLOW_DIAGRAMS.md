# Workflow Diagrams - Visual Guide

## 1. Setup Workflow

```
┌─────────────────────────────────────────────────────────┐
│                   INITIAL SETUP (5 min)                 │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  1. npm install                     │
        │     (Install dependencies)          │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  2. cp .env.local.example           │
        │     (Create environment config)     │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  3. Add API Keys                    │
        │     OPENROUTER_API_KEY (Claude)    │
        │     GOOGLE_API_KEY (Gemini)        │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  4. npm run dev                     │
        │     (Start development server)      │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  5. curl test                       │
        │     (Verify API working)            │
        └─────────────────────────────────────┘
                              │
                              ▼
                    ✅ READY TO USE ✅
```

---

## 2. Feature Development Workflow

```
                     ┌──────────────────┐
                     │  START: Feature  │
                     │  Requirement     │
                     └────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐        ┌──────────┐         ┌──────────┐
    │ /plan   │        │  /code   │         │ /cook    │
    │ (30min) │        │ (1-2h)   │         │ (4-5h)   │
    └────┬────┘        └────┬─────┘         └────┬─────┘
         │                  │                    │
    Plan File          Code Files          Full Feature
         │                  │                    │
         ▼                  ▼                    ▼
    ┌─────────────┐   ┌──────────────┐   ┌─────────────┐
    │ Architecture│   │ Components   │   │ Sequential: │
    │ Design      │   │ API Routes   │   │ Plan→Code→ │
    │ Steps       │   │ Utils        │   │ Test→Review │
    │ Risks       │   │              │   │             │
    └─────────────┘   └──────────────┘   └─────────────┘
         │                  │                    │
         └────────────────┬─────────────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │   /test      │
                    │  (1-2h)      │
                    └────┬─────────┘
                         │
                    Test Files
                    >80% coverage
                         │
                         ▼
                    ┌──────────────┐
                    │  /review     │
                    │  (30min)     │
                    └────┬─────────┘
                         │
                   Review Report
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ✅ APPROVED                    ❌ CHANGES NEEDED
         │                               │
         ▼                               ▼
    READY FOR                     FIX → TEST → REVIEW
    PRODUCTION                    (Loop until ✅)
         │
         ▼
    ┌──────────────┐
    │   /docs      │
    │  (30min)     │
    └────┬─────────┘
         │
    Documentation
    API Docs
    Examples
         │
         ▼
    ✅ FEATURE COMPLETE
```

---

## 3. Agent Interaction Flow

```
                    ┌──────────────────┐
                    │   User Command   │
                    │   (e.g., /cook)  │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
           ┌────────┐  ┌───────────┐  ┌────────┐
           │PLANNER │  │IMPLEMENTER│  │ TESTER │
           │ Agent  │  │  Agent    │  │ Agent  │
           └──┬─────┘  └────┬──────┘  └───┬────┘
              │             │             │
              ▼             ▼             ▼
         Architecture   Code Files   Test Files
         Plan          Components   Unit Tests
              │             │        Component
              │             │        Integration
              └─────┬───┬───┘        Tests
                    │   │
                    ▼   ▼
           ┌──────────────────────┐
           │   REVIEWER Agent     │
           │   (Code Quality)     │
           └──┬───────────────────┘
              │
              ├─── ✅ APPROVED ─────────────────┐
              │                                │
              └─── ❌ CHANGES ────────────────┐ │
                                            │ │
              ┌─ FIX ←──────────────────────┘ │
              │                                │
              ▼                                ▼
         ┌─────────┐                    ┌──────────┐
         │ Updated │                    │   DOCS   │
         │  Code   │                    │  Agent   │
         └────┬────┘                    └────┬─────┘
              │                             │
              ▼                             ▼
         ┌──────────┐              ┌─────────────────┐
         │   /test  │              │  Documentation  │
         │  (rerun) │              │  API Docs       │
         └────┬─────┘              │  Examples       │
              │                    └─────────────────┘
              ▼                             │
         (Loop back to REVIEWER)            ▼
              │                       ✅ COMPLETE
              │
         ✅ Tests Pass
              │
              ▼
         ✅ READY FOR PRODUCTION
```

---

## 4. Model Selection Flow

```
           ┌─────────────────────┐
           │  Task / Requirement │
           └──────────┬──────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌────────┐  ┌──────────┐  ┌──────────┐
    │ CODING │  │ RESEARCH │  │  DOCS    │
    │ LOGIC  │  │ ANALYSIS │  │ GEN      │
    └───┬────┘  └────┬─────┘  └────┬─────┘
        │            │            │
        ▼            ▼            ▼
    ┌──────────┐ ┌─────────┐  ┌─────────┐
    │ COMPLEX? │ │ UNKNOWN?│  │ QUICK?  │
    └──┬───┬──┘ └────┬────┘  └────┬────┘
       │   │         │           │
    YES NO │         │           │
       │ └─────┐     │           │
       │       │     │           │
       ▼       ▼     ▼           ▼
    CLAUDE GEMINI GEMINI     GEMINI
    3.5    3.0    3.0        3.0
    SONNET PRO   PRO         PRO
       │       │     │           │
       │       └─────┴───────────┤
       │                         │
       ▼                         ▼
    ┌─────────────────┐  ┌──────────────┐
    │  CLAUDE OUTPUT  │  │ GEMINI OUTPUT│
    │                 │  │              │
    │ ✅ Type Safe    │  │ ✅ Fast      │
    │ ✅ Structured   │  │ ✅ Cheap     │
    │ ✅ Complete     │  │ ✅ Good      │
    └────────┬────────┘  └──────┬───────┘
             │                  │
             └──────────┬───────┘
                        │
                        ▼
                  ✅ INTEGRATED
                  ✅ QUALITY
```

---

## 5. Testing Strategy Pyramid

```
                         /\
                        /  \
                       / E2E \
                      /TESTS  \
                     /  (10%)  \
                    /____________\
                   /              \
                  / INTEGRATION    \
                 /    TESTS        \
                / (20%)            \
               /____________________\
              /                      \
             / COMPONENT             \
            /  TESTS                 \
           / (30%)                   \
          /_____________________________\
         /                             \
        / UNIT TESTS                  \
       / (40%)                       \
      /_______________________________\
     
    Coverage Target: >80%
    
    ┌─────────────────────────────────────┐
    │         TEST COVERAGE CHECKLIST       │
    ├─────────────────────────────────────┤
    │ Unit Tests:       ✅ 100% coverage  │
    │ Component Tests:  ✅ 85%+ coverage  │
    │ Integration:      ✅ 70%+ coverage  │
    │ E2E:              ✅ Critical paths │
    └─────────────────────────────────────┘
```

---

## 6. Code Quality Gate

```
    ┌──────────────────────────────────┐
    │      CODE READY FOR REVIEW       │
    └────────────┬─────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ┌─────────────┐  ┌──────────────┐
    │ TypeScript  │  │   Linting    │
    │   Check     │  │   Check      │
    └──────┬──────┘  └──────┬───────┘
           │                │
           └────────┬───────┘
                    │
         ┌──────────▼──────────┐
         │  Type Safety OK?    │
         └──┬──────────┬───────┘
            │          │
         YES│          │NO
            │          ▼
            │      ❌ FAIL
            │
            ▼
    ┌─────────────────┐
    │ Test Coverage   │
    │   >80% ?        │
    └──┬──────────┬───┘
       │          │
    YES│          │NO
       │          ▼
       │      ❌ FAIL
       │
       ▼
    ┌─────────────────────┐
    │ Error Handling OK?  │
    │ All cases covered?  │
    └──┬──────────┬───────┘
       │          │
    YES│          │NO
       │          ▼
       │      ❌ FAIL
       │
       ▼
    ┌──────────────────┐
    │ Security Check   │
    │ No vulns?        │
    └──┬──────┬────────┘
       │      │
    YES│      │NO
       │      ▼
       │  ❌ FAIL
       │
       ▼
    ┌──────────────────┐
    │ Performance OK?  │
    │ No bottlenecks?  │
    └──┬──────┬────────┘
       │      │
    YES│      │NO
       │      ▼
       │  ❌ FAIL
       │
       ▼
    ┌──────────────────┐
    │  Docs Updated?   │
    └──┬──────┬────────┘
       │      │
    YES│      │NO
       │      ▼
       │  ❌ FAIL
       │
       ▼
    ✅ APPROVED
    ✅ READY TO MERGE
```

---

## 7. Cost Optimization Strategy

```
          ┌──────────────────────────┐
          │      NEW FEATURE         │
          │      REQUIREMENT         │
          └────────────┬─────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
    ┌────────────────┐    ┌────────────────┐
    │ ARCHITECTURE   │    │   QUICK TASK   │
    │ DECISION       │    │   (< 500 tok)  │
    └────────┬───────┘    └────────┬───────┘
             │                     │
             ▼                     ▼
         CLAUDE              GEMINI 3.0
         3.5                 PRO
         SONNET              
                             ⬇️ 10x cheaper
         💰 High cost        
                             
    ┌────────────────┐    ┌────────────────┐
    │  PLAN (30min)  │    │  ASK (5min)    │
    │  $0.025        │    │  $0.003        │
    └────────┬───────┘    └────────┬───────┘
             │                     │
    ┌────────▼──────────┐         │
    │  CODE (2 hours)   │         │
    │  $0.050           │         │
    └────────┬──────────┘         │
             │                     │
    ┌────────▼──────────┐         │
    │  TEST (2 hours)   │         │
    │  $0.050           │         │
    └────────┬──────────┘         │
             │                     │
    ┌────────▼──────────┐         │
    │ REVIEW (30min)    │         │
    │ $0.025            │         │
    └────────┬──────────┘         │
             │                     │
             └──────────┬──────────┘
                        │
    TOTAL CLAUDE: $0.150        TOTAL: $0.060
    (Core development)          (All services)
    
    ✅ Smart allocation
    ✅ Best quality where needed
    ✅ Cost optimization
```

---

## 8. Iterative Improvement Loop

```
                    ┌─────────────────┐
                    │   VERSION 1     │
                    │   Generated     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  REVIEW #1      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ✅ APPROVED         ⚠️ FEEDBACK         ❌ REJECT
        │                    │                    │
        │                    ▼                    │
        │            ┌────────────────┐           │
        │            │  IMPROVEMENTS  │           │
        │            └────────┬───────┘           │
        │                     │                   │
        │                     ▼                   │
        │            ┌────────────────┐           │
        │            │  VERSION 2     │           │
        │            │  Updated       │           │
        │            └────────┬───────┘           │
        │                     │                   │
        │                     ▼                   │
        │            ┌────────────────┐           │
        │            │  TEST AGAIN    │           │
        │            │  (Regression)  │           │
        │            └────────┬───────┘           │
        │                     │                   │
        │                     └───────────┐       │
        │                                 │       │
        │                                 ▼       │
        │                        ┌────────────────┤
        │                        │  REVIEW #2     │
        │                        └────────┬───────┘
        │                                 │
        │                     ┌───────────┴─────────┐
        │                     │                     │
        │                 ✅ APPROVED           ⚠️ MORE
        │                     │                FEEDBACK
        │                     │                     │
        │                     │                     │
        └─────────┬───────────┘                     │
                  │                                 │
                  └──────────────────────┬──────────┘
                                         │
                                    (Loop back)
                                         │
                                         ▼
                                    IMPROVE
                                    (Repeat until ✅)
                                         │
                                         ▼
                            ✅ FINAL APPROVAL
                                         │
                                         ▼
                           ✅ PRODUCTION READY
```

---

## 9. Daily Development Workflow

```
┌──────────────────────────────────────────────────────┐
│              MORNING STANDUP (5 min)                 │
│  Review: CODE_STANDARDS.md, agents, integration     │
└────────────────┬─────────────────────────────────────┘
                 │
    ┌────────────┴──────────────┐
    │                           │
    ▼                           ▼
┌─────────────┐        ┌──────────────────┐
│ FEATURE     │        │  BUG FIX TASK    │
│ REQUEST     │        │                  │
└────┬────────┘        └────┬─────────────┘
     │                      │
     ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Step 1: PLAN     │  │ Step 1: DEBUG    │
│ (with Claude)    │  │ (with Claude)    │
└────┬─────────────┘  └────┬─────────────┘
     │                     │
     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Step 2: CODE     │  │ Step 2: FIX      │
│ (with Claude)    │  │ (with Claude)    │
└────┬─────────────┘  └────┬─────────────┘
     │                     │
     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Step 3: TEST     │  │ Step 3: TEST     │
│ (with Claude)    │  │ (Regression)     │
└────┬─────────────┘  └────┬─────────────┘
     │                     │
     └──────────┬──────────┘
                │
                ▼
    ┌──────────────────────┐
    │ Step 4: REVIEW       │
    │ (with Claude)        │
    └──┬───────────────┬───┘
       │               │
    ✅│               │❌
    GOOD         MORE WORK
       │               │
       ▼               ▼
   COMMIT         FIX & RE-TEST
       │               │
       └───────┬───────┘
               │
               ▼
   ┌──────────────────────┐
   │ DOCUMENTATION        │
   │ (with Gemini, optional)
   └──┬───────────────────┘
      │
      ▼
   ✅ DONE FOR DAY
   
   → Commit
   → Push
   → Create PR
   → Ready for review
```

---

## 10. Success Path

```
                  🎯 GOAL: PRODUCTION-READY CODE
                              │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
    ┌────────┐            ┌──────────┐          ┌──────────┐
    │ PLAN   │            │ CODE     │          │ TEST     │
    │ ✅     │            │ ✅       │          │ ✅       │
    │ 30 min │            │ 2 hours  │          │ 2 hours  │
    └───┬────┘            └────┬─────┘          └────┬─────┘
        │                      │                     │
        └──────────┬───────────┴─────────┬───────────┘
                   │                     │
                   ▼                     ▼
        ┌────────────────────────────────────────┐
        │         CODE REVIEW                    │
        │         ✅ Type Safety                 │
        │         ✅ Error Handling              │
        │         ✅ Performance                 │
        │         ✅ Security                    │
        │         ✅ Accessibility               │
        │         ✅ Documentation               │
        │         ✅ Tests >80%                  │
        └────────────┬─────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
      ✅ APPROVED          ❌ CHANGES
          │                     │
          ▼                     │
    ┌──────────────┐           │
    │ MERGE CODE   │           │
    │              │           │
    │ ✅ Clean    │           │
    │ ✅ Quality  │           │
    │ ✅ Tested   │           │
    └───────┬──────┘           │
            │                  │
            └────────┬─────────┘
                     │
                     ▼
    ┌───────────────────────────┐
    │  PRODUCTION DEPLOYMENT    │
    │  ✅ Ready to ship         │
    │  ✅ Fully documented      │
    │  ✅ Fully tested          │
    │  ✅ Quality assured       │
    └──────────────┬────────────┘
                   │
                   ▼
            🎉 SUCCESS 🎉
       CODE LIVE IN PRODUCTION
```

---

## 11. AI/ML Trading Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA PIPELINE (Python)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌──────────────┐      ┌────────────────┐      ┌───────────────┐
│ Market Data  │─────▶│ DataProcessor  │─────▶│ Normalized    │
│ (CCXT/Live)  │      │ (MinMax Scale) │      │ Sequences     │
└──────────────┘      └────────────────┘      └───────┬───────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────┼───────┐
│                   MODEL TRAINING                    │       │
│               (backend/ml/train.py)                 │       │
└──────────────────────────────┬──────────────────────┼───────┘
                               │                      │
                               ▼                      ▼
┌──────────────┐      ┌────────────────┐      ┌───────────────┐
│ PyTorch LSTM │◀─────│ Training Loop  │      │ ModelRegistry │
│ Architecture │      │ (Adam/BCE)     │─────▶│ (Save .pth)   │
└──────────────┘      └────────────────┘      └───────┬───────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────┼───────┐
│                   LIVE INFERENCE                    │       │
│              (backend/agents/trader.py)             │       │
└──────────────────────────────┬──────────────────────┼───────┘
                               │                      │
                               ▼                      ▼
┌──────────────┐      ┌────────────────┐      ┌───────────────┐
│ Live Candles │─────▶│ MLStrategy     │◀─────│ Load Model    │
│ (1m OHLCV)   │      │ (Inference)    │      │ (Latest Ver)  │
└──────────────┘      └───────┬────────┘      └───────────────┘
                              │
                              ▼
                      ┌────────────────┐
                      │ Trade Signal   │
                      │ (Buy/Sell/Hold)│
                      └───────┬────────┘
                              │
                              ▼
                      ┌────────────────┐
                      │ Redis Pub/Sub  │
                      │ (trade_signals)│
                      └───────┬────────┘
                              │
                              ▼
                      ┌────────────────┐
                      │ Execution Core │
                      │ (Node.js)      │
                      └────────────────┘
```

---

**Last Updated**: Nov 24, 2025  
**Version**: 1.0.0  
**Framework**: Apex-OS with ClaudeKit Integration
