# CLAUDE.md

This file provides guidance to Claude Code when working with ApexOS.

## Shared Resources

All agents, skills, and workflows are in the `.ai/` directory and shared with Gemini.

**IMPORTANT**: Read agent files in `.ai/agents/` to understand specialized roles and delegate tasks accordingly.

## Agents

Use these agents based on task type:
- **code-reviewer.md**: Code review, security audit
- **tester.md**: Writing tests, maintaining coverage
- **debugger.md**: Bug fixing, performance profiling
- **ui-ux-designer.md**: UI components, design systems
- **database-admin.md**: Schema design, RLS policies, SQL optimization
- **git-manager.md**: Version control, commit messages, branching

## Skills Library

Refer to `.ai/skills/` for best practices:
- **nextjs-best-practices.md**: App Router, Server/Client Components
- **typescript-patterns.md**: Type safety, advanced patterns
- **supabase-rls.md**: Row Level Security patterns
- **testing-strategies.md**: Unit, integration, E2E testing

## Workflows

- **Feature Development**: `.ai/workflows/feature-development.md`
- **Bug Fixes**: `.ai/workflows/bug-fix.md`
- **Refactoring**: `.ai/workflows/refactoring.md`

## Project Context

**ApexOS** is a Next.js 16 (TypeScript) trading platform with:
- **Backend**: Supabase (PostgreSQL + RLS)
- **Frontend**: React 19 + Tailwind CSS v4
- **Testing**: Vitest (\u003e90% coverage)
- **State**: Zustand
- **Auth**: Supabase Auth + JWT

## Development Rules

1. **Type Safety**: No `any` types unless justified
2. **RLS First**: All database operations must have RLS policies
3. **Test Coverage**: Maintain \u003e80% coverage
4. **Conventional Commits**: Use `type(scope): message` format
5. **Documentation**: Update docs with code changes

**CRITICAL**: Before implementing, consult the appropriate agent in `.ai/agents/` for specialized guidance.
