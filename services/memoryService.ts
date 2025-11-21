/**
 * =================================================================
 * VEE PERSISTENT MEMORY SERVICE — SIMULATION
 * =================================================================
 *
 * This service simulates a vector database for VEE's long-term memory.
 * In a production environment, this would be replaced with a real vector database
 * like Supabase (using pgvector), Pinecone, or a self-hosted solution.
 *
 * --- HOW IT WORKS (IN PRODUCTION) ---
 *
 * 1.  **Committing to Memory (Embedding & Storing):**
 *     - When the `commit` function is called, the input `data` (a string) is first
 *       sent to an embedding model (e.g., Google's `text-embedding-004`).
 *     - This model converts the text into a high-dimensional vector (a list of numbers)
 *       that captures its semantic meaning.
 *     - This vector, along with the original text and a timestamp, is then stored
 *       as an entry in the vector database.
 *
 * 2.  **Recalling from Memory (Semantic Search):**
 *     - When the `recall` function is called with a `query`, the query text is also
 *       converted into a vector using the same embedding model.
 *     - The vector database is then queried to find the stored vectors that are
 *       "closest" to the query vector (using a similarity metric like cosine similarity).
 *     - The database returns the original text entries associated with these top N
 *       most similar vectors. This is "semantic search."
 *
 * This simulation uses a simple in-memory array and basic keyword matching to mimic
 * the functionality. It effectively demonstrates the tool-use pattern for VEE
 * while allowing for a seamless upgrade to a real vector DB in the future.
 */

export interface MemoryEntry {
    id: string;
    timestamp: string;
    content: string;
    // In a real implementation, a vector would be stored here:
    // vector: number[];
}

const MEMORY_STORAGE_KEY = 'vee_persistent_memory';

// In-memory store, loaded from localStorage to persist across sessions.
let vectorStore: MemoryEntry[] = [];

const loadMemory = (): void => {
    try {
        const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
        vectorStore = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load memory from localStorage:", error);
        vectorStore = [];
    }
};

const saveMemory = (): void => {
    try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(vectorStore));
    } catch (error) {
        console.error("Failed to save memory to localStorage:", error);
    }
};

// Initialize memory on module load.
loadMemory();


/**
 * Saves a piece of information to the simulated vector store.
 * @param data The text content to store in memory.
 * @returns A confirmation message.
 */
export const commit = async (data: string): Promise<{ status: string; message: string }> => {
    console.log(`Committing to memory: "${data}"`);
    
    const newEntry: MemoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        content: data,
    };

    vectorStore.push(newEntry);
    saveMemory();
    
    return {
        status: 'success',
        message: 'Acknowledged. The information has been committed to my persistent memory.'
    };
};

/**
 * Recalls information from the simulated vector store based on a query.
 * This uses simple keyword matching to simulate semantic search.
 * @param query The search query.
 * @returns An object containing the results.
 */
export const recall = async (query: string): Promise<{ status: string; results: MemoryEntry[] }> => {
    console.log(`Recalling from memory with query: "${query}"`);
    const queryWords = query.toLowerCase().split(/\s+/);

    // Simulate semantic search with keyword matching and a simple relevance score.
    const scoredResults = vectorStore.map(entry => {
        const contentWords = entry.content.toLowerCase().split(/\s+/);
        const score = queryWords.reduce((acc, word) => {
            return acc + (contentWords.includes(word) ? 1 : 0);
        }, 0);
        return { ...entry, score };
    }).filter(entry => entry.score > 0);

    // Sort by score (desc) and then by timestamp (desc)
    scoredResults.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Return the top 3 most relevant results.
    const topResults = scoredResults.slice(0, 3);
    
    return {
        status: 'success',
        results: topResults,
    };
};
