import { NextResponse } from 'next/server';
import redis from '@/lib/redis/client';

export async function GET() {
  try {
    // Check Redis connection
    const pingResponse = await redis.ping();
    
    if (pingResponse === 'PONG') {
      return NextResponse.json({ 
        status: 'ok', 
        message: 'Redis connection successful' 
      });
    } else {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Redis connection failed' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Redis health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Redis connection error',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 