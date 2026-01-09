import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MemoryEntry {
    content: string;
    userId?: number;
    type?: string;
    metadata?: any;
}

/**
 * Commits a new memory to the database.
 */
export async function commit(entry: MemoryEntry) {
    try {
        const memory = await prisma.memory.create({
            data: {
                content: entry.content,
                userId: entry.userId,
                type: entry.type || 'general',
                metadata: entry.metadata || {},
            },
        });
        return memory;
    } catch (error) {
        console.error('Failed to commit memory:', error);
        throw error;
    }
}

/**
 * Retrieves memories for a specific user.
 */
export async function getMemories(userId?: number) {
    try {
        return await prisma.memory.findMany({
            where: userId ? { userId } : {},
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Failed to fetch memories:', error);
        throw error;
    }
}

/**
 * Searches memories (stub for vector search).
 */
export async function searchMemories(queryStr: string, userId?: number) {
    try {
        // Basic text search until pgvector logic is fully implemented
        return await prisma.memory.findMany({
            where: {
                userId: userId,
                content: {
                    contains: queryStr,
                    mode: 'insensitive',
                },
            },
            take: 10,
        });
    } catch (error) {
        console.error('Failed to search memories:', error);
        throw error;
    }
}
