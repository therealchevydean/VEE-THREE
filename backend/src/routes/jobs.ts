import express from 'express';
import * as JobService from '../services/jobService';

const router = express.Router();

// GET /api/jobs?status=...&type=...
router.get('/', async (req, res) => {
    try {
        const { status, type } = req.query;
        const jobs = await JobService.getJobs(
            status as string,
            type as string
        );
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// POST /api/jobs/create
router.post('/create', async (req, res) => {
    try {
        const { pipeline_type, input_summary, source_asset_id } = req.body;
        if (!pipeline_type || !input_summary) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const job = await JobService.createJob(pipeline_type, input_summary, source_asset_id);
        res.json(job);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// POST /api/jobs/generate/:id
router.post('/generate/:id', async (req, res) => {
    try {
        const job = await JobService.generateJobDraft(req.params.id);
        res.json(job);
    } catch (error) {
        console.error('Error generating draft:', error);
        res.status(500).json({ error: 'Failed to generate draft' });
    }
});

// POST /api/jobs/approve/:id
router.post('/approve/:id', async (req, res) => {
    try {
        const job = await JobService.updateJobStatus(req.params.id, 'APPROVED');
        res.json(job);
    } catch (error) {
        console.error('Error approving job:', error);
        res.status(500).json({ error: 'Failed to approve job' });
    }
});

export default router;
