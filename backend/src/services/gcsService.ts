
import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Storage
// It will automatically look for GOOGLE_APPLICATION_CREDENTIALS env var
const storage = new Storage();

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'v3-architect-archive';

export interface GCSFile {
    name: string;
    updated: string;
    size: number;
    contentType: string;
    mediaLink?: string;
}

/**
 * List files in the bucket with an optional prefix.
 */
export const listFiles = async (prefix: string = ''): Promise<GCSFile[]> => {
    try {
        const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix });

        return files.map(file => ({
            name: file.name,
            updated: file.metadata.updated || new Date().toISOString(),
            size: parseInt(String(file.metadata.size) || '0'),
            contentType: file.metadata.contentType || 'application/octet-stream',
            mediaLink: file.metadata.mediaLink
        }));
    } catch (error) {
        console.error('Error listing GCS files:', error);
        throw error;
    }
};

/**
 * Search files by simple name matching (client-side filtering after listing).
 * Note: For large buckets, this is inefficient and should be replaced by a proper index.
 */
export const searchFiles = async (query: string): Promise<GCSFile[]> => {
    const allFiles = await listFiles(); // Lists everything! Be careful with large buckets.
    const lowerQuery = query.toLowerCase();

    return allFiles.filter(file => file.name.toLowerCase().includes(lowerQuery));
};

/**
 * Get a Read Stream for a file
 */
export const getFileStream = (filename: string) => {
    return storage.bucket(BUCKET_NAME).file(filename).createReadStream();
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (filename: string) => {
    const [metadata] = await storage.bucket(BUCKET_NAME).file(filename).getMetadata();
    return metadata;
};
