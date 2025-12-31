import express from 'express';
import * as TaskService from '../services/taskService';

const router = express.Router();

// GET /api/tasks?status=...&jobId=...
router.get('/', async (req, res) => {
    try {
        const { status, jobId } = req.query;
        const tasks = await TaskService.getTasks(
            jobId as string,
            status as string
        );
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const { related_job_id, category, description } = req.body;
        if (!category || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const task = await TaskService.createTask(related_job_id || null, category, description);
        res.json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body; // e.g., DONE
        if (!status) return res.status(400).json({ error: 'Missing status' });

        const task = await TaskService.updateTaskStatus(req.params.id, status);
        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

export default router;
