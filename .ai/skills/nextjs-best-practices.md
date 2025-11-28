# Next.js 16 Best Practices

## App Router Patterns

### Server Components (Default)
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
```

### Client Components
```typescript
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Route Handlers
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ users: [] });
}
```

## Performance Optimizations

### Dynamic Imports
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/photo.jpg"
  width={500}
  height={300}
  alt="Description"
  priority // For LCP images
/>
```

### Metadata API
```typescript
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    images: ['/og-image.png'],
  },
};
```

## Data Fetching

### Server Actions
```typescript
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  // Database operation
  revalidatePath('/users');
}
```

### Caching
```typescript
// Revalidate every hour
export const revalidate = 3600;

// No caching
export const dynamic = 'force-dynamic';
```
