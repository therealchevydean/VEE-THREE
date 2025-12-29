
import { ArchivedFile, GCSMetadata, GCSFileType } from '../types';

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
 * Simulates a GCS PutObject operation.
 */
export const uploadFile = async (file: File, projectId: string): Promise<void> => {
    console.warn("Upload to real GCS not yet implemented via frontend. Please use Console or Implement Signed URLs.");
    // TODO: Implement upload via Backend Signed URL
};

/**
 * Simulates GCS ListObjects (Prefix Scan).
 * Only returns objects belonging to the specific projectId.
 */
// Replaced by new listFiles above

/**
 * Deletes an object.
 */
export const deleteFile = (gcsPath: string): void => {
    const initialLength = gcsBucket.length;
    gcsBucket = gcsBucket.filter(file => file.gcsPath !== gcsPath);
    if (gcsBucket.length < initialLength) {
        saveBucket();
        console.log(`[GCS Sim]: DeleteObject gs://vee-memory/${gcsPath}`);
    }
};

/**
 * Renames a file (Simulates Copy + Delete).
 */
export const renameFile = (oldPath: string, newName: string): boolean => {
    const fileIndex = gcsBucket.findIndex(file => file.gcsPath === oldPath);
    if (fileIndex > -1) {
        const file = gcsBucket[fileIndex];
        // Reconstruct path with new filename
        const pathParts = file.gcsPath.split('/');
        pathParts[pathParts.length - 1] = newName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const newPath = pathParts.join('/');

        gcsBucket[fileIndex] = {
            ...file,
            gcsPath: newPath,
            name: newName
        };
        saveBucket();
        return true;
    }
    return false;
};

/**
 * Searches across the entire bucket (or scoped to project).
 */
// Replaced by new searchFiles above

/**
 * NEW: Searches Josh's ChatGPT Memory Archive
 * Simulates reading from gs://v3-architect-archive/ChatGPT_Data/
 */
/**
 * Search specifically in the Archive Bucket path
 */
export const searchChatGPTMemory = async (query: string, dateRange?: string, limit: number = 5) => {
    return searchFiles(query); // Reuse main search for now, relying on GCS prefix if needed or just global search
};

/**
 * Unzips an archived file and stores contents as new files.
 */
import JSZip from 'jszip';

export const unzipFile = async (gcsPath: string): Promise<string[]> => {
    const fileIndex = gcsBucket.findIndex(f => f.gcsPath === gcsPath);
    if (fileIndex === -1) {
        throw new Error(`File not found: ${gcsPath}`);
    }

    const file = gcsBucket[fileIndex];
    if (!file.content) {
        throw new Error(`File has no content: ${gcsPath}`);
    }

    // Extract Base64 data
    const base64Data = file.content.split(',')[1];
    if (!base64Data) {
        throw new Error(`Invalid content format for: ${gcsPath}`);
    }

    try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(base64Data, { base64: true });
        const newFiles: string[] = [];
        const projectId = file.metadata.projectId;

        // Iterate and save files
        const promises: Promise<void>[] = [];

        loadedZip.forEach((relativePath, zipEntry) => {
            if (zipEntry.dir) return; // Skip directories

            const promise = async () => {
                const contentBlob = await zipEntry.async('blob');
                // Convert Blob to Base64 Data URL for storage
                const reader = new FileReader();
                const base64Content = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(contentBlob);
                });

                // Construct new path: {projectId}/upload/{zipName}/{relativePath}
                // Sanitize zip name to use as folder
                const zipFolderName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, '_');
                const safeRelativePath = relativePath.split('/').map(p => p.replace(/[^a-zA-Z0-9.-]/g, '_')).join('/');

                const newGcsPath = `${projectId}/upload/${zipFolderName}/${safeRelativePath}`;

                const newFile: ArchivedFile = {
                    id: crypto.randomUUID(),
                    gcsPath: newGcsPath,
                    name: zipEntry.name.split('/').pop() || zipEntry.name,
                    size: (zipEntry as any)._data.uncompressedSize || 0,
                    updated: new Date().toISOString(),
                    content: base64Content,
                    metadata: {
                        projectId,
                        type: 'upload',
                        contentType: 'application/octet-stream', // Generic fallback
                        originalName: zipEntry.name,
                        uploadedBy: 'vee_agent',
                        description: `Extracted from ${file.name}`
                    }
                };

                // Upsert
                const existingIdx = gcsBucket.findIndex(f => f.gcsPath === newGcsPath);
                if (existingIdx >= 0) {
                    gcsBucket[existingIdx] = newFile;
                } else {
                    gcsBucket.push(newFile);
                }
                newFiles.push(newGcsPath);
            };
            promises.push(promise());
        });

        await Promise.all(promises);
        saveBucket();
        console.log(`[GCS Sim]: Unzipped ${gcsPath} -> ${newFiles.length} files.`);
        return newFiles;

    } catch (error) {
        console.error("Unzip failed:", error);
        throw new Error(`Failed to unzip file: ${(error as Error).message}`);
    }
};
