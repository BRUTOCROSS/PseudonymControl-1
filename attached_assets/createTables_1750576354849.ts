import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './shared/schema';
import dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config();

// Use the new Replit-provisioned PostgreSQL database
const dbURL = process.env.DATABASE_URL;
console.log('Using database connection string:', dbURL ? 'DATABASE_URL is set' : 'DATABASE_URL is not set');

async function createTables() {
  if (!dbURL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: dbURL });
  const db = drizzle(pool, { schema });

  try {
    console.log('Creating tables...');
    
    // Create enums
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE IF NOT EXISTS complaint_status AS ENUM ('pending', 'resolved', 'escalated');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE IF NOT EXISTS complaint_category AS ENUM ('hr', 'infrastructure', 'management', 'cafeteria', 'security', 'other');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        pseudonym TEXT NOT NULL,
        organization_id INTEGER,
        access_key TEXT NOT NULL UNIQUE,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create organizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        access_key TEXT NOT NULL UNIQUE,
        description TEXT,
        threshold_percentage INTEGER NOT NULL DEFAULT 15,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create complaints table 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        organization_id INTEGER NOT NULL,
        category complaint_category NOT NULL,
        status complaint_status NOT NULL DEFAULT 'pending',
        similarity_group TEXT,
        escalated BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create feedbacks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        organization_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables().catch(console.error);