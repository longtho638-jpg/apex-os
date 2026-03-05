export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class QueryCache {
  private static instance: QueryCache;
  private cache: Map<string, CacheEntry<any>>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache();
    }
    return QueryCache.instance;
  }

  public get<T>(key: string, ttl: number = 60000): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public invalidate(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = QueryCache.getInstance();
