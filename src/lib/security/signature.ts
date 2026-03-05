import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_SECRET =
  process.env.API_SIGNATURE_SECRET || process.env.SUPABASE_JWT_SECRET || 'signature-secret-must-be-set';
const SIGNATURE_WINDOW_MS = 30000; // 30 seconds

/**
 * Verify the HMAC signature of a request
 * @param method - HTTP method (GET, POST, etc.)
 * @param path - Request path (e.g., /api/v1/finance/withdraw)
 * @param timestamp - X-Timestamp header
 * @param signature - X-Signature header
 * @param body - Request body (stringified) or empty string
 */
export function verifySignature(
  method: string,
  path: string,
  timestamp: string,
  signature: string,
  body: string = '',
): boolean {
  // 1. Check timestamp freshness to prevent replay attacks
  const now = Date.now();
  const reqTime = parseInt(timestamp, 10);

  if (Number.isNaN(reqTime)) return false;
  if (Math.abs(now - reqTime) > SIGNATURE_WINDOW_MS) return false;

  // 2. Reconstruct the payload
  // Format: METHOD|PATH|TIMESTAMP|BODY
  const payload = `${method.toUpperCase()}|${path}|${timestamp}|${body}`;

  // 3. Calculate expected signature
  const expectedSignature = createHmac('sha256', SIGNATURE_SECRET).update(payload).digest('hex');

  // 4. Constant time comparison
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Generate a signature (for testing or internal server-to-server calls)
 */
export function generateSignature(
  method: string,
  path: string,
  body: string = '',
): { signature: string; timestamp: string } {
  const timestamp = Date.now().toString();
  const payload = `${method.toUpperCase()}|${path}|${timestamp}|${body}`;

  const signature = createHmac('sha256', SIGNATURE_SECRET).update(payload).digest('hex');

  return { signature, timestamp };
}
