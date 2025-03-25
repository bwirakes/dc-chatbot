import redis from './client';

// Default TTL for cache entries (in seconds)
const DEFAULT_TTL = 60 * 60; // 1 hour

/**
 * Get a value from cache
 * @param key The cache key
 * @returns The cached value or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set a value in cache with TTL
 * @param key The cache key
 * @param value The value to cache
 * @param ttl TTL in seconds (default: 1 hour)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete a value from cache
 * @param key The cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete multiple values from cache by pattern
 * @param pattern The key pattern to match (e.g., "chat:*")
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache delete by pattern error:', error);
  }
}

/**
 * Get or set cache with callback
 * @param key The cache key
 * @param callback Function to call if cache miss
 * @param ttl TTL in seconds (default: 1 hour)
 * @returns The cached or computed value
 */
export async function getOrSetCache<T>(
  key: string,
  callback: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  try {
    // Try to get from cache first
    const cachedValue = await getCache<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // If not in cache, compute value using callback
    const value = await callback();
    
    // Store in cache for next time
    await setCache(key, value, ttl);
    
    return value;
  } catch (error) {
    console.error('Cache get or set error:', error);
    // If cache fails, fall back to direct callback
    return callback();
  }
} 