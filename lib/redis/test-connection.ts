import redis from './client';
import { setTimeout } from 'timers/promises';

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  
  try {
    // Try to ping Redis
    const response = await redis.ping();
    console.log('Redis connection successful:', response);
    
    // Test set/get operations
    console.log('Testing Redis set/get operations...');
    await redis.set('test_key', 'test_value');
    const value = await redis.get('test_key');
    console.log('Retrieved test value:', value);
    
    // Clean up
    await redis.del('test_key');
    console.log('Test cleanup completed.');
    
    console.log('✅ Redis connection test passed!');
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    process.exit(1);
  } finally {
    // Close Redis connection
    await redis.quit();
  }
}

// Run the test
testRedisConnection().catch((error) => {
  console.error('Unhandled error in Redis test:', error);
  process.exit(1);
}); 