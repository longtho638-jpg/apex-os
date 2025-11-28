# Redis Setup & Rate Limiting

## Overview
Apex OS uses Redis for:
- API Rate Limiting
- Session Management (future)
- Caching (future)
- Queue Management (future)

## Configuration

### Environment Variables
Add to `.env.local`:

```bash
# Redis Connection URL
REDIS_URL=redis://localhost:6379
# Or for authenticated production Redis:
# REDIS_URL=redis://:password@host:port
```

### Client Configuration
The Redis client is configured in `src/lib/redis.ts` using `ioredis`.
It includes:
- Automatic reconnection strategy
- Connection timeout (5s)
- Singleton pattern for development hot-reloading

## Rate Limiting
Implemented in `src/lib/rate-limit.ts`.

**Usage:**
```typescript
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  const { success, reset } = await rateLimit(ip, { limit: 10, window: 60 });
  
  if (!success) {
    return rateLimitResponse(reset);
  }
  
  // ... handle request
}
```

**Fail-Open Strategy:**
If Redis is unreachable, the rate limiter returns `success: true` to prevent blocking legitimate traffic during infrastructure outages. This is a "safety net" feature.
