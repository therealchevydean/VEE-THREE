
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
const CHATGPT_ARCHIVE_BUCKET = 'v3-architect-archive';

// In-memory bucket representation
let gcsBucket: ArchivedFile[] = [];

// MOCK DATA: ChatGPT Archive (Read-Only simulation)
const mockChatGPTArchive = [
    {
        id: 'chat-2022-11-15',
        date: '2022-11-15',
        title: 'Initial V3 Concept Brainstorm',
        content: 'User: I want to build a movement called V3. Vice Versa Vision. It needs to be about rare earths and national revival.\nChatGPT: That sounds powerful. We could structure it around the periodic table and alchemy. Turning lead to gold, but essentially turning waste into value.'
    },
    {
        id: 'chat-2023-03-22',
        date: '2023-03-22',
        title: 'Biofield Protocol Architecture',
        content: 'User: How do we integrate frequency tech with blockchain?\nChatGPT: We can use the metadata of the NFT to store frequency signatures. The "Biofield Protocol" could be the oracle that validates the human state before minting.'
    },
    {
        id: 'chat-2023-08-10',
        date: '2023-08-10',
        title: 'Tokin Franks Character Dev',
        content: 'User: Need a funny dog character. A pug. Named Frank.\nChatGPT: Frank the Pug. He should be a bit cynical, smoking, watching the world burn but making jokes about it. His sidekick is Chunk, an AI dog who takes everything literally.'
    },
    {
        id: 'chat-2024-01-05',
        date: '2024-01-05',
        title: 'MOBX Tokenomics Draft',
        content: 'User: MOBX needs to be mined by moving. Geomining.\nChatGPT: Proof of Location work. We can use a hex grid map. Users claim tiles. The "Sigil" NFTs act as multipliers for the mining rate.'
    },
    {
        id: 'chat-2024-02-14',
        date: '2024-02-14',
        title: 'Divine Signal Blueprint',
        content: 'User: The spiritual aspect is key. Divine Signal.\nChatGPT: It is the broadcast. The interruption of the noise. The red pill. We should model the app interface like a radio tuner finding a clear signal.'
    }
];


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

/**
 * NEW: Searches Josh's ChatGPT Memory Archive
 * Simulates reading from gs://v3-architect-archive/ChatGPT_Data/
 */
export const searchChatGPTMemory = async (query: string, dateRange?: string, limit: number = 5) => {
    console.log(`[GCS Sim]: Searching bucket '${CHATGPT_ARCHIVE_BUCKET}' prefix 'ChatGPT_Data/' for: "${query}"`);

    const lowerQuery = query.toLowerCase();

    // Simulate scoring/ranking
    const scoredResults = mockChatGPTArchive.map(entry => {
        let score = 0;
        if (entry.title.toLowerCase().includes(lowerQuery)) score += 10;
        if (entry.content.toLowerCase().includes(lowerQuery)) score += 5;
        return { ...entry, score };
    }).filter(r => r.score > 0);

    // Sort by score
    scoredResults.sort((a, b) => b.score - a.score);

    return {
        status: 'success',
        source: `gs://${CHATGPT_ARCHIVE_BUCKET}/ChatGPT_Data/`,
        results: scoredResults.slice(0, limit)
    };
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
