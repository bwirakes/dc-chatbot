import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

// Load environment variables from .env.local
config({
  path: '.env.local',
});

const testConnection = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  console.log('Testing Supabase PostgreSQL connection...');

  try {
    // Configure connection with SSL for Supabase
    const client = postgres(process.env.POSTGRES_URL, {
      ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    const db = drizzle(client);
    
    // Simple query to test connection
    const result = await db.execute(sql`SELECT NOW()`);
    
    console.log('✅ Connection successful!');
    console.log('Current database time:', result[0].now);
    
    // Close the connection
    await client.end();
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
};

// Run the test
testConnection()
  .then((success) => {
    if (success) {
      console.log('Database connection test completed successfully.');
    } else {
      console.log('Database connection test failed.');
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Unexpected error during connection test:', err);
    process.exit(1);
  }); 
