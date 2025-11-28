# TypeScript Patterns

## Type Safety

### Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Avoid `any`
```typescript
// Bad
function process(data: any) { }

// Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Type-safe usage
  }
}
```

### Type Guards
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}
```

## Advanced Patterns

### Discriminated Unions
```typescript
type Success = { status: 'success'; data: User };
type Error = { status: 'error'; message: string };
type Result = Success | Error;

function handle(result: Result) {
  if (result.status === 'success') {
    console.log(result.data); // Type: User
  } else {
    console.log(result.message); // Type: string
  }
}
```

### Utility Types
```typescript
type UserUpdate = Partial<User>;
type UserRequired = Required<User>;
type UserReadonly = Readonly<User>;
type UserPick = Pick<User, 'id' | 'email'>;
type UserOmit = Omit<User, 'password'>;
```
