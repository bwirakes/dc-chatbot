import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';

// Load environment variables from .env.local in development
// Vercel automatically loads environment variables in production
if (process.env.NODE_ENV !== 'production') {
  config({
    path: '.env.local',
  });
}

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.warn('⚠️ POSTGRES_URL is not defined, skipping database migration');
    return;
  }

  try {
    console.log('⏳ Running migrations...');
    const start = Date.now();

    // Configure connection with SSL for Supabase
    const connection = postgres(process.env.POSTGRES_URL, { 
      max: 1,
      ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
      connect_timeout: 30, // Longer timeout for migrations
      idle_timeout: 20, // Keep connections alive during migration
      max_lifetime: 60 * 5, // 5 minutes max lifetime
    });
    
    const db = drizzle(connection);

    // Path to migrations folder - make sure it works in both local and Vercel environments
    const migrationsFolder = path.join(process.cwd(), 'lib/db/migrations');
    
    await migrate(db, { migrationsFolder });
    
    const end = Date.now();
    console.log('✅ Migrations completed in', end - start, 'ms');
    
    // Important: close the connection to allow the process to exit
    await connection.end();
  } catch (err) {
    console.error('❌ Migration failed');
    console.error(err);
    
    // Don't throw error to avoid breaking the build process
    // This allows Vercel deployment to continue even if migrations fail
    // You can handle the DB setup manually if needed
  }
};

// Export for programmatic usage
export { runMigrate };

// Run migration directly if this file is executed directly
if (require.main === module) {
  runMigrate().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
