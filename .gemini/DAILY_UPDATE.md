# DAILY_UPDATE.md

**Last Updated**: 2025-11-26

## 🏗️ Project Architecture

ApexOS is a **Next.js 16 trading platform** with dual LLM support (Claude + Gemini).

### Tech Stack
- **Frontend**: React 19 + Next.js 16 (App Router) + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + RLS) + Node.js + WebSocket
- **State**: Zustand
- **Testing**: Vitest (>90% coverage)
- **Auth**: Supabase Auth + JWT
- **Deployment**: Vercel (frontend) + Render (backend)

## 📂 Directory Structure

```
apex-os/
├── .ai/                    # SHARED agents & skills (Claude + Gemini)
│   ├── agents/            # 6 specialized AI agents
│   ├── skills/            # Best practices library
│   └── workflows/         # Development workflows
├── .claude/               # Claude-specific config
│   └── CLAUDE.md
├── .gemini/               # Gemini-specific config
│   ├── GEMINI.md          # READ THIS FIRST!
│   └── antigravity/       # Artifacts
├── src/                   # Next.js frontend
├── backend/               # Node.js + Python backend
└── docs/                  # Documentation
```

## 🤖 How to Use Agents

**IMPORTANT**: Before working on any task, consult the appropriate agent in `.ai/agents/`:

### Available Agents

1. **code-reviewer.md** - For code review, security audit, performance check
2. **tester.md** - For writing tests (unit, integration, E2E)
3. **debugger.md** - For fixing bugs, performance issues
4. **ui-ux-designer.md** - For UI components, A11y, modern design
5. **database-admin.md** - For schema, RLS policies, SQL optimization
6. **git-manager.md** - For version control, commits, branching

### Example Workflow

```
User Request: "Add Google OAuth login"

Step 1: Read `.gemini/GEMINI.md` for project context
Step 2: Consult `.ai/agents/code-reviewer.md` for security checklist
Step 3: Consult `.ai/skills/nextjs-best-practices.md` for implementation patterns
Step 4: Implement feature
Step 5: Consult `.ai/agents/tester.md` for test strategy
Step 6: Write tests
Step 7: Use conventional commit format (see below)
```

## 📚 Skills Library

Before implementing, check if there's a skill for it:

- **nextjs-best-practices.md**: App Router, Server/Client Components, Metadata API
- **typescript-patterns.md**: Type safety, discriminated unions, utility types

## 🔄 Daily Update Workflow

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Check for New Agents/Skills
```bash
ls -la .ai/agents/
ls -la .ai/skills/
```

### 3. Read Updated Documentation
- `.gemini/GEMINI.md` - Project overview
- `.ai/agents/` - Agent specializations
- `.ai/skills/` - Best practices

### 4. Work on Tasks
Follow the agent system workflow (see above).

### 5. Commit with Conventional Format
**CRITICAL**: All commits MUST follow this format:

```
type(scope): subject

body (optional)

footer (optional)
```

#### Valid Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

#### Examples
```bash
# ✅ CORRECT
git commit -m "feat(auth): add Google OAuth login"
git commit -m "fix(api): prevent race condition in withdrawal"
git commit -m "docs(readme): update installation steps"
git commit -m "perf(db): optimize N+1 query in TradingService"

# ❌ WRONG (will be REJECTED by pre-commit hook)
git commit -m "fixed bug"
git commit -m "WIP"
git commit -m "Update code"
```

### 6. Push Changes
```bash
git push origin main
```

## 🎯 Development Rules

1. **Type Safety**: No `any` types unless justified
2. **RLS First**: All database operations MUST have RLS policies
3. **Test Coverage**: Maintain >80% coverage
4. **Conventional Commits**: Use `type(scope): message` format
5. **Documentation**: Update docs with code changes
6. **Consult Agents**: Read relevant agent files before implementing

## 🚀 Quick Reference

### Run Tests
```bash
npm test
```

### Start Dev Server
```bash
npm run dev
```

### Check Commit Message (before committing)
```bash
echo "feat(auth): add login" | npx commitlint
```

### Semantic Release (dry-run)
```bash
npm run semantic-release -- --dry-run
```

## 🔍 Where to Find Information

| Topic | Location |
|-------|----------|
| Project Overview | `.gemini/GEMINI.md` |
| Code Review Checklist | `.ai/agents/code-reviewer.md` |
| Testing Strategy | `.ai/agents/tester.md` |
| Next.js Patterns | `.ai/skills/nextjs-best-practices.md` |
| TypeScript Patterns | `.ai/skills/typescript-patterns.md` |
| API Documentation | `API_DOCUMENTATION.md` |
| Money Engine | `docs/MONEY_ENGINE.md` |

## 📝 Daily Checklist

- [ ] Pull latest changes (`git pull`)
- [ ] Read `.gemini/GEMINI.md` for project context
- [ ] Check `.ai/agents/` for relevant agent
- [ ] Check `.ai/skills/` for best practices
- [ ] Implement feature following agent guidelines
- [ ] Write tests (consult `.ai/agents/tester.md`)
- [ ] Use conventional commit format
- [ ] Push changes

## ⚠️ Breaking Changes (Since 2025-11-26)

1. **Conventional Commits Required**: All commits must follow `type(scope): message` format
2. **Pre-Commit Hooks Active**: Invalid commits will be REJECTED
3. **Semantic Release**: Versions are auto-generated based on commit messages

## 🆘 Common Issues

### Commit Rejected
**Error**: `⧗   input: invalid commit message format`

**Solution**: Use conventional commit format:
```bash
git commit -m "feat(feature-name): description"
```

### Agent Not Found
**Error**: Can't find agent documentation

**Solution**: Check `.ai/agents/` directory:
```bash
ls -la .ai/agents/
```

### Skill Not Found
**Error**: Can't find skill documentation

**Solution**: Check `.ai/skills/` directory:
```bash
ls -la .ai/skills/
```

---

**Remember**: Always consult the agent system before implementing. This ensures consistency and best practices across the codebase! 🚀
