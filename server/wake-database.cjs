const { Pool } = require('pg');

async function wakeUpAndInitializeDatabase() {
  console.log('🔄 Attempting to wake up and initialize database...');
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 1
  });
  
  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Attempt ${attempt}/5: Connecting to database...`);
      
      const client = await pool.connect();
      console.log('✅ Database connection successful!');
      
      // Test query to ensure database is fully active
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      console.log('Database is active at:', result.rows[0].current_time);
      console.log('Database version:', result.rows[0].db_version.split(' ')[0]);
      
      console.log('🏗️ Creating database schema...');
      
      // Create schema safely with IF NOT EXISTS
      await client.query(`
        -- Create enums
        DO $$ BEGIN
          CREATE TYPE complaint_status AS ENUM ('pending', 'resolved', 'escalated');
        EXCEPTION WHEN duplicate_object THEN
          NULL;
        END $$;
        
        DO $$ BEGIN
          CREATE TYPE complaint_category AS ENUM ('hr', 'infrastructure', 'management', 'cafeteria', 'security', 'other');
        EXCEPTION WHEN duplicate_object THEN
          NULL;
        END $$;
      `);
      console.log('✅ Enums created');
      
      // Organizations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          access_key TEXT NOT NULL UNIQUE,
          threshold_percentage INTEGER NOT NULL DEFAULT 15,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Organizations table ready');
      
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          pseudonym TEXT NOT NULL,
          access_key TEXT NOT NULL UNIQUE,
          organization_id INTEGER REFERENCES organizations(id),
          is_admin BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Users table ready');
      
      // User-Organizations relationship table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_organizations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          role TEXT NOT NULL DEFAULT 'member',
          joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, organization_id)
        );
      `);
      console.log('✅ User-Organizations table ready');
      
      // Complaints table
      await client.query(`
        CREATE TABLE IF NOT EXISTS complaints (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          category complaint_category NOT NULL,
          status complaint_status NOT NULL DEFAULT 'pending',
          similarity_group TEXT,
          escalated BOOLEAN NOT NULL DEFAULT false,
          user_id INTEGER NOT NULL,
          organization_id INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Complaints table ready');
      
      // Feedbacks table
      await client.query(`
        CREATE TABLE IF NOT EXISTS feedbacks (
          id SERIAL PRIMARY KEY,
          complaint_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Feedbacks table ready');
      
      // Notifications table
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          user_id INTEGER,
          organization_id INTEGER NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Notifications table ready');
      
      client.release();
      
      console.log('\n🎉 DATABASE INITIALIZATION COMPLETE!');
      console.log('Your multi-organization complaint system is ready!');
      console.log('You can now register and login to test the system.');
      
      break; // Success, exit retry loop
      
    } catch (err) {
      console.log(`❌ Attempt ${attempt} failed: ${err.message}`);
      
      if (attempt < 5) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.log('\n🚫 All attempts failed. Database endpoint may need manual reactivation.');
        console.log('This is a known issue with Neon databases that go to sleep.');
        console.log('Try again in a few minutes or contact support if the issue persists.');
      }
    }
  }
  
  await pool.end();
}

wakeUpAndInitializeDatabase().catch(console.error);