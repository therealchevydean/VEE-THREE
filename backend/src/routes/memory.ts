import express from 'express';
import { query } from '../db';
// In future, import embedding service

const router = express.Router();

// Mock embedding function until Gemini embedding is hooked up
const getEmbedding = async (text: string) => {
    // Return dummy 768-dim vector
    return new Array(768).fill(0.1);
};

// Store Memory
router.post('/', async (req, res) => {
    try {
        const { content, type, metadata } = req.body;

        // TODO: Generate embedding using Gemini
        // const embedding = await getEmbedding(content);

        // For now, simpler insertion without vector or dummy vector if schema requires it
        // We will just store content. If schema enforces vector, we need dummy.
        // Assuming schema has 'embedding vector(768)', we need to pass a formatted string or similar.
        // pgvector format is '[1,2,3]'

        const embedding = JSON.stringify(await getEmbedding(content));

        const result = await query(
            `INSERT INTO memory (content, type, metadata, embedding) VALUES ($1, $2, $3, $4) RETURNING *`,
            [content, type, metadata, embedding]
        );

        res.json({ status: 'success', memory: result.rows[0] });
    } catch (e) {
        console.error("Memory Store Error:", e);
        res.status(500).json({ error: 'Failed to store memory' });
    }
});

// Search Memory
router.post('/search', async (req, res) => {
    try {
        const { query: searchText } = req.body;

        // Mock Search
        const embedding = JSON.stringify(await getEmbedding(searchText));

        // Start with simple text search or vector search if PGVECTOR is active
        // Using vector search operator <-> (L2 distance)
        const result = await query(
            `SELECT *, embedding <-> $1 as distance FROM memory ORDER BY distance ASC LIMIT 5`,
            [embedding]
        );

        res.json({ results: result.rows });
    } catch (e) {
        console.error("Memory Search Error:", e);
        // Fallback or empty
        res.json({ results: [] });
    }
});

export default router;
