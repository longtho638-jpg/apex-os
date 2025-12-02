# Coding Rules & Guidelines

## 1. Mock Data Standards

### ✅ ALWAYS Use Real Data Formats in Mock UI

**Rule:** Mock data MUST match production database schema exactly.

**Why:** 
- Prevents runtime errors when connecting to real backend
- Catches schema mismatches early in development
- Reduces "technical debt" from placeholder data

**Examples:**

❌ **BAD - Fake IDs:**
```typescript
const mockLeaders = [
  { id: 'leader-1', name: 'John', ... },
  { id: 'leader-2', name: 'Jane', ... }
];
```

✅ **GOOD - Real UUIDs:**
```typescript
const mockLeaders = [
  { 
    user_id: '00000000-0000-0000-0000-000000000001',
    display_name: 'John',
    ... 
  }
];
```

❌ **BAD - Mismatched field names:**
```typescript
const mockUser = { id: '123', username: 'test' };
// But database expects: { user_id: UUID, display_name: string }
```

✅ **GOOD - Exact schema match:**
```typescript
const mockUser = { 
  user_id: '00000000-0000-0000-0000-000000000001',
  display_name: 'test' 
};
```

### Valid UUID Formats for Mock Data

Use deterministic UUIDs for consistency:
```typescript
// User 1
'00000000-0000-0000-0000-000000000001'

// User 2
'00000000-0000-0000-0000-000000000002'

// Transaction 1
'00000001-0000-0000-0000-000000000001'
```

### Database Schema First

1. ✅ Check `src/database/migrations/*.sql` before creating mock data
2. ✅ Use TypeScript types that match database schema
3. ✅ Run type checking to catch mismatches

## 2. Authentication Architecture

This project uses **custom authentication** (`apex_session` cookie), NOT Supabase Auth.

**Implications:**
- Don't use `supabase.auth.getUser()` in API routes
- Middleware handles authentication via `apex_session` cookie
- Use **Service Role Key** to bypass RLS in API routes (since middleware validates auth)

**Example:**
```typescript
// ❌ WRONG - Supabase Auth (incompatible)
const { data: { user } } = await supabase.auth.getUser();

// ✅ CORRECT - Service Role (bypass RLS, middleware validates)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## 3. Error Messages

Always return **specific error messages** to frontend:

❌ **BAD:**
```typescript
catch (error) {
  return NextResponse.json({ error: 'Error' }, { status: 500 });
}
```

✅ **GOOD:**
```typescript
catch (error: any) {
  console.error('[Component] Error:', error);
  return NextResponse.json({ 
    success: false,
    error: error.message || 'Internal Server Error',
    details: error.details || null
  }, { status: 500 });
}
```

## 4. Testing Strategy

Before deploying features:

1. ✅ Test with **empty database** (mock data seeding)
2. ✅ Test with **real data** (actual user interactions)
3. ✅ Check browser console for errors
4. ✅ Check server logs for backend errors

---

**Last Updated:** 2025-12-02
**Enforced By:** Code review + TypeScript strict mode
