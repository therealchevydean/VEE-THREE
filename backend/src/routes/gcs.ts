
import express from 'express';
import { listFiles, searchFiles, getFileStream, getFileMetadata, uploadFile, deleteFile, copyFile, moveFile, createFolder, getBucketStats } from '../services/gcsService';
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

/**
 * GET /api/gcs/stats
 * Get bucket statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getBucketStats();
    res.json({ status: 'success', data: stats });
  } catch (error) {
    console.error('API Error Get Stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get bucket stats' });
  }
});

/**
 * POST /api/gcs/delete
 * Delete a file
 * Body: { filename: string }
 */
router.post('/delete', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ status: 'error', message: 'filename required' });
    }
    await deleteFile(filename);
    res.json({ status: 'success', message: `Deleted ${filename}` });
  } catch (error) {
    console.error('API Error Delete File:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete file' });
  }
});

/**
 * POST /api/gcs/copy
 * Copy a file
 * Body: { sourceFile: string, destinationFile: string }
 */
router.post('/copy', async (req, res) => {
  try {
    const { sourceFile, destinationFile } = req.body;
    if (!sourceFile || !destinationFile) {
      return res.status(400).json({ status: 'error', message: 'sourceFile and destinationFile required' });
    }
    await copyFile(sourceFile, destinationFile);
    res.json({ status: 'success', message: `Copied ${sourceFile} to ${destinationFile}` });
  } catch (error) {
    console.error('API Error Copy File:', error);
    res.status(500).json({ status: 'error', message: 'Failed to copy file' });
  }
});

/**
 * POST /api/gcs/move
 * Move a file
 * Body: { sourceFile: string, destinationFile: string }
 */
router.post('/move', async (req, res) => {
  try {
    const { sourceFile, destinationFile } = req.body;
    if (!sourceFile || !destinationFile) {
      return res.status(400).json({ status: 'error', message: 'sourceFile and destinationFile required' });
    }
    await moveFile(sourceFile, destinationFile);
    res.json({ status: 'success', message: `Moved ${sourceFile} to ${destinationFile}` });
  } catch (error) {
    console.error('API Error Move File:', error);
    res.status(500).json({ status: 'error', message: 'Failed to move file' });
  }
});

export default router;
