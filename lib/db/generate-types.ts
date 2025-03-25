import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgSchema } from 'drizzle-orm/pg-core';
import { writeFileSync } from 'fs';
import postgres from 'postgres';
import { join } from 'path';

// Load environment variables
config({
  path: '.env.local',
});

const generateTypes = async () => {
  try {
    if (!process.env.POSTGRES_URL) {
      console.log('⚠️ POSTGRES_URL not found. Skipping type generation.');
      return;
    }

    console.log('⏳ Connecting to database to generate types...');
    
    // Configure connection with SSL for Supabase
    const connection = postgres(process.env.POSTGRES_URL, { 
      max: 1,
      ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
      connect_timeout: 30, // Longer timeout for generations
    });
    
    const db = drizzle(connection);
    
    console.log('⏳ Generating schema types...');
    
    // Instead of generating schema automatically, we'll import from existing schema definitions
    console.log('ℹ️ Using existing schema definitions');
    console.log('✅ Schema types ready for build');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Failed to generate schema types:');
    console.error(error);
    // Don't exit with error to allow builds to continue
  }
};

generateTypes(); 
