import { query } from '../src/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        console.log('Starting Engine DB Migration...');

        const sqlPath = path.resolve(__dirname, '../schema_engine.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log(`Reading SQL from: ${sqlPath}`);

        // Execute the SQL
        await query(sql);

        console.log('✅ Migration applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
