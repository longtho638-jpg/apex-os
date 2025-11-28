---
description: Generate Next.js API route with Claude Sonnet
argument-hint: [route-path] [requirements]
---

## Arguments
- ROUTE_PATH: $1 (e.g., /api/users, /api/auth/login, /api/products/[id])
- REQUIREMENTS: $2 (specific API functionality and business logic)

## Mission
Generate a production-ready Next.js API route at $ROUTE_PATH with the following requirements:
$REQUIREMENTS

## Standards & Best Practices
- Use Next.js 16.0.3 API Routes (src/app/api/)
- Use TypeScript with strict mode
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Input validation with Zod
- Error handling with try-catch
- CORS handling if needed
- Request/Response typing
- Environment variable usage
- No console.logs in production
- Proper logging for debugging

## API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Implementation
    return NextResponse.json({ data: {} }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Quality Checklist
- ✓ TypeScript types for request/response
- ✓ Input validation (Zod)
- ✓ Proper HTTP status codes
- ✓ Error handling with try-catch
- ✓ Environment variables accessed safely
- ✓ No sensitive data in responses
- ✓ Proper logging
- ✓ CORS headers if needed
- ✓ Rate limiting ready
- ✓ Authentication checks (if needed)

## Output Format
Return only the API route code without markdown backticks or explanations.
