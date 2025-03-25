import Redis from 'ioredis';
import { env } from 'process';

// Fallback to localhost if REDIS_URL is not defined
const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client with options
const redis = new Redis(redisUrl, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Retry connection with exponential backoff
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Log connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  // Don't crash the application on Redis connection issues
});

export default redis; 