/**
 * =================================================================
 * VEE PERSISTENT MEMORY SERVICE
 * =================================================================
 *
 * This service connects to the VEE Backend to store and recall long-term memories
 * using a PostgreSQL vector database.
 */

export interface MemoryEntry {
    id: string;
    timestamp: string;
    content: string;
    score?: number;
}

/**
 * Saves a piece of information to the backend memory store.
 * @param data The text content to store in memory.
 * @returns A confirmation message.
 */
export const commit = async (data: string): Promise<{ status: string; message: string }> => {
    console.log(`Committing to memory (Backend): "${data}"`);

    try {
        const response = await fetch('/api/memory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: data,
                type: 'general',
                metadata: {}
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        return {
            status: 'success',
            message: 'Acknowledged. The information has been committed to my persistent knowledge base.'
        };
    } catch (error) {
        console.error("Failed to commit to memory:", error);
        return {
            status: 'error',
            message: 'Failed to commit memory. Please ensure the backend is connected.'
        };
    }
};

/**
 * Recalls information from the backend memory store based on a query.
 * @param query The search query.
 * @returns An object containing the results.
 */
export const recall = async (query: string): Promise<{ status: string; results: MemoryEntry[] }> => {
    console.log(`Recalling from memory (Backend) with query: "${query}"`);

    try {
        const response = await fetch('/api/memory/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        const data = await response.json();

        // Map backend results to MemoryEntry interface
        const results: MemoryEntry[] = data.results.map((item: any) => ({
            id: item.id,
            timestamp: item.created_at,
            content: item.content,
            score: item.distance ? 1 - item.distance : undefined // Convert distance to similarity if needed
        }));

        return {
            status: 'success',
            results,
        };
    } catch (error) {
        console.error("Failed to recall from memory:", error);
        return {
            status: 'error',
            results: [],
        };
    }
};
