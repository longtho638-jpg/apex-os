# Usage Guide: Claude + Gemini 3.0 Pro Integration

**Date**: Nov 24, 2025  
**Status**: 🚀 Ready for Use  
**Models**: Claude 3.5 Sonnet + Gemini 3.0 Pro (Flash)  
**Framework**: Apex-OS with ClaudeKit Integration

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Model Selection](#model-selection)
3. [Agent Workflows](#agent-workflows)
4. [Practical Examples](#practical-examples)
5. [Command Reference](#command-reference)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Quick Start

### 1. Environment Setup

```bash
# Navigate to project
cd /Users/macbookprom1/apex-os

# Verify dependencies
npm list openai typescript

# Create .env.local from template
cp .env.local.example .env.local
```

### 2. Configure API Keys

**Option A: Claude (Recommended for code)**
```bash
# Get key from: https://openrouter.ai
# Edit .env.local
OPENROUTER_API_KEY=sk_live_your_key_here
CLAUDE_MODEL=anthropic/claude-3.5-sonnet
```

**Option B: Gemini 3.0 Pro (Cost-effective)**
```bash
# Get key from: https://ai.google.dev
# Add to .env.local
GOOGLE_API_KEY=your_gemini_key_here
GEMINI_MODEL=google/gemini-3.0-pro
```

**Option C: Both (Recommended)**
```bash
OPENROUTER_API_KEY=sk_live_...
GOOGLE_API_KEY=your_gemini_key_here
NEXT_PUBLIC_DEFAULT_MODEL=claude  # or gemini
```

### 3. Test Connection

```bash
# Start development server
npm run dev

# In another terminal, test API
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2?",
    "mode": "chat",
    "model": "anthropic/claude-3.5-sonnet"
  }'

# Response:
# {"response":"2 + 2 = 4"}
```

---

## Model Selection

### Claude 3.5 Sonnet (Recommended for Code)

**Best for**:
- Code generation
- Complex problem solving
- Long context
- Type safety verification
- Test generation

**Characteristics**:
```
Model: anthropic/claude-3.5-sonnet
Cost: $0.003 per 1K input, $0.015 per 1K output
Speed: Fast
Quality: Excellent
Context: 200K tokens
```

**Use cases**:
```typescript
// ✅ Use Claude for:
- /plan "Architecture planning"
- /code "Component generation"
- /test "Test suite creation"
- /review "Code review"
- /cook "Full workflows"
```

### Gemini 3.0 Pro (Cost-Effective Alternative)

**Best for**:
- Research and analysis
- Documentation
- General conversation
- Cost-sensitive tasks

**Characteristics**:
```
Model: google/gemini-3.0-pro
Cost: $0.0005 per 1K input, $0.0015 per 1K output
Speed: Very fast
Quality: Very good
Context: 200K tokens
```

**Use cases**:
```typescript
// ✅ Use Gemini for:
- /ask "Questions and advice"
- /docs "Documentation generation"
- /research "Research tasks"
- /brainstorm "Ideation"
```

### Model Comparison

| Feature | Claude 3.5 | Gemini 3.0 |
|---------|-----------|-----------|
| Code Generation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Type Safety | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Long Context | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Cost | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Testing | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Research | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Accuracy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Agent Workflows

### Workflow 1: Plan Feature (Planner Agent)

**Goal**: Design feature architecture

**Command**:
```bash
/plan "Add user authentication with OAuth"
```

**Agent Process**:
```
1. Read requirement
   Input: "Add user authentication with OAuth"

2. Analyze context
   - Review existing auth patterns
   - Check Supabase capabilities
   - Study project structure

3. Design architecture
   - Component structure
   - API endpoints needed
   - Database schema
   - Flow diagram

4. Create plan
   - Implementation steps
   - Dependencies
   - Risk assessment
   - Timeline
```

**Output**:
```markdown
# Implementation Plan: OAuth Authentication

## Architecture
[ASCII Diagram]

## Components Needed
- OAuthProvider (component)
- useAuth (hook)
- /api/auth/oauth (route)
- AuthSession (database)

## Implementation Steps
1. Setup OAuth provider (2h)
2. Create auth components (4h)
3. Build API routes (3h)
4. Add tests (2h)
5. Document (1h)

## Risk Assessment
- Risk: Third-party API downtime
  Mitigation: Implement fallback login

## Success Criteria
- Users can login with OAuth
- Session persists
- Error handling complete
- Tests pass
```

**Model Recommendation**: **Claude 3.5 Sonnet**
- Better at understanding complex requirements
- Excellent architecture decisions
- Strong TypeScript patterns

---

### Workflow 2: Generate Code (Implementer Agent)

**Goal**: Create production-ready code from plan

**Command**:
```bash
/code "Create login form component with validation"
```

**Agent Process**:
```
1. Read requirement
   Input: "Create login form with validation"

2. Review standards
   - Check CODE_STANDARDS.md
   - Review component patterns
   - Study error handling

3. Generate code
   - TypeScript component
   - Form validation (Zod)
   - Error handling
   - Accessibility

4. Add quality
   - JSDoc comments
   - Test IDs
   - PropTypes
   - Error boundaries
```

**Example Output**:

```typescript
/**
 * LoginForm - Secure user authentication form
 * Supports email/password and OAuth
 * @example
 * <LoginForm onSuccess={handleLoginSuccess} />
 */
interface LoginFormProps {
  /** Callback on successful login */
  onSuccess: (user: User) => void;
  /** Optional redirect URL after login */
  redirectTo?: string;
  /** Show OAuth options */
  showOAuth?: boolean;
}

export function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
  showOAuth = true,
}: LoginFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation schema
  const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be 8+ chars'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      const data = schema.parse({ email, password });

      // Login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      onSuccess(user);

      // Redirect
      window.location.href = redirectTo;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-4"
      data-testid={testIds.root}
    >
      {error && (
        <div
          className="p-3 bg-red-100 text-red-700 rounded"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          data-testid={testIds.emailInput}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          data-testid={testIds.passwordInput}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        data-testid={testIds.submitBtn}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {showOAuth && (
        <div className="pt-4 border-t">
          <button
            type="button"
            className="w-full py-2 bg-white border rounded"
            onClick={() => handleOAuthLogin('google')}
          >
            Login with Google
          </button>
        </div>
      )}
    </form>
  );
}

// Export test IDs
export const testIds = {
  root: 'login-form-root',
  emailInput: 'login-form-email-input',
  passwordInput: 'login-form-password-input',
  submitBtn: 'login-form-submit-btn',
};
```

**Model Recommendation**: **Claude 3.5 Sonnet**
- Superior code generation quality
- Better TypeScript type safety
- Stronger error handling patterns

---

### Workflow 3: Generate Tests (Tester Agent)

**Goal**: Create comprehensive test suite

**Command**:
```bash
/test "LoginForm component"
```

**Agent Process**:
```
1. Analyze component
   - Props and types
   - User interactions
   - Error cases
   - Edge cases

2. Plan test strategy
   - Unit tests (functions)
   - Component tests (rendering)
   - Integration tests (API)
   - E2E tests (user flow)

3. Generate tests
   - Test file with Vitest
   - Assertions
   - Mocks
   - Edge cases

4. Verify coverage
   - Check coverage >80%
   - Ensure critical paths
   - Test error scenarios
```

**Example Test Output**:

```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, describe, it, beforeEach, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    mockOnSuccess.mockClear();
  });

  describe('Rendering', () => {
    it('renders email and password inputs', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(
        screen.getByLabelText('Email')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Password')
      ).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);
      expect(
        screen.getByRole('button', { name: /login/i })
      ).toBeInTheDocument();
    });

    it('renders OAuth button when enabled', () => {
      render(<LoginForm onSuccess={mockOnSuccess} showOAuth />);
      expect(
        screen.getByRole('button', { name: /google/i })
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '1', email: 'test@example.com' }),
        })
      );

      render(<LoginForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /login/i })
      );

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows error message on failed login', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: false })
      );

      render(<LoginForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /login/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText('Login failed')
        ).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid-email' },
      });

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /login/i })
      );

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('validates password length', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'short' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /login/i })
      );

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('disables button while loading', async () => {
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({}),
                }),
              100
            )
          )
      );

      render(<LoginForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      const button = screen.getByRole('button', { name: /login/i });

      fireEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Password')
      ).toBeInTheDocument();
    });

    it('displays error with role alert', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: false })
      );

      render(<LoginForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /login/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});
```

**Model Recommendation**: **Claude 3.5 Sonnet**
- Better at comprehensive test coverage
- Stronger edge case identification
- Superior error scenario testing

---

### Workflow 4: Code Review (Reviewer Agent)

**Goal**: Assess code quality

**Command**:
```bash
/review "LoginForm.tsx"
```

**Agent Process**:
```
1. Read code
2. Check quality
   - TypeScript compliance
   - Error handling
   - Performance
   - Security

3. Review standards
   - Against CODE_STANDARDS.md
   - Design patterns
   - Best practices

4. Generate report
   - Critical issues
   - Improvements
   - Approval/changes
```

**Example Review Report**:

```markdown
# Code Review: LoginForm.tsx

**From**: Reviewer  
**Status**: ✅ Approved with Suggestions  
**Quality**: ⭐⭐⭐⭐⭐ (5/5)

## Summary
Excellent component implementation with proper TypeScript, comprehensive error handling, and good accessibility practices.

## Strengths
✅ **Type Safety**: Full TypeScript coverage, no `any` types
✅ **Error Handling**: Try-catch wrapping, user-facing messages
✅ **Accessibility**: ARIA labels, form associations, role attributes
✅ **Testing Ready**: Test IDs exported, mock-friendly structure
✅ **Code Style**: Clean, readable, follows conventions

## High Priority
None - code is production-ready

## Medium Priority
1. **Consider debouncing email validation**
   - Current: Validates on every change
   - Suggestion: Debounce email check to reduce API calls
   ```typescript
   const debouncedEmailCheck = useCallback(
     debounce((email: string) => {
       checkEmailExists(email);
     }, 500),
     []
   );
   ```

2. **Add loading skeleton while checking OAuth**
   - Improves UX during OAuth redirect

## Low Priority
1. Extract error messages to constants
2. Add JSDoc for custom hooks

## Recommendations
- Approved for merge
- Consider debouncing suggestion for next iteration
- Ready for testing phase

## Test Coverage
Expected: >85% coverage achievable
- ✅ Happy path
- ✅ Error scenarios
- ✅ Validation cases
- ✅ Loading states
- ✅ Accessibility

---

**Approval**: ✅ **APPROVED**
**Confidence**: 95%
**Ready for**: Production deployment
```

**Model Recommendation**: **Claude 3.5 Sonnet**
- Better architectural analysis
- Stronger security assessment
- More comprehensive feedback

---

### Workflow 5: Full Workflow (Cook Command)

**Goal**: Complete feature from planning to documentation

**Command**:
```bash
/cook "Build user authentication with OAuth"
```

**Execution Timeline**:

```
1. PLAN (Planner Agent) - 30 min
   ├─ Analyze requirements
   ├─ Design architecture
   └─ Create implementation plan
   
   📄 Output: plans/YYMMDD-oauth-plan.md

2. IMPLEMENT (Implementer Agent) - 2 hours
   ├─ Generate components
   ├─ Create API routes
   └─ Add error handling
   
   📝 Output: src/components/OAuth/*
              src/app/api/auth/*

3. TEST (Tester Agent) - 1.5 hours
   ├─ Unit tests
   ├─ Component tests
   └─ Integration tests
   
   ✅ Output: src/**/*.test.tsx
              >80% coverage

4. REVIEW (Reviewer Agent) - 30 min
   ├─ Code quality check
   ├─ Type safety verification
   └─ Security review
   
   📋 Output: plans/reports/YYMMDD-review-report.md

5. DOCUMENTATION (Future) - 30 min
   ├─ API documentation
   ├─ Component stories
   └─ Setup guide
   
   📚 Output: Updated README, docs/

TOTAL TIME: ~4.5 hours
STATUS: Complete feature ready for production
```

**Model Usage**: 
- **Claude** for Plan → Code → Test (core logic)
- **Gemini** for Review → Docs (faster processing)

---

## Practical Examples

### Example 1: Build Dashboard Component

**Command**:
```bash
/cook "Build responsive dashboard with charts and real-time data"
```

**Steps**:

**Step 1: Plan**
```bash
Claude Model: Plan architecture

Output:
- Dashboard layout (3-column responsive)
- Chart components needed
- Real-time data strategy
- API endpoints required
- Database queries
- Error handling approach
```

**Step 2: Code**
```bash
Claude Model: Generate components

Files created:
- Dashboard.tsx (main component)
- useRealTimeData.ts (custom hook)
- ChartCard.tsx (reusable chart)
- /api/dashboard/data (API route)
- dashboard-types.ts (types)
```

**Step 3: Test**
```bash
Claude Model: Create test suite

Generated:
- Dashboard.test.tsx (45 tests)
- useRealTimeData.test.ts (20 tests)
- ChartCard.test.tsx (25 tests)
- /api/dashboard/data.test.ts (15 tests)

Coverage: 87%
```

**Step 4: Review**
```bash
Claude Model: Code review

Checklist:
✅ Type safety (100%)
✅ Error handling (comprehensive)
✅ Performance (optimized)
✅ Accessibility (WCAG AA)
✅ Test coverage (87%)

Status: APPROVED ✅
```

**Step 5: Docs**
```bash
Gemini Model: Generate documentation

Output:
- Component API docs
- Usage examples
- Real-time data guide
- API documentation
- Deployment notes
```

---

### Example 2: Fix Authentication Bug

**Command**:
```bash
/debug "OAuth login fails after redirect from provider"
```

**Analysis**:

```typescript
// Debugger Agent Process:

1. Understand Issue
   - OAuth redirect works
   - Token received
   - But login fails silently

2. Investigate
   - Check token validation
   - Check session creation
   - Check error logging
   - Check API response

3. Root Cause
   - Session cookie not being set
   - Due to SameSite=Strict during development

4. Solution
   - Update cookie configuration
   - Allow localhost for development
   - Add proper CORS headers

5. Fix Code
   ```typescript
   // src/app/api/auth/callback/route.ts
   
   const response = NextResponse.json({ success: true });
   
   // Set session cookie
   response.cookies.set({
     name: 'session',
     value: sessionToken,
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax', // Changed from 'strict'
     maxAge: 7 * 24 * 60 * 60, // 7 days
   });
   
   return response;
   ```

6. Verification
   - Add test for cookie setting
   - Test OAuth flow end-to-end
   - Verify redirect works

7. Report
   - Root cause documented
   - Fix implemented
   - Tests added
   - Ready for merge
```

---

## Command Reference

### Available Commands

#### `/plan [feature] [constraints]`
Plan feature architecture

**Examples**:
```bash
# Simple feature
/plan "Add dark mode support"

# Complex feature with constraints
/plan "Build analytics dashboard" "Must use Recharts, real-time updates"

# With specific requirements
/plan "Multi-tenant system" "Isolation required, shared infrastructure"
```

**Output**: `plans/YYMMDD-[feature]-plan.md`

---

#### `/code [requirement] [details]`
Generate production code

**Examples**:
```bash
/code "Create settings panel" "Email, notifications, privacy preferences"

/code "Build API client" "Error handling, retry logic, type-safe"

/code "Form validation" "Email, password, phone with Zod"
```

**Output**: Generated files in `src/`

---

#### `/test [component]`
Generate comprehensive tests

**Examples**:
```bash
/test "UserCard component"

/test "useAuth hook"

/test "API route /api/users"
```

**Output**: Test files with >80% coverage

---

#### `/review [code]`
Code quality assessment

**Examples**:
```bash
/review "components/Dashboard.tsx"

/review "src/lib/api-client.ts"
```

**Output**: Review report with feedback

---

#### `/debug [issue]`
Debug and fix issues

**Examples**:
```bash
/debug "Login form submission fails silently"

/debug "Real-time updates not working"

/debug "Type error in useForm hook"
```

**Output**: Analysis + fix + tests

---

#### `/cook [feature] [requirements]`
Full workflow: Plan → Code → Test → Review → Docs

**Examples**:
```bash
/cook "User authentication" "OAuth and email/password"

/cook "Dashboard with charts" "Real-time data, responsive"

/cook "API versioning system"
```

**Output**: Complete feature, production-ready

---

### Model Selection for Commands

| Command | Best Model | Why |
|---------|-----------|-----|
| `/plan` | Claude | Complex architecture |
| `/code` | Claude | Type safety, quality |
| `/test` | Claude | Comprehensive coverage |
| `/review` | Claude | Detailed assessment |
| `/debug` | Claude | Complex analysis |
| `/cook` | Claude + Gemini | Full workflow |
| `/docs` | Gemini | Fast documentation |
| `/ask` | Gemini | Quick questions |

---

## Using with Different Models

### Claude 3.5 Sonnet (Recommended for Code)

```typescript
// Configuration
const claudeConfig = {
  model: 'anthropic/claude-3.5-sonnet',
  temperature: 0.3,        // Planning
  max_tokens: 4096,
  system: `You are an expert code architect...`,
};

// API Call
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create user authentication component',
    mode: 'code',
    model: 'anthropic/claude-3.5-sonnet',
  }),
});
```

**Best for**:
- Architecture design
- Code generation
- Type safety verification
- Complex problem solving

---

### Gemini 3.0 Pro (Cost-Effective)

```typescript
// Configuration
const geminiConfig = {
  model: 'google/gemini-3.0-pro',
  temperature: 0.7,        // Balanced
  max_tokens: 4096,
  system: `You are a helpful development assistant...`,
};

// API Call
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Generate API documentation',
    mode: 'chat',
    model: 'google/gemini-3.0-pro',
  }),
});
```

**Best for**:
- Research and analysis
- Documentation
- General questions
- Quick answers

---

## Accessing Integrated Documentation

### 1. Code Standards
```bash
# Read standards document
cat docs/CODE_STANDARDS.md

# Key sections:
# - Section 4: TypeScript Standards
# - Section 5: Component Standards
# - Section 6: API Routes Standards
# - Section 8: Testing Standards
# - Section 9: Error Handling
```

### 2. Agent Documentation
```bash
# View agent specifications
cat .claude/agents/planner.md
cat .claude/agents/implementer.md
cat .claude/agents/reviewer.md
cat .claude/agents/tester.md

# Each agent includes:
# - Core responsibilities
# - Workflow process
# - Quality standards
# - Integration points
```

### 3. Skills Documentation
```bash
# View skill documentation
cat .claude/skills/next-js/SKILL.md

# Includes:
# - Best practices
# - Common patterns
# - Code examples
# - Anti-patterns
```

### 4. Integration Plan
```bash
# View implementation roadmap
cat .claude/DEEP_INTEGRATION_PLAN.md

# Includes:
# - 10 implementation phases
# - Priority matrix
# - Timeline
# - Checklist
```

### 5. Using Documentation in Prompts

**Include context in your commands**:

```bash
# Plan with standards reference
/plan "Add authentication" "Follow CODE_STANDARDS.md section 4"

# Code generation with skill reference
/code "Dashboard component" "Use next-js skill patterns, Recharts"

# Testing with standards
/test "LoginForm" "Achieve >80% coverage per CODE_STANDARDS section 9"

# Review with checklist
/review "UserCard" "Use CODE_STANDARDS.md 14-point checklist"
```

---

## Switching Between Models

### Environment-Based Selection

```typescript
// .env.local
NEXT_PUBLIC_DEFAULT_MODEL=claude  # or gemini

// src/lib/claude.ts
const model = process.env.NEXT_PUBLIC_DEFAULT_MODEL === 'gemini'
  ? 'google/gemini-3.0-pro'
  : 'anthropic/claude-3.5-sonnet';
```

### Per-Request Selection

```bash
# Use Claude for code generation
curl -X POST http://localhost:3000/api/claude \
  -d '{"prompt":"...","model":"anthropic/claude-3.5-sonnet"}'

# Use Gemini for documentation
curl -X POST http://localhost:3000/api/claude \
  -d '{"prompt":"...","model":"google/gemini-3.0-pro"}'
```

### Cost Optimization Strategy

```typescript
// Intelligent model selection
function selectModel(task: string): string {
  if (task.includes('code') || task.includes('test')) {
    return 'anthropic/claude-3.5-sonnet'; // Better quality
  }
  
  if (task.includes('doc') || task.includes('research')) {
    return 'google/gemini-3.0-pro'; // Cost-effective
  }
  
  return 'anthropic/claude-3.5-sonnet'; // Default to Claude
}
```

---

## Troubleshooting

### Issue: "API Key not found"
```
Solution:
1. Check .env.local exists
2. Verify OPENROUTER_API_KEY or GOOGLE_API_KEY set
3. Restart npm run dev
4. Test: curl to /api/claude
```

### Issue: "Model not available"
```
Solution:
1. Check OpenRouter/Google account
2. Verify API key is active
3. Check OpenRouter credits
4. Try different model name
```

### Issue: "Rate limit exceeded"
```
Solution:
1. Use Gemini for some tasks (cheaper)
2. Implement exponential backoff
3. Cache responses
4. Batch requests
```

### Issue: "Token limit exceeded"
```
Solution:
1. Break large task into smaller ones
2. Use /plan first to reduce context
3. Reference documentation instead of including
```

---

## Best Practices

### 1. Combine Models for Efficiency

```
Planning Phase:     Claude (best architecture)
Documentation:      Gemini (fast, cost-effective)
Code Review:        Claude (detailed assessment)
Research:           Gemini (good analysis)
Testing:            Claude (comprehensive coverage)
```

### 2. Use Documentation References

```bash
# Good: Reference documentation
/code "Component" "Follow patterns in CODE_STANDARDS.md section 5"

# Better: Reference agents
/code "Component" "Use implementer.md quality standards"

# Better: Reference skills
/code "Next.js page" "Use next-js/SKILL.md patterns"
```

### 3. Chain Commands for Complex Features

```bash
# Instead of single /cook command:

# 1. Plan carefully
/plan "Complex feature" "With all constraints"

# 2. Code with references
/code "Requirement" "Reference plan, follow standards"

# 3. Test thoroughly
/test "Component" "Achieve 90%+ coverage"

# 4. Review multiple times
/review "Code" "Security, performance, types"
```

### 4. Iterate on Feedback

```bash
# 1. Get review
/review "Component"

# 2. Make improvements
# (Edit code based on suggestions)

# 3. Re-test
/test "Component"

# 4. Re-review
/review "Component"

# Repeat until approved ✅
```

### 5. Document as You Go

```bash
# After each command:
# - Review generated code
# - Update documentation
# - Commit changes
# - Reference in next command
```

---

## Success Checklist

When using Claude/Gemini with Apex agents:

- [ ] API key configured in .env.local
- [ ] Models available and responding
- [ ] Commands working: /plan, /code, /test, /review, /cook
- [ ] Generated code follows CODE_STANDARDS.md
- [ ] Tests >80% coverage
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Ready for production

---

## Summary

| Aspect | Claude | Gemini | Both |
|--------|--------|--------|------|
| Architecture | ✅ | ✅ | ✅ |
| Code Generation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| Type Safety | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| Testing | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| Documentation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| Cost | 💰💰💰 | 💰 | Optimized |
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |

---

**Ready to use**: ✅ Nov 24, 2025  
**Documentation**: Complete and comprehensive  
**Models**: Claude 3.5 + Gemini 3.0 Pro  
**Status**: Production ready
