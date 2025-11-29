
import { ArchivedFile, GCSMetadata, GCSFileType } from '../types';

/**
 * =================================================================
 * VEE GCS MEMORY SERVICE — SIMULATION
 * =================================================================
 *
 * This service simulates a Google Cloud Storage (GCS) Bucket structure.
 * 
 * SCHEMA:
 * Bucket Name: "vee-memory" (Simulated via localStorage key)
 * Object Key Pattern: {projectId}/{type}/{filename}
 * 
 * Example:
 * v3_app/uploads/design_mockup.png
 * biofield/chat_logs/session_2024_05.txt
 */

const GCS_BUCKET_KEY = 'vee_gcs_bucket_sim';

// In-memory bucket representation
let gcsBucket: ArchivedFile[] = [];

const loadBucket = (): void => {
    try {
        const stored = localStorage.getItem(GCS_BUCKET_KEY);
        gcsBucket = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load GCS bucket sim from localStorage:", error);
        gcsBucket = [];
    }
};

const saveBucket = (): void => {
    try {
        localStorage.setItem(GCS_BUCKET_KEY, JSON.stringify(gcsBucket));
    } catch (error) {
        console.error("Failed to save GCS bucket sim to localStorage:", error);
    }
};

// Initialize bucket
loadBucket();

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

        resolve(null);
    });
};

/**
 * Simulates a GCS PutObject operation.
 */
export const uploadFile = async (file: File, projectId: string): Promise<void> => {
    const content = await readFileContent(file);
    const type = determineFileType(file.type);
    
    // Construct GCS Key: {projectId}/{type}/{filename}
    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const gcsPath = `${projectId}/${type}/${safeName}`;

    const metadata: GCSMetadata = {
        projectId,
        type,
        contentType: file.type,
        originalName: file.name,
        uploadedBy: 'user',
        description: 'Uploaded via VEE Web UI'
    };
    
    const newObject: ArchivedFile = {
        id: crypto.randomUUID(), // Generation ID
        gcsPath,
        name: file.name, // Display Name
        size: file.size,
        metadata,
        content: content,
        updated: new Date().toISOString(),
    };

    // Upsert (Overwrite if path exists, similar to GCS)
    const existingIndex = gcsBucket.findIndex(f => f.gcsPath === gcsPath);
    if (existingIndex >= 0) {
        gcsBucket[existingIndex] = newObject;
    } else {
        gcsBucket.push(newObject);
    }

    saveBucket();
    console.log(`[GCS Sim]: PutObject gs://vee-memory/${gcsPath}`);
};

/**
 * Simulates GCS ListObjects (Prefix Scan).
 * Only returns objects belonging to the specific projectId.
 */
export const listFiles = (projectId: string): ArchivedFile[] => {
    // Prefix scan: items starting with "projectId/"
    const prefix = `${projectId}/`;
    return gcsBucket
        .filter(file => file.gcsPath.startsWith(prefix))
        .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
};

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
export const searchFiles = async (query: string, projectId?: string): Promise<{ status: string; results: Partial<ArchivedFile>[] }> => {
    loadBucket();
    console.log(`[GCS Sim]: Search query "${query}" scoped to: ${projectId || 'GLOBAL'}`);
    const lowerCaseQuery = (query || '').toLowerCase();

    const results = gcsBucket
        .filter(file => {
            // Scope check
            if (projectId && file.metadata.projectId !== projectId) return false;
            
            // Content check
            return (
                file.name.toLowerCase().includes(lowerCaseQuery) ||
                (file.content && typeof file.content === 'string' && file.content.toLowerCase().includes(lowerCaseQuery))
            );
        })
        .map(file => ({
            id: file.id,
            gcsPath: file.gcsPath,
            name: file.name,
            size: file.size,
            updated: file.updated,
            metadata: file.metadata,
            contentSnippet: (file.content && file.metadata.type !== 'zip' && !file.metadata.contentType.startsWith('image/')) 
                ? file.content.substring(0, 150) + '...' 
                : null
        }));
        
    results.sort((a, b) => new Date(b.updated!).getTime() - new Date(a.updated!).getTime());

    return {
        status: 'success',
        results: results,
    };
};
