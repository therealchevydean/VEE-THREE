
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { listFiles } from '../src/services/gcsService';

async function verifyGCS() {
    console.log('--- Starting GCS Verification ---');
    console.log(`Bucket Name: ${process.env.GCS_BUCKET_NAME || 'Not set (using default)'}`);
    console.log(`Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Not set'}`);

    try {
        console.log('Attempting to list files (limit 5)...');
        const files = await listFiles('');

        console.log(`\nSUCCESS! Found ${files.length} files.`);
        console.log('--- File Sample ---');
        files.slice(0, 5).forEach(f => console.log(`- ${f.name} (${f.size} bytes)`));

    } catch (error) {
        console.error('\nFAILED to list files.');
        console.error('Error details:', error);
    }
}

verifyGCS();
