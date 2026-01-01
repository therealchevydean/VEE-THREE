import { ArchivedFile, GCSMetadata, GCSFileType } from '../types';
import JSZip from 'jszip';

const API_BASE = 'http://localhost:3001/api/gcs';

/**
 * Searches across the GCS bucket via Backend API.
 */
export const searchFiles = async (query: string, projectId?: string): Promise<{ status: string; results: Partial<ArchivedFile>[] }> => {
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                status: 'success',
                results: data.data.map((file: any) => ({
                    id: file.name, // Use name as ID for GCS
                    gcsPath: file.name,
                    name: file.name,
                    size: file.size,
                    updated: file.updated,
                    metadata: {
                        type: 'upload',
                        contentType: file.contentType,
                        projectId: projectId || 'global',
                        uploadedBy: 'system',
                        originalName: file.name,
                        description: ''
                    },
                    contentSnippet: null
                }))
            };
        }
        return { status: 'error', results: [] };
    } catch (error) {
        console.error("GCS Search Failed:", error);
        return { status: 'error', results: [] };
    }
};

/**
 * Lists files via Backend API
 */
export const listFiles = async (projectId: string): Promise<ArchivedFile[]> => {
    try {
        const response = await fetch(`${API_BASE}/list?prefix=${encodeURIComponent(projectId + '/')}`);
        const data = await response.json();

        if (data.status === 'success') {
            return data.data.map((file: any) => ({
                id: file.name,
                gcsPath: file.name,
                name: file.name,
                size: file.size,
                updated: file.updated,
                metadata: {
                    projectId,
                    type: 'upload',
                    contentType: file.contentType,
                    originalName: file.name,
                    uploadedBy: 'system',
                    description: ''
                },
                content: null
            }));
        }
        return [];
    } catch (error) {
        console.error("GCS List Failed:", error);
        return [];
    }
};

// Deprecated Simulation Methods (Stubbed to avoid breaking calls)
const loadBucket = (): void => { };
const saveBucket = (): void => { };

/**
 * Helper: Determines GCS File Type based on MIME type or context
 */
const determineFileType = (mimeType: string): GCSFileType => {
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'zip';
    return 'upload'; // Default for direct user uploads
};

/**
 * Reads file content (Base64 or Text)
 */
const readFileContent = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
            return;
        }

        const textLikeTypes = ['text/', 'application/json', 'application/javascript', 'application/xml'];
        if (textLikeTypes.some(type => file.type.startsWith(type)) || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
            return;
        }

        // Fallback: Read as Data URL (Base64) for all other types (PDF, Zip, etc.)
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
};

/**
 * Uploads a file via Backend API (to be implemented with signed URLs)
 */
export const uploadFile = async (file: File, projectId: string): Promise<void> => {
    console.warn("Upload to real GCS not yet implemented via frontend. Please use Console or Implement Signed URLs.");
    // TODO: Implement upload via Backend Signed URL
};

/**
 * Deletes a file via Backend API
 */
export const deleteFile = async (gcsPath: string): Promise<void> => {
    console.warn("Delete via backend API not yet implemented.");
    // TODO: Implement DELETE /api/gcs/:path endpoint
};

/**
 * Renames a file via Backend API
 */
export const renameFile = async (oldPath: string, newName: string): Promise<boolean> => {
    console.warn("Rename via backend API not yet implemented.");
    // TODO: Implement PATCH /api/gcs/rename endpoint
    return false;
};

/**
 * Search specifically in the Archive Bucket path
 */
export const searchChatGPTMemory = async (query: string, dateRange?: string, limit: number = 5) => {
    return searchFiles(query);
};

/**
 * Unzips an archived file - requires backend implementation
 */
export const unzipFile = async (gcsPath: string): Promise<string[]> => {
    throw new Error("Unzip via backend API not yet implemented. This requires server-side processing.");
    // TODO: Implement POST /api/gcs/unzip endpoint
};
