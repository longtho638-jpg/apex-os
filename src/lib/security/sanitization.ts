/**
 * Input Sanitization Utilities
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML tags and characters
 * Simple implementation for demonstration - in production consider using DOMPurify (server-side)
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Sanitizes an object by applying sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>\s]/g, '');
}
