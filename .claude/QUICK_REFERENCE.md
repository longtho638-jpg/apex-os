# Quick Reference Card - Apex-OS with Claude & Gemini

## 🚀 Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local

# 3. Add API keys
# Get from: https://openrouter.ai (Claude)
# Or: https://ai.google.dev (Gemini)
OPENROUTER_API_KEY=sk_live_...
GOOGLE_API_KEY=...

# 4. Start server
npm run dev

# 5. Test
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hi","mode":"chat"}'
```

---

## 📋 Commands at a Glance

| Command | Use For | Model | Time |
|---------|---------|-------|------|
| `/plan` | Architecture | Claude | 30min |
| `/code` | Generate code | Claude | 1-2h |
| `/test` | Write tests | Claude | 1-2h |
| `/review` | Code quality | Claude | 30min |
| `/debug` | Fix bugs | Claude | 1h |
| `/cook` | Full workflow | Claude | 4-5h |
| `/docs` | Documentation | Gemini | 30min |
| `/ask` | Quick answer | Gemini | 5min |

---

## 💻 API Usage

### Chat Mode
```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain React hooks",
    "mode": "chat"
  }'
```

### Code Generation
```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create login component",
    "mode": "code",
    "model": "anthropic/claude-3.5-sonnet"
  }'
```

### Streaming Response
```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Count to 5",
    "mode": "stream"
  }'
```

---

## 🤖 Models Quick Comparison

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
✅ Cost Efficiency: Excellent
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.claude/agents/*.md` | Agent specifications |
| `.claude/commands/*.md` | Command definitions |
| `.claude/skills/` | Knowledge bases |
| `docs/CODE_STANDARDS.md` | Development standards |
| `.claude/DEEP_INTEGRATION_PLAN.md` | Roadmap |
| `.claude/USAGE_GUIDE_CLAUDE_GEMINI.md` | Detailed guide |

---

## ⚙️ Configuration

### .env.local
```bash
# Claude via OpenRouter
OPENROUTER_API_KEY=sk_live_xxx

# Gemini via Google
GOOGLE_API_KEY=xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Default model (claude or gemini)
NEXT_PUBLIC_DEFAULT_MODEL=claude
```

---

## 🎯 Workflows

### Plan Feature
```bash
/plan "Add OAuth authentication"
→ plans/YYMMDD-oauth-plan.md
```

### Generate Component
```bash
/code "Create LoginForm with validation"
→ src/components/LoginForm.tsx
```

### Generate Tests
```bash
/test "LoginForm"
→ src/components/LoginForm.test.tsx (>80% coverage)
```

### Code Review
```bash
/review "LoginForm.tsx"
→ plans/reports/YYMMDD-review-report.md
```

### Full Feature
```bash
/cook "Build user dashboard"
→ Complete feature (plan → code → tests → review → docs)
```

---

## ✅ Code Standards Summary

### TypeScript
- ✅ Strict mode always
- ✅ No `any` types
- ✅ Proper interfaces
- ✅ Type everything

### Components
- ✅ Functional only
- ✅ Props interface
- ✅ JSDoc comments
- ✅ Error handling

### API Routes
- ✅ Status codes correct
- ✅ Input validation (Zod)
- ✅ Error handling
- ✅ Proper types

### Testing
- ✅ >80% coverage
- ✅ Unit tests
- ✅ Component tests
- ✅ Error cases

### Security
- ✅ Input validated
- ✅ No secrets exposed
- ✅ Auth checks
- ✅ Rate limiting

---

## 🔥 Common Tasks

### Build Login Component
```bash
# 1. Plan
/plan "User authentication" "Email/password, OAuth"

# 2. Code
/code "LoginForm" "Validation, error handling"

# 3. Test
/test "LoginForm"

# 4. Review
/review "components/LoginForm.tsx"

# 5. Done ✅
```

### Fix Bug
```bash
/debug "OAuth redirect not working"
→ Analysis + fix + test
```

### Create API
```bash
/code "POST /api/users" "Create user with validation"
→ Complete API route ready
```

### Write Docs
```bash
/docs "LoginForm component"
→ API docs + examples + setup
```

---

## 📊 Cost Estimation

### Per Feature (5K tokens)

| Task | Claude Cost | Gemini Cost | Saving |
|------|-------------|------------|--------|
| Plan | $0.025 | $0.003 | 88% |
| Code | $0.050 | - | - |
| Test | $0.050 | - | - |
| Docs | - | $0.010 | 90% |
| **Total** | **$0.125** | **$0.013** | **90%** |

### Smart Strategy
1. Claude for code/architecture (essential)
2. Gemini for docs/research (cost savings)
3. **Total feature**: $0.050 (Claude) + $0.010 (Gemini) = $0.060

---

## 🚨 Troubleshooting

| Issue | Fix |
|-------|-----|
| API Key error | Check .env.local, restart server |
| Model not found | Verify OpenRouter/Google account |
| Rate limit | Use Gemini for some tasks, implement backoff |
| No response | Check internet, API status |
| Type errors | Review CODE_STANDARDS.md section 4 |

---

## 📚 Documentation

```
Quick Questions?
→ .claude/USAGE_GUIDE_CLAUDE_GEMINI.md

Code Standards?
→ docs/CODE_STANDARDS.md

Agent Details?
→ .claude/agents/[agent].md

Implementation Plan?
→ .claude/DEEP_INTEGRATION_PLAN.md

API Reference?
→ src/lib/claude.ts
```

---

## 🎓 Learning Path

1. **Setup** (5 min) - Configure .env.local
2. **Test** (5 min) - Run curl command
3. **Plan** (30 min) - Use /plan command
4. **Code** (1 hour) - Generate component
5. **Test** (1 hour) - Generate tests
6. **Review** (30 min) - Get feedback
7. **Master** - Combine commands effectively

---

## 💡 Pro Tips

1. **Reference documentation** in prompts
   ```bash
   /code "Component" "Follow CODE_STANDARDS.md section 5"
   ```

2. **Use both models** strategically
   ```bash
   /plan "Feature"    # Claude (architecture)
   /code "Feature"    # Claude (quality)
   /docs "Feature"    # Gemini (fast, cheap)
   ```

3. **Iterate on feedback**
   ```bash
   /review → Fix → /test → /review (repeat until ✅)
   ```

4. **Chain commands**
   ```bash
   /plan → /code → /test → /review → /docs
   ```

5. **Save costs**
   ```bash
   Use Gemini for: Docs, research, QA, analysis
   Use Claude for: Code, architecture, complex logic
   ```

---

## 🚀 Next Steps

- [ ] Configure .env.local
- [ ] Test API endpoint
- [ ] Use `/plan` command
- [ ] Generate code with `/code`
- [ ] Create tests with `/test`
- [ ] Review code with `/review`
- [ ] Master `/cook` workflow

---

## 🔗 Resources

- **ClaudeKit**: https://github.com/claudekit/claudekit-docs
- **OpenRouter**: https://openrouter.ai (Claude access)
- **Google AI**: https://ai.google.dev (Gemini access)
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev

---

**Last Updated**: Nov 24, 2025  
**Version**: 1.0.0  
**Status**: Ready to use ✅
