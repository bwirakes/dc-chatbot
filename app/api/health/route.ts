import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '../../../lib/db/queries';

export async function GET() {
  try {
    // Simple query to check DB connection
    const result = await db.execute(sql`SELECT 1 as connected`);
    
    return NextResponse.json({ 
      status: 'ok', 
      database: 'connected', 
      provider: 'supabase',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        database: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 
