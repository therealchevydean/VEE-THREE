import fs from 'fs';
import path from 'path';
import { getPool } from '../db';
import dotenv from 'dotenv';
import dns from 'dns';

// Load environment variables from root (VEE-THREE/.env)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) {
    console.error('[InitDB] FATAL: DATABASE_URL is not defined. Check .env path.');
    process.exit(1);
}

// Force IPv4 for Supabase stability (matching index.ts)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const runSchema = async () => {
    try {
        const schemaPath = path.resolve(__dirname, '../schema.sql');
        console.log(`[InitDB] Reading schema from ${schemaPath}...`);

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('[InitDB] Schema loaded. Executing...');

        const pool = getPool();
        await pool.query(schemaSql);

        console.log('[InitDB] Success! Database schema has been applied.');
        process.exit(0);
    } catch (err) {
        console.error('[InitDB] Error applying schema:', err);
        process.exit(1);
    }
};

runSchema();
