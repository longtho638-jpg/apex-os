import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TwitterSentimentClient } from '@/lib/social/twitter-client';

describe('TwitterSentimentClient', () => {
    let client: TwitterSentimentClient;
    const mockBearerToken = 'test-bearer-token';

    beforeEach(() => {
        client = new TwitterSentimentClient({
            bearerToken: mockBearerToken,
            maxRequestsPerWindow: 5, // Lower limit for testing
            windowMs: 60000, // 1 minute for faster tests
            maxRetries: 2,
        });

        // Mock fetch
        global.fetch = vi.fn();
    });

    it('should search crypto tweets with correct query', async () => {
        const mockResponse = {
            data: [
                {
                    id: '1',
                    text: 'Bitcoin to the moon! 🚀',
                    author_id: 'user1',
                    created_at: '2025-11-27T10:00:00Z',
                    public_metrics: {
                        like_count: 150,
                        retweet_count: 30,
                        reply_count: 10,
                    },
                },
            ],
            meta: {
                result_count: 1,
            },
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await client.searchCryptoTweets('BTC', { limit: 10 });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].text).toContain('Bitcoin');
        expect(result.meta.result_count).toBe(1);

        // Verify fetch was called with correct params
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('(BTC OR $BTC)'),
            expect.objectContaining({
                headers: {
                    Authorization: `Bearer ${mockBearerToken}`,
                    'Content-Type': 'application/json',
                },
            })
        );
    });

    it('should handle rate limiting', async () => {
        const mockResponse = {
            data: [],
            meta: { result_count: 0 },
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        // Make multiple requests
        const promises = Array(3)
            .fill(null)
            .map(() => client.searchCryptoTweets('ETH'));

        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        // Fetch should be called 3 times but with rate limiting applied
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on transient errors', async () => {
        const mockError = {
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal Server Error' }),
        };

        const mockSuccess = {
            ok: true,
            json: async () => ({
                data: [{ id: '1', text: 'Test', author_id: 'user1', created_at: '2025-11-27T10:00:00Z' }],
                meta: { result_count: 1 },
            }),
        };

        // First call fails, second succeeds
        (global.fetch as any)
            .mockResolvedValueOnce(mockError)
            .mockResolvedValueOnce(mockSuccess);

        const result = await client.searchCryptoTweets('BTC');

        expect(result.data).toHaveLength(1);
        expect(global.fetch).toHaveBeenCalledTimes(2); // 1 failure + 1 retry
    });

    it('should throw on authentication errors without retry', async () => {
        const mockError = {
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' }),
        };

        (global.fetch as any).mockResolvedValueOnce(mockError);

        await expect(client.searchCryptoTweets('BTC')).rejects.toThrow('401');
        expect(global.fetch).toHaveBeenCalledTimes(1); // No retry on 401
    });

    it('should filter by minimum likes', async () => {
        const mockResponse = {
            data: [
                {
                    id: '1',
                    text: 'Popular tweet',
                    author_id: 'user1',
                    created_at: '2025-11-27T10:00:00Z',
                    public_metrics: { like_count: 200, retweet_count: 50, reply_count: 20 },
                },
            ],
            meta: { result_count: 1 },
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await client.searchCryptoTweets('BTC', { minLikes: 100 });

        // Verify query includes min_faves
        const fetchCall = (global.fetch as any).mock.calls[0][0];
        expect(fetchCall).toContain('min_faves:100');
    });

    it('should get rate limit status', async () => {
        const status = await client.getRateLimitStatus();

        expect(status).toHaveProperty('remaining');
        expect(status).toHaveProperty('reset');
        expect(status.reset).toBeInstanceOf(Date);
    });
});
