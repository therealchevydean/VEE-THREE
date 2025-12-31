import dotenv from 'dotenv';
import path from 'path';
// Load env before importing pipelines
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import * as Pipelines from '../src/pipelines/index';

async function testGemini() {
    try {
        console.log('Testing Gemini Integration...');
        console.log('API Key Present?', !!process.env.VITE_GEMINI_API_KEY);

        const input = {
            assetSummary: 'A cool new AI feature for VEE',
            platform: 'Twitter',
            toneHint: 'Excited'
        };

        const result = await Pipelines.generateSocialPostDraft(input);
        console.log('✅ Generation Success:', result);
    } catch (error) {
        console.error('❌ Generation Failed:', error);
    }
}

testGemini();
