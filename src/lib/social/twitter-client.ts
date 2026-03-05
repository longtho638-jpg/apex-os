import Bottleneck from 'bottleneck';

/**
 * Twitter API Client for Crypto Sentiment Analysis
 *
 * Features:
 * - Rate limiting (50 requests / 15 min for Twitter API v2 Essential)
 * - Retry logic with exponential backoff
 * - Type-safe interfaces
 */

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

export interface TwitterSearchResponse {
  data: Tweet[];
  meta: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
  };
}

export interface TwitterClientConfig {
  bearerToken: string;
  maxRequestsPerWindow?: number;
  windowMs?: number;
  maxRetries?: number;
}

export class TwitterSentimentClient {
  private bearerToken: string;
  private limiter: Bottleneck;
  private maxRetries: number;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(config: TwitterClientConfig) {
    this.bearerToken = config.bearerToken;
    this.maxRetries = config.maxRetries || 3;

    // Rate limiter: 50 requests per 15 minutes
    this.limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: (config.windowMs || 900000) / (config.maxRequestsPerWindow || 50),
      reservoir: config.maxRequestsPerWindow || 50,
      reservoirRefreshAmount: config.maxRequestsPerWindow || 50,
      reservoirRefreshInterval: config.windowMs || 900000,
    });
  }

  /**
   * Search crypto-related tweets
   * @param symbol - Crypto symbol (e.g., 'BTC', 'ETH')
   * @param options - Search options
   */
  async searchCryptoTweets(
    symbol: string,
    options: {
      limit?: number;
      minLikes?: number;
      verifiedOnly?: boolean;
    } = {},
  ): Promise<TwitterSearchResponse> {
    const { limit = 100, minLikes = 0, verifiedOnly = false } = options;

    // Build query
    let query = `(${symbol} OR $${symbol}) -is:retweet lang:en`;
    if (minLikes > 0) {
      query += ` min_faves:${minLikes}`;
    }

    return this.executeWithRetry(async () => {
      const params = new URLSearchParams({
        query,
        max_results: Math.min(limit, 100).toString(),
        'tweet.fields': 'public_metrics,created_at,author_id',
        'user.fields': 'verified,public_metrics',
        expansions: 'author_id',
      });

      const url = `${this.baseUrl}/tweets/search/recent?${params}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      const data = await response.json();

      // Filter by verified if requested
      if (verifiedOnly && data.includes?.users) {
        const verifiedUserIds = new Set(data.includes.users.filter((u: any) => u.verified).map((u: any) => u.id));
        data.data = data.data?.filter((tweet: Tweet) => verifiedUserIds.has(tweet.author_id));
      }

      return {
        data: data.data || [],
        meta: data.meta || { result_count: 0 },
      };
    });
  }

  /**
   * Execute request with rate limiting and retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(async () => {
      let lastError: Error | undefined;

      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as Error;

          // Don't retry on auth errors
          if (error instanceof Error && error.message.includes('401')) {
            throw error;
          }

          // Exponential backoff
          if (attempt < this.maxRetries - 1) {
            const delay = Math.min(1000 * 2 ** attempt, 10000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error('Request failed after retries');
    });
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<{
    remaining: number;
    reset: Date;
  }> {
    const counts = this.limiter.counts();
    return {
      remaining: counts.RECEIVED - counts.EXECUTING - (counts.DONE ?? 0),
      reset: new Date(Date.now() + 900000), // 15 minutes from now
    };
  }
}

/**
 * Factory function to create Twitter client from environment
 */
export function createTwitterClient(): TwitterSentimentClient {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error('TWITTER_BEARER_TOKEN environment variable is required');
  }

  return new TwitterSentimentClient({
    bearerToken,
    maxRequestsPerWindow: 50,
    windowMs: 900000, // 15 minutes
    maxRetries: 3,
  });
}
