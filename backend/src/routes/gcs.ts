
import express from 'express';
import { listFiles, searchFiles, getFileStream, getFileMetadata } from '../services/gcsService';

const router = express.Router();

/**
 * GET /api/gcs/list
 * Query Params: prefix (optional)
 */
router.get('/list', async (req, res) => {
    try {
        const prefix = req.query.prefix as string || '';
        const files = await listFiles(prefix);
        res.json({ status: 'success', data: files });
    } catch (error) {
        console.error('API Error Listing Files:', error);
        res.status(500).json({ status: 'error', message: 'Failed to list files' });
    }
});

/**
 * GET /api/gcs/search
 * Query Params: q (required)
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ status: 'error', message: 'Query parameter "q" is required' });
        }
        const results = await searchFiles(query);
        res.json({ status: 'success', data: results });
    } catch (error) {
        console.error('API Error Search Files:', error);
        res.status(500).json({ status: 'error', message: 'Failed to search files' });
    }
});

/**
 * GET /api/gcs/file/*
 * Wildcard to handle filenames with slashes
 */
router.get('/file/*', async (req, res) => {
    try {
        // Extract filename from the wildcard param (req.params[0])
        const filename = (req.params as any)[0];
        if (!filename) {
            return res.status(400).json({ status: 'error', message: 'Filename required' });
        }

        // Get Metadata first to set Content-Type
        const metadata = await getFileMetadata(filename);
        res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');

        // Pipe stream
        const readStream = getFileStream(filename);
        readStream.pipe(res);

    } catch (error) {
        console.error('API Error Get File:', error);
        res.status(404).json({ status: 'error', message: 'File not found' });
    }
});

export default router;
