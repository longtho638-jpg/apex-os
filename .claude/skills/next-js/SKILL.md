---
name: next-js
version: 1.0.0
category: framework
last-updated: 2025-11-24
---

# Skill: Next.js 16.0.3

## Overview

Next.js 16.0.3 best practices and patterns for Apex-OS project. This skill covers routing, API routes, middleware, data fetching, and deployment.

## Core Principles

1. **App Router**: Use file-based routing in `src/app/`
2. **Server Components**: Default to server components
3. **Type Safety**: TypeScript strict mode always
4. **API Routes**: RESTful design with proper status codes
5. **Middleware**: Request/response processing
6. **Performance**: Optimize images, fonts, code splitting

## Common Patterns

### 1. File-Based Routing

```
src/app/
├── page.tsx                    # /
├── layout.tsx                  # Root layout
├── (auth)/
│   ├── login/page.tsx          # /login
│   └── signup/page.tsx         # /signup
├── dashboard/
│   ├── layout.tsx              # Dashboard layout
│   ├── page.tsx                # /dashboard
│   └── settings/page.tsx       # /dashboard/settings
└── api/
    ├── users/
    │   ├── route.ts            # /api/users
    │   └── [id]/route.ts       # /api/users/[id]
    └── auth/
        └── route.ts            # /api/auth
```

### 2. API Routes

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users
 * Fetch all users
 */
export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ users: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validation...
    // Create user...
    return NextResponse.json({ user: {} }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    );
  }
}
```

### 3. Dynamic Routes

```typescript
// src/app/users/[id]/page.tsx
interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  
  // Fetch user by id
  const user = await fetchUser(id);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 4. Middleware

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('auth_token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

### 5. Data Fetching (Server Component)

```typescript
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
  });
  
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 6. Client Component with Data Fetching

```typescript
// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return <div>{user.name}</div>;
}
```

### 7. Layouts

```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900">
        <nav>{/* Navigation */}</nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Best Practices

### ✅ Do
- Use server components by default
- Implement proper error handling
- Cache API responses with revalidate
- Use dynamic routes for collections
- Implement loading.tsx and error.tsx
- Use middleware for auth
- Optimize images with `<Image>`
- Implement proper TypeScript types

### ❌ Don't
- Use client components for data fetching (use server components)
- Fetch data in useEffect without boundaries
- Expose sensitive data in API routes
- Skip error handling
- Leave API routes unvalidated
- Use fetch without cache strategy
- Ignore TypeScript strict mode

## Common Patterns

### Error Handling in API Routes
```typescript
export async function GET(request: NextRequest) {
  try {
    // Logic...
    return NextResponse.json({ data: {} });
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Reusable API Client
```typescript
// src/lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiCall<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

## Performance Tips

1. **Image Optimization**: Use `next/image` for optimization
2. **Font Loading**: Use `next/font` for web fonts
3. **Code Splitting**: Let Next.js handle automatic splitting
4. **API Routes Caching**: Use appropriate cache headers
5. **Incremental Static Regeneration**: Use `revalidate` option
6. **Dynamic Imports**: Use for large components

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

---

**Version**: 1.0.0  
**Updated**: 2025-11-24  
**Framework**: Next.js 16.0.3
