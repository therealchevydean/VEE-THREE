import { ArchivedFile } from '../types';

/**
 * =================================================================
 * VEE CREATIVE ARCHIVE SERVICE — SIMULATION
 * =================================================================
 *
 * This service simulates a persistent file storage system, like a cloud
 * bucket (e.g., Google Cloud Storage, AWS S3), for VEE's Creative Archive.
 *
 * --- HOW IT WORKS (IN PRODUCTION) ---
 * 1.  **Uploading:** When a file is uploaded, the frontend would get a secure,
 *     signed URL from the backend. The frontend then uploads the file directly
 *     to the cloud bucket using that URL. Once complete, it notifies the backend,
 *     which saves the file's metadata (name, type, size, storage path) to a
 *     database (e.g., PostgreSQL).
 *
 * 2.  **Indexing & Search:** The backend would index the metadata. For text-based
 *     files, it could also extract the content, create vector embeddings, and
 *     store them in a vector database to enable semantic search on file contents.
 *
 * 3.  **Listing/Retrieving:** The frontend fetches the list of file metadata from
 *     the backend. To view a file, it would request another secure URL to download it.
 *
 * This simulation uses `localStorage` to manage the file metadata and store the
 * content of text-based files directly, providing a functional mock for development.
 */

const ARCHIVE_STORAGE_KEY = 'vee_creative_archive';

// In-memory store, loaded from localStorage to persist across sessions.
let fileStore: ArchivedFile[] = [];

const loadArchive = (): void => {
    try {
        const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        fileStore = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load creative archive from localStorage:", error);
        fileStore = [];
    }
};

const saveArchive = (): void => {
    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(fileStore));
    } catch (error) {
        console.error("Failed to save creative archive to localStorage:", error);
    }
};

// Initialize archive on module load.
loadArchive();

/**
 * Reads the content of a file and returns it as a string.
 * Supports text files (text content) and image files (base64 data URL).
 */
const readFileContent = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
        // Handle Images for Preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
            return;
        }

        // Handle Text-based files
        const textLikeTypes = ['text/', 'application/json', 'application/javascript', 'application/xml', 'application/x-typescript'];
        if (textLikeTypes.some(type => file.type.startsWith(type)) || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
             const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target?.result as string);
            };
            reader.onerror = () => {
                resolve(null);
            };
            reader.readAsText(file);
            return;
        }

        // Binary/Unsupported types
        resolve(null);
    });
};

/**
 * Simulates uploading a file to the archive.
 * @param file The file to upload.
 */
export const uploadFile = async (file: File): Promise<void> => {
    const content = await readFileContent(file);
    
    const newArchivedFile: ArchivedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        content: content,
        uploadedAt: new Date().toISOString(),
    };

    fileStore.push(newArchivedFile);
    saveArchive();
    console.log(`[Archive Sim]: Uploaded and indexed file "${file.name}".`);
};

/**
 * Lists all files currently in the archive.
 * @returns An array of ArchivedFile objects.
 */
export const listFiles = (): ArchivedFile[] => {
    // Return a sorted list, newest first
    return [...fileStore].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

/**
 * Deletes a file from the archive.
 * @param id The ID of the file to delete.
 */
export const deleteFile = (id: string): void => {
    const initialLength = fileStore.length;
    fileStore = fileStore.filter(file => file.id !== id);
    if (fileStore.length < initialLength) {
        saveArchive();
        console.log(`[Archive Sim]: Deleted file with ID "${id}".`);
    }
};

/**
 * Renames a file in the archive.
 * @param id The ID of the file to rename.
 * @param newName The new name for the file.
 * @returns True if successful, false otherwise.
 */
export const renameFile = (id: string, newName: string): boolean => {
    const fileIndex = fileStore.findIndex(file => file.id === id);
    if (fileIndex > -1) {
        fileStore[fileIndex].name = newName;
        saveArchive();
        console.log(`[Archive Sim]: Renamed file with ID "${id}" to "${newName}".`);
        return true;
    }
    console.warn(`[Archive Sim]: Could not find file with ID "${id}" to rename.`);
    return false;
};

/**
 * Searches the archive for files matching a query.
 * This simulates metadata and (for text files) content search.
 * @param query The search query.
 * @returns A promise that resolves to an object containing the results.
 */
export const searchFiles = async (query: string): Promise<{ status: string; results: Partial<ArchivedFile>[] }> => {
    // Force a reload from localStorage to ensure the in-memory cache is not stale.
    loadArchive();

    console.log(`[Archive Sim]: Searching archive for "${query}"`);
    const lowerCaseQuery = (query || '').toLowerCase();

    const results = fileStore
        .filter(file => 
            !lowerCaseQuery || // If query is empty/null, match everything
            file.name.toLowerCase().includes(lowerCaseQuery) ||
            (file.type.startsWith('text') && file.content && file.content.toLowerCase().includes(lowerCaseQuery))
        )
        .map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: file.uploadedAt,
            // Include a snippet of content if it's a text file and matches
            contentSnippet: (file.type.startsWith('text') && file.content) ? file.content.substring(0, 150) + '...' : null
        }));
        
    // Sort results by upload date, newest first
    results.sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime());

    return {
        status: 'success',
        results: results,
    };
};
