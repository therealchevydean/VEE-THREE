
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

/**
 * Upload a file to GCS
 */
export const uploadFile = async (destination: string, content: Buffer | string): Promise<void> => {
  try {
    const file = storage.bucket(BUCKET_NAME).file(destination);
    await file.save(content);
    console.log(`Uploaded file to ${destination}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from GCS
 */
export const deleteFile = async (filename: string): Promise<void> => {
  try {
    await storage.bucket(BUCKET_NAME).file(filename).delete();
    console.log(`Deleted file ${filename}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Copy a file within GCS
 */
export const copyFile = async (sourceFile: string, destinationFile: string): Promise<void> => {
  try {
    await storage.bucket(BUCKET_NAME).file(sourceFile).copy(storage.bucket(BUCKET_NAME).file(destinationFile));
    console.log(`Copied ${sourceFile} to ${destinationFile}`);
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

/**
 * Move a file within GCS (copy then delete)
 */
export const moveFile = async (sourceFile: string, destinationFile: string): Promise<void> => {
  try {
    await copyFile(sourceFile, destinationFile);
    await deleteFile(sourceFile);
    console.log(`Moved ${sourceFile} to ${destinationFile}`);
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
};

/**
 * Create a folder structure in GCS (by creating a marker file)
 */
export const createFolder = async (folderPath: string): Promise<void> => {
  try {
    // GCS doesn't have folders, but we can create a marker file
    const markerFile = folderPath.endsWith('/') ? `${folderPath}.keep` : `${folderPath}/.keep`;
    await uploadFile(markerFile, '');
    console.log(`Created folder marker at ${folderPath}`);
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Get bucket statistics
 */
export const getBucketStats = async (): Promise<{ totalFiles: number; totalSize: number }> => {
  try {
    const [files] = await storage.bucket(BUCKET_NAME).getFiles();
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + parseInt(String(file.metadata.size) || '0'), 0);
    return { totalFiles, totalSize };
  } catch (error) {
    console.error('Error getting bucket stats:', error);
    throw error;
  }
};
