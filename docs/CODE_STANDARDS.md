# Code Standards for Apex-OS

**Last Updated**: 2025-11-24  
**Version**: 1.0.0  
**Status**: Active

---

## 1. Core Principles

### YAGNI (You Aren't Gonna Need It)
- Don't over-engineer solutions
- Implement features only when needed
- Avoid building for hypothetical requirements
- Keep solutions simple and maintainable

### KISS (Keep It Simple, Stupid)
- Prefer simple, straightforward solutions
- Avoid unnecessary complexity
- Write code that's easy to understand
- Choose clarity over cleverness

### DRY (Don't Repeat Yourself)
- Eliminate code duplication
- Extract common logic into reusable modules
- Use composition and abstraction
- Maintain single source of truth

---

## 2. File Organization

### Directory Structure

```
apex-os/
├── src/
│   ├── app/                     # Next.js app directory
│   │   ├── (auth)/              # Auth group
│   │   ├── api/                 # API routes
│   │   ├── dashboard/           # Dashboard pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # Reusable components
│   │   ├── [Feature]/           # Feature-specific components
│   │   │   ├── [Component].tsx
│   │   │   ├── [Component].types.ts
│   │   │   └── index.ts
│   │   └── ui/                  # Generic UI components
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── workflows/
│   ├── types/                   # Global type definitions
│   ├── hooks/                   # Custom React hooks
│   └── styles/                  # Global styles
├── .claude/                     # Claude Code configuration
│   ├── agents/                  # Agent definitions
│   ├── commands/                # Slash commands
│   ├── skills/                  # Knowledge modules
│   └── workflows/               # Workflow definitions
├── docs/                        # Documentation
├── tests/                       # Test utilities
├── e2e/                         # E2E tests
└── plans/                       # Planning documents
    └── reports/                 # Agent reports
```

### Component Structure

```
components/[Feature]/
├── [Component].tsx              # Main component
├── [Component].types.ts         # Types/interfaces
├── [Component].test.tsx         # Component tests
├── hooks.ts                     # Custom hooks
└── index.ts                     # Exports
```

---

## 3. Naming Conventions

### Files & Directories

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.tsx`, `LoginForm.tsx` |
| Utilities | camelCase | `validateEmail.ts`, `formatDate.ts` |
| Types | PascalCase | `User.ts`, `ProductTypes.ts` |
| Test files | `[name].test.ts` | `utils.test.ts`, `Button.test.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useForm.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| Directories | kebab-case | `feature-name/`, `api-routes/` |

### Variables & Functions

| Type | Convention | Example |
|------|-----------|---------|
| Functions | camelCase | `getUserById`, `formatCurrency` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `DEFAULT_PAGE_SIZE` |
| Classes | PascalCase | `User`, `APIClient` |
| Interfaces | PascalCase with `I` prefix (optional) | `UserProps`, `APIResponse` |
| Private fields | Leading underscore (optional) | `_internalState` |
| Boolean variables | `is`, `has`, `can` prefix | `isActive`, `hasPermission`, `canEdit` |

---

## 4. TypeScript Standards

### Strict Mode
Always enable strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions

```typescript
// ✅ Good: Proper types
interface UserProps {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

function getUser(id: string): Promise<User> {
  // Implementation
}

// ❌ Bad: Using any
interface UserProps {
  id: any;
  data: any;
}

function getUser(id: any): any {
  // Implementation
}
```

### Interfaces vs Types

```typescript
// Use interfaces for object shapes (extensible)
interface User {
  id: string;
  name: string;
}

// Use types for unions, primitives, tuples
type Role = 'admin' | 'user' | 'guest';
type UserOrError = User | Error;
type Tuple = [string, number];
```

### No Implicit Any

```typescript
// ✅ Good
const items: string[] = [];
function process(data: unknown): string {
  // Type guard...
}

// ❌ Bad
const items = []; // Inferred as any[]
function process(data) { // any parameter
  // ...
}
```

---

## 5. Component Standards

### Functional Components

```typescript
/**
 * UserCard - Display user information with avatar
 * @example
 * <UserCard user={user} onSelect={handleSelect} />
 */
interface UserCardProps {
  /** User data to display */
  user: User;
  /** Callback when user is selected */
  onSelect?: (user: User) => void;
  /** Additional CSS class */
  className?: string;
}

export function UserCard({
  user,
  onSelect,
  className = '',
}: UserCardProps): JSX.Element {
  return (
    <div className={`user-card ${className}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onSelect && (
        <button onClick={() => onSelect(user)}>Select</button>
      )}
    </div>
  );
}

// Export test IDs for testing
export const testIds = {
  root: 'user-card-root',
  name: 'user-card-name',
  email: 'user-card-email',
  selectBtn: 'user-card-select-btn',
};
```

### Props

```typescript
// ✅ Good: Specific props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ❌ Bad: Generic props
interface ButtonProps {
  [key: string]: any;
}
```

### Error Boundary

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

## 6. API Routes Standards

### Request/Response Types

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define schemas for validation
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user']),
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;

interface APIResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResponse<User>>> {
  try {
    const body = await request.json();
    const data = CreateUserSchema.parse(body);

    const user = await createUser(data);

    return NextResponse.json(
      { data: user, status: 201 },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          status: 400,
        },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500,
      },
      { status: 500 }
    );
  }
}
```

### Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Unexpected error |

---

## 7. Error Handling

### Try-Catch Pattern

```typescript
// ✅ Good
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}

// ❌ Bad
async function fetchData() {
  const response = await fetch('/api/data');
  return await response.json(); // No error handling
}
```

### Error Types

```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
try {
  // ...
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof APIError) {
    // Handle API errors
  } else {
    // Handle unknown errors
  }
}
```

---

## 8. Async/Await

### Async Patterns

```typescript
// ✅ Good: Async/await with error handling
async function loadUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to load user');
    return await response.json();
  } catch (error) {
    console.error('Error loading user:', error);
    throw error;
  }
}

// ✅ Good: Promise.all for parallel requests
async function loadUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserComments(userId),
  ]);

  return { user, posts, comments };
}

// ❌ Bad: Sequential instead of parallel
async function loadUserData(userId: string) {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(userId);
  const comments = await fetchUserComments(userId);
  // Slower - waits for each request
}
```

---

## 9. Testing Standards

### Test Structure

```typescript
// ✅ Good: Descriptive test names
describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject email without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('should handle edge case of empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

// ❌ Bad: Vague test names
describe('validateEmail', () => {
  it('works', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('test 2', () => {
    expect(validateEmail('user@')).toBe(false);
  });
});
```

### Coverage Requirements

- Utilities: 100% coverage
- Components: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: User workflows

---

## 10. Comments & Documentation

### Code Comments

```typescript
// ✅ Good: Why, not what
function calculateDiscount(price: number, isVIP: boolean): number {
  // VIP members get 15% discount to encourage loyalty
  return isVIP ? price * 0.85 : price;
}

// ❌ Bad: Stating the obvious
function calculateDiscount(price: number, isVIP: boolean): number {
  // Multiply price by 0.85 if VIP
  return isVIP ? price * 0.85 : price;
}
```

### JSDoc Format

```typescript
/**
 * Calculate total price with tax
 * @param basePrice - Base price before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price including tax
 * @throws {Error} If basePrice or taxRate is negative
 * @example
 * const total = calculateWithTax(100, 0.08); // 108
 */
function calculateWithTax(basePrice: number, taxRate: number): number {
  if (basePrice < 0 || taxRate < 0) {
    throw new Error('Price and tax rate must be non-negative');
  }
  return basePrice * (1 + taxRate);
}
```

---

## 11. Git Workflow

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test additions/changes
- `chore`: Build, dependencies

**Examples**:
```
feat(auth): add OAuth2 login support

- Implement Google OAuth2 flow
- Add user session management
- Update authentication middleware

Closes #123
```

---

## 12. Performance Standards

### Optimization Checklist

- [ ] No unnecessary re-renders (use React.memo, useMemo)
- [ ] Lazy load components (React.lazy, dynamic imports)
- [ ] Optimize images (use next/image)
- [ ] Minimize bundle size
- [ ] Cache API responses
- [ ] Pagination for large lists
- [ ] Debounce expensive operations

---

## 13. Security Standards

### Required Practices

- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (use ORMs)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (if needed)
- ✅ Authentication checks
- ✅ Authorization verification
- ✅ Secrets in environment variables
- ✅ HTTPS only in production

### Secrets Management

```typescript
// ✅ Good: Use environment variables
const apiKey = process.env.OPENROUTER_API_KEY;

// ❌ Bad: Hardcoded secrets
const apiKey = 'sk_live_1234567890abcdef';
```

### Webhook Security

#### Signature Verification (Polar.sh / Stripe)
All webhooks MUST verify the provider's signature using the raw request body.

```typescript
// ✅ Good: Verify signature with raw body
import { Webhook } from '@polar-sh/sdk';

const webhook = new Webhook(process.env.POLAR_WEBHOOK_SECRET!);
const signature = headers.get('polar-webhook-signature');
const body = await req.text(); // Get raw body

try {
  webhook.verify(body, signature!);
  // Process event...
} catch (err) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
}
```

---

## 14. Accessibility Standards

### Web Accessibility

- ✅ Semantic HTML (buttons, links, form elements)
- ✅ ARIA labels for complex components
- ✅ Keyboard navigation support
- ✅ Color contrast sufficient (WCAG AA)
- ✅ Alt text for images
- ✅ Form labels associated
- ✅ Focus visible

---

## Enforcement

### Tools

- **TypeScript**: Type checking
- **ESLint**: Code style
- **Prettier**: Code formatting
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

### CI/CD Checks

All PRs must pass:
- TypeScript compilation
- ESLint checks
- Test coverage >80%
- No TypeScript errors
- Code review approval

---

## References

- Next.js 16 Documentation
- TypeScript Best Practices
- React Best Practices
- ClaudeKit Code Standards
- Web Accessibility (WCAG 2.1)

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-24  
**Owner**: Apex-OS Team
