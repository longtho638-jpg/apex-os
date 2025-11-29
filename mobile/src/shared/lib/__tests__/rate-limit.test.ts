import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from '../rate-limit';

// Mock ioredis
const mockIncr = vi.fn();
const mockExpire = vi.fn();
const mockTtl = vi.fn();

vi.mock('../redis', () => ({
  redis: {
    incr: (...args: any[]) => mockIncr(...args),
    expire: (...args: any[]) => mockExpire(...args),
    ttl: (...args: any[]) => mockTtl(...args),
  }
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTtl.mockResolvedValue(60); // Default TTL 60s
  });

  it('should allow requests within limit', async () => {
    mockIncr.mockResolvedValue(1);
    const result = await rateLimit('test-user', { limit: 10, window: 60 });
    
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(mockIncr).toHaveBeenCalledWith('rate_limit:test-user');
    expect(mockExpire).toHaveBeenCalledWith('rate_limit:test-user', 60);
  });

  it('should block requests exceeding limit', async () => {
    mockIncr.mockResolvedValue(11);
    const result = await rateLimit('test-user', { limit: 10, window: 60 });
    
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should fail open (allow) if Redis errors', async () => {
    mockIncr.mockRejectedValue(new Error('Redis connection failed'));
    const result = await rateLimit('test-user');
    
    expect(result.success).toBe(true); // Fails open
    expect(result.remaining).toBe(1);
  });
});