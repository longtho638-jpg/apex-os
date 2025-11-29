/**
 * API Configuration Helper
 * Handles API URL resolution for both Client-side (CSR) and Server-side (SSR)
 */

export function getApiUrl(): string {
    // 1. Client-side: Always use the current origin to avoid CORS and port issues
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api/v1`;
    }

    // 2. Server-side (SSR/SSG):

    // a) Explicitly configured API URL (e.g. in .env.local)
    if (process.env.NEXT_PUBLIC_API_URL) {
        // Ensure it starts with http
        if (process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
            return process.env.NEXT_PUBLIC_API_URL;
        }
        // If it's just a path like '/api/v1', we need a base URL
        // This case is tricky in SSR without a request object.
    }

    // b) Vercel Production/Preview
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/api/v1`;
    }

    // c) Local Development Fallback
    // Default to port 3000, but if you run on 3001, you should set NEXT_PUBLIC_API_URL
    return 'http://localhost:3000/api/v1';
}
