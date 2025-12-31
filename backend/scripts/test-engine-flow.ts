import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:3001/api';

async function testEngineFlow() {
    try {
        console.log('🧪 Starting Engine Flow Test...');

        // 1. Create Job
        console.log('\n1. Creating LISTING Job...');
        const jobPayload = {
            pipeline_type: 'LISTING',
            input_summary: JSON.stringify({
                title: 'Retro Geocaching Beacon',
                details: 'A vintage-style GPS beacon used for geocaching. Brass finish. Working condition.',
                condition: 'Used - Good'
            }),
            source_asset_id: 'test-asset-001'
        };
        const createRes = await axios.post(`${BASE_URL}/jobs/create`, jobPayload);
        const job = createRes.data;
        console.log('✅ Job Created ID:', job.id);
        console.log('   Status:', job.status);

        // 2. Generate Draft
        console.log('\n2. Generating Draft (AI Pipeline)...');
        const genRes = await axios.post(`${BASE_URL}/jobs/generate/${job.id}`);
        const jobWithDraft = genRes.data;
        console.log('✅ Draft Generated!');
        console.log('   Title:', jobWithDraft.draft_output.title);
        console.log('   Price:', jobWithDraft.draft_output.suggested_price);

        // 3. Approve Job
        console.log('\n3. Approving Job...');
        const approveRes = await axios.post(`${BASE_URL}/jobs/approve/${job.id}`);
        const approvedJob = approveRes.data;
        console.log('✅ Job Approved!');
        console.log('   Status:', approvedJob.status);

        // 4. Verify Task Creation
        console.log('\n4. Verifying Real World Tasks...');
        const tasksRes = await axios.get(`${BASE_URL}/tasks?jobId=${job.id}`);
        const tasks = tasksRes.data;

        if (tasks.length > 0) {
            console.log(`✅ Found ${tasks.length} tasks!`);
            tasks.forEach((t: any) => {
                console.log(`   - [${t.status}] ${t.category}: ${t.description}`);
            });
        } else {
            console.error('❌ No tasks found! Logic hook failed.');
            process.exit(1);
        }

        console.log('\n✨ TEST PASSED!');
    } catch (error: any) {
        console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}

testEngineFlow();
