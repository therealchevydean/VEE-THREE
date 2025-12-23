import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from root (../.env) if running from backend/
dotenv.config({ path: '../.env' });
dotenv.config(); // Fallback


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Heroku usually
    }
});

export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export const getPool = () => pool;
