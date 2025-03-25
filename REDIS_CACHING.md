# Redis Caching Guide

This guide provides instructions for setting up and using Redis with your AI Chatbot application to improve performance and reduce database load.

## Why Redis Caching?

Redis is used as a caching layer to:
- Reduce load on your Supabase PostgreSQL database
- Improve response times for frequently accessed data
- Provide fault tolerance when the database is temporarily unavailable

## Setup Instructions

### Local Development

1. **Install Redis locally**:
   - Mac: `brew install redis` and `brew services start redis`
   - Windows: Download from [Redis for Windows](https://github.com/tporadowski/redis/releases)
   - Linux: `sudo apt-get install redis-server`

2. **Configure environment variables**:
   Add the Redis connection URL to your `.env.local` file:
   ```
   REDIS_URL=redis://localhost:6379
   ```

3. **Verify Redis connection**:
   Start your application and visit `/api/health/redis` to confirm Redis is connected.

### Production Deployment

For production deployment, we recommend using a managed Redis service:

1. **Set up Redis on a cloud provider**:
   - [Upstash](https://upstash.com/) (works well with Vercel)
   - [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
   - [AWS ElastiCache](https://aws.amazon.com/elasticache/)

2. **Add the Redis URL to your environment variables**:
   - For Vercel deployment, add the Redis URL in your project settings under Environment Variables.

## Cache Configuration

The caching implementation uses the following TTL (Time To Live) settings by default:

- User data: 1 hour
- Chat data: 5 minutes
- Messages: 2 minutes
- Documents: 10 minutes
- Votes: 5 minutes

You can adjust these values in `lib/db/queries.ts` by modifying the `CACHE_TTL` object.

## Testing Cache Performance

To validate that caching is working:

1. Monitor database query performance before and after implementing Redis
2. Check Redis keys with Redis CLI: `redis-cli keys "*"`
3. Monitor API response times

## Cache Invalidation

The system automatically invalidates cache entries when related data changes. For example, when a new message is saved, the message list cache for that chat is invalidated.

## Troubleshooting

### Connection Issues

If Redis connection fails:

1. Verify Redis is running: `redis-cli ping` should return `PONG`
2. Check your `REDIS_URL` environment variable is correct
3. Ensure network connectivity to Redis server (especially in production)
4. Check Redis server logs for errors

### Memory Usage

Monitor Redis memory usage with:
```
redis-cli info memory
```

If Redis is consuming too much memory, consider:
- Reducing TTL values
- Being more selective about what data is cached
- Increasing Redis server memory allocation

## Health Check Endpoint

A Redis health check endpoint is available at `/api/health/redis` which returns:
- `{ status: 'ok', message: 'Redis connection successful' }` if Redis is connected
- Error details if Redis connection fails

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Ioredis Documentation](https://github.com/redis/ioredis) 