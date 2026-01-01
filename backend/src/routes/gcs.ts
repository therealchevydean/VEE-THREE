
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

/**
 * POST /api/gcs/upload
 * Upload a file to GCS
 * Body: multipart/form-data with 'file' field and optional 'path' field
 */
router.post('/upload', async (req, res) => {
  try {
    // TODO: Implement multipart file upload handling (requires multer or busboy)
    res.status(501).json({ status: 'error', message: 'Upload not yet implemented' });
  } catch (error) {
    console.error('API Error Upload File:', error);
    res.status(500).json({ status: 'error', message: 'Failed to upload file' });
  }
});

/**
 * POST /api/gcs/unzip
 * Unzip a file in GCS to a target folder
 * Body: { sourceFile: string, targetFolder: string }
 */
router.post('/unzip', async (req, res) => {
  try {
    // TODO: Implement unzip functionality (download zip, extract, upload files)
    res.status(501).json({ status: 'error', message: 'Unzip not yet implemented' });
  } catch (error) {
    console.error('API Error Unzip File:', error);
    res.status(500).json({ status: 'error', message: 'Failed to unzip file' });
  }
});

/**
 * POST /api/gcs/organize-chatgpt
 * Organize ChatGPT exported data structure
 * Body: { sourceFolder: string }
 */
router.post('/organize-chatgpt', async (req, res) => {
  try {
    const { sourceFolder } = req.body;
    if (!sourceFolder) {
      return res.status(400).json({ status: 'error', message: 'sourceFolder required' });
    }
    // TODO: Implement ChatGPT data organization
    res.status(501).json({ status: 'error', message: 'Organize ChatGPT not yet implemented' });
  } catch (error) {
    console.error('API Error Organize ChatGPT:', error);
    res.status(500).json({ status: 'error', message: 'Failed to organize ChatGPT data' });
  }
});

export default router;
