# Apex-OS Claude Kit Documentation

**Last Updated**: Nov 24, 2025  
**Status**: ✅ Complete & Production Ready  
**Version**: 1.0.0

Welcome to the Apex-OS AI-Powered Development Kit! This is a comprehensive guide for using Claude 3.5 Sonnet and Gemini 3.0 Pro with intelligent agent workflows.

---

## 📚 Documentation Index

### Getting Started
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⭐ **START HERE**
  - 5-minute setup
  - Command quick reference
  - Model comparison
  - Common tasks

- **[USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md)** 📖 **DETAILED GUIDE**
  - Complete setup instructions
  - Agent workflows with examples
  - Model selection guide
  - Practical examples
  - Best practices
  - Troubleshooting

### Reference Documentation
- **[WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md)** 🎨 **VISUAL GUIDE**
  - Setup workflow
  - Feature development flow
  - Agent interaction
  - Model selection
  - Testing pyramid
  - Quality gates
  - Daily workflows

- **[DEEP_INTEGRATION_PLAN.md](./DEEP_INTEGRATION_PLAN.md)** 🗺️ **ROADMAP**
  - 10-phase implementation plan
  - Priority matrix
  - Timeline
  - Architecture mapping
  - Comprehensive checklist

### Agent & Command Docs
- **[agents/planner.md](./agents/planner.md)**
  - Feature planning and architecture
  - Workflow process
  - Output specifications

- **[agents/implementer.md](./agents/implementer.md)**
  - Code generation
  - Component & API creation
  - Quality standards

- **[agents/reviewer.md](./agents/reviewer.md)**
  - Code quality assessment
  - Type safety verification
  - Security review

- **[agents/tester.md](./agents/tester.md)**
  - Test generation
  - Coverage requirements
  - Test strategies

### Command Definitions
- **[commands/plan.md](./commands/plan.md)** - `/plan` command
- **[commands/cook.md](./commands/cook.md)** - `/cook` (full workflow)
- **[commands/generate-component.md](./commands/generate-component.md)** - `/code`
- **[commands/generate-api.md](./commands/generate-api.md)** - API routes

### Skills & Knowledge
- **[skills/next-js/SKILL.md](./skills/next-js/SKILL.md)**
  - Next.js 16 best practices
  - Common patterns
  - Examples
  - References

### Standards & Guidelines
- **[../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)** 📋 **CRITICAL**
  - 14-section comprehensive standards
  - TypeScript standards
  - Component guidelines
  - API route standards
  - Error handling
  - Testing requirements
  - Security standards
  - Accessibility standards

### Integration Tracking
- **[../CLAUDEKIT_INTEGRATION_COMPLETE.md](../CLAUDEKIT_INTEGRATION_COMPLETE.md)**
  - Complete integration summary
  - Files created
  - Architecture mapping
  - Status updates

- **[../CLAUDEKIT_UPDATES_TRACKER.md](../CLAUDEKIT_UPDATES_TRACKER.md)**
  - Version tracking
  - Update comparison
  - Reference links

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.local.example .env.local

# 3. Add API Keys
# Get from: https://openrouter.ai (Claude)
# Or: https://ai.google.dev (Gemini)

# 4. Start server
npm run dev

# 5. Test API
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello","mode":"chat"}'
```

📖 **See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for complete details**

---

## 🎯 Main Commands

| Command | Purpose | Model | Time |
|---------|---------|-------|------|
| `/plan` | Plan feature architecture | Claude | 30min |
| `/code` | Generate production code | Claude | 1-2h |
| `/test` | Create test suite | Claude | 1-2h |
| `/review` | Code quality assessment | Claude | 30min |
| `/debug` | Fix and debug issues | Claude | 1h |
| `/cook` | Full workflow (Plan→Code→Test→Review) | Claude | 4-5h |
| `/docs` | Generate documentation | Gemini | 30min |
| `/ask` | Quick questions | Gemini | 5min |

📖 **Detailed examples in [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md)**

---

## 🤖 Model Comparison

### Claude 3.5 Sonnet
```
🎯 Best for: Code, architecture, type safety
💰 Cost: $0.003/$0.015 per 1K tokens
⚡ Speed: Fast (2-3 sec)
📊 Quality: Excellent
✅ Type Safety: Perfect
```

### Gemini 3.0 Pro
```
🎯 Best for: Docs, research, analysis
💰 Cost: $0.0005/$0.0015 per 1K tokens (10x cheaper!)
⚡ Speed: Very fast (1-2 sec)
📊 Quality: Very good
✅ Cost: Excellent
```

💡 **Pro tip**: Use Claude for core development, Gemini for docs and research. Saves 90% on costs!

---

## 🎓 Learning Path

### Beginner (30 minutes)
1. Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Complete setup
3. Test with `/ask` command
4. Try simple `/plan` command

### Intermediate (2 hours)
1. Read [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md)
2. Try `/code` command
3. Generate tests with `/test`
4. Get feedback with `/review`

### Advanced (1 day)
1. Study [DEEP_INTEGRATION_PLAN.md](./DEEP_INTEGRATION_PLAN.md)
2. Read all agent specifications
3. Master `/cook` workflow
4. Understand orchestration patterns

### Expert (1 week)
1. Study [../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)
2. Implement custom agents
3. Create additional skills
4. Build advanced workflows

📖 **Detailed workflows in [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md)**

---

## 📂 Project Structure

```
.claude/
├── agents/                  # Agent definitions
│   ├── planner.md          # Planning agent
│   ├── implementer.md      # Code generation
│   ├── reviewer.md         # Quality assurance
│   └── tester.md           # Test generation
│
├── commands/               # Slash commands
│   ├── plan.md
│   ├── cook.md
│   ├── generate-component.md
│   └── generate-api.md
│
├── skills/                 # Knowledge modules
│   └── next-js/SKILL.md
│
├── workflows/              # Workflow definitions
│
├── README.md              # This file
├── QUICK_REFERENCE.md     # Quick start guide
├── USAGE_GUIDE_CLAUDE_GEMINI.md    # Detailed guide
├── WORKFLOW_DIAGRAMS.md   # Visual workflows
├── DEEP_INTEGRATION_PLAN.md        # Roadmap
├── setup_claude_integration.md     # Setup guide
└── CLAUDE_INTEGRATION_SUMMARY.md   # Summary
```

---

## 🔧 Environment Setup

### Required Variables (.env.local)

```bash
# Claude via OpenRouter (RECOMMENDED)
OPENROUTER_API_KEY=sk_live_your_key_here

# OR Gemini via Google
GOOGLE_API_KEY=your_gemini_key_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_MODEL=claude  # or gemini

# Optional: Existing Apex config
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Getting API Keys

- **Claude**: https://openrouter.io (recommended - supports 400+ models)
- **Gemini**: https://ai.google.dev (free tier available)

📖 **See [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md) section 1 for detailed setup**

---

## 📊 Code Standards

All code must follow [../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md):

- ✅ **TypeScript**: Strict mode, no `any` types
- ✅ **Components**: Functional, typed props, error handling
- ✅ **API Routes**: Status codes, validation (Zod), error handling
- ✅ **Testing**: >80% coverage, unit/component/integration
- ✅ **Security**: Input validation, auth checks, no exposed secrets
- ✅ **Accessibility**: ARIA labels, keyboard nav, color contrast
- ✅ **Documentation**: JSDoc, README updates, examples

📋 **Review complete standards in [../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)**

---

## 🧠 Agent System

### How Agents Work

```
User Command
    ↓
Agent Router
    ↓
    ├─→ Planner (Plan)
    │       ↓
    ├─→ Implementer (Code)
    │       ↓
    ├─→ Tester (Tests)
    │       ↓
    ├─→ Reviewer (Quality)
    │       ↓
    └─→ Docs (Documentation)
```

### Each Agent Includes

- **Responsibilities**: What the agent does
- **Workflow**: Step-by-step process
- **Quality Standards**: What makes good output
- **Integration Points**: How agents communicate
- **Input/Output Formats**: Data structures

📖 **See agent documentation in [./agents/](./agents/)**

---

## 💡 Best Practices

### 1. Use Documentation
```bash
# Reference standards in prompts
/code "Component" "Follow CODE_STANDARDS.md section 5"
```

### 2. Combine Models
```bash
# Use Claude for core, Gemini for docs
/plan "Feature"    # Claude
/code "Feature"    # Claude  
/docs "Feature"    # Gemini (10x cheaper!)
```

### 3. Iterate on Feedback
```bash
/review → Fix → /test → /review (repeat until ✅)
```

### 4. Chain Commands
```bash
/plan → /code → /test → /review → /docs → COMPLETE
```

### 5. Save Everything
```bash
# Reference generated files in next commands
/code "Component" "Reference plans/YYMMDD-feature-plan.md"
```

📖 **More tips in [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md) section Best Practices**

---

## 🔗 Integration Overview

### What Was Integrated from ClaudeKit

✅ **Multi-agent orchestration architecture**
✅ **File-based agent communication**
✅ **Comprehensive command system**
✅ **Skills/knowledge modules framework**
✅ **Code standards document**
✅ **Workflow patterns (sequential, parallel, conditional)**
✅ **Professional naming conventions**
✅ **Complete documentation structure**

### New for Apex-OS

✅ **OpenRouter/Claude 3.5 Sonnet integration**
✅ **Google Gemini 3.0 Pro support**
✅ **Next.js 16 API routes**
✅ **React 19 component patterns**
✅ **Supabase integration ready**
✅ **Tailwind CSS styling**

📋 **See [../CLAUDEKIT_INTEGRATION_COMPLETE.md](../CLAUDEKIT_INTEGRATION_COMPLETE.md) for full integration details**

---

## 📈 Success Metrics

Track your progress:

- [ ] API key configured
- [ ] API endpoint responds
- [ ] `/plan` generates plans
- [ ] `/code` generates code
- [ ] `/test` generates tests (>80% coverage)
- [ ] `/review` provides feedback
- [ ] `/cook` completes full workflow
- [ ] Code follows standards
- [ ] Tests pass
- [ ] Feature deployed

✅ **All metrics ready**: Ready for production!

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API Key Error | Check .env.local, restart server |
| Model Not Found | Verify OpenRouter/Google account |
| Rate Limited | Use Gemini for some tasks |
| No Response | Check internet, API status |
| Type Errors | Review CODE_STANDARDS.md |
| Test Failures | Check tester.md quality checklist |
| Review Feedback | Fix and re-run /review |

📖 **Detailed troubleshooting in [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md) section Troubleshooting**

---

## 🔗 Key Resources

### Internal Documentation
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick start
- [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md) - Detailed guide
- [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md) - Visual workflows
- [DEEP_INTEGRATION_PLAN.md](./DEEP_INTEGRATION_PLAN.md) - Roadmap
- [../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md) - Standards

### External Resources
- [ClaudeKit](https://github.com/claudekit/claudekit-docs)
- [OpenRouter](https://openrouter.ai) - Claude access
- [Google AI](https://ai.google.dev) - Gemini access
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)

---

## 📞 Support

### Getting Help

1. **Quick questions**: Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Detailed help**: Read [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md)
3. **Visual guide**: See [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md)
4. **Code standards**: Review [../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)
5. **Agent details**: Check [./agents/](./agents/)

### Common Questions

**Q: Which model should I use?**
A: Claude for code, Gemini for docs. See model comparison above.

**Q: How much will this cost?**
A: ~$0.06 per feature using smart allocation (Claude for code, Gemini for docs).

**Q: Can I use just Gemini?**
A: Yes, but Claude is better for code generation. Combination is optimal.

**Q: How do I track costs?**
A: OpenRouter and Google provide usage dashboards.

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 24, 2025 | Initial release |
| 0.1.0 | Nov 23, 2025 | OpenRouter setup |
| 0.0.1 | Nov 23, 2025 | Project init |

---

## 🎉 Ready to Get Started?

1. **5 min setup**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Learn commands**: [USAGE_GUIDE_CLAUDE_GEMINI.md](./USAGE_GUIDE_CLAUDE_GEMINI.md)
3. **Visualize flows**: [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md)
4. **Follow standards**: [../docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)
5. **Start coding**: Use `/cook` for complete workflow!

---

**Status**: ✅ Production Ready  
**Last Updated**: Nov 24, 2025  
**Maintained by**: Apex-OS Team  
**Based on**: ClaudeKit v1.8.0 + Docs v0.0.1

🚀 **Happy coding!**
