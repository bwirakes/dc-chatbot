import { db } from './queries';

async function checkTables() {
  console.log('Checking database tables...');
  
  try {
    // Check User table
    const userTableResult = await db.execute(
      'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'User\');'
    );
    console.log('User table exists:', userTableResult[0].exists);
    
    // If User table exists, check if it has any records
    if (userTableResult[0].exists) {
      const userCountResult = await db.execute('SELECT COUNT(*) FROM "User";');
      console.log('User count:', userCountResult[0].count);
    }
    
    // Check Chat table
    const chatTableResult = await db.execute(
      'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'Chat\');'
    );
    console.log('Chat table exists:', chatTableResult[0].exists);
    
    // List all tables in public schema
    const allTables = await db.execute(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;'
    );
    console.log('All tables in public schema:');
    allTables.forEach((table: any) => {
      console.log('-', table.table_name);
    });
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

// Run the function
checkTables().catch(console.error); 