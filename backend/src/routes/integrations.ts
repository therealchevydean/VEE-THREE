import express from 'express';
import axios from 'axios';
import { query } from '../db';

const router = express.Router();

// Middleware to ensure user is authenticated
const ensureAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

router.use(ensureAuth);

/**
 * Get GitHub Repos
 */
router.get('/github/repos', async (req, res) => {
    try {
        const userId = (req.user as any).id;

        // Retrieve token from DB
        const result = await query('SELECT tokens FROM users WHERE id = $1', [userId]);
        const tokens = result.rows[0]?.tokens;
        const githubToken = tokens?.github;

        if (!githubToken) {
            return res.status(400).json({ error: 'GitHub not connected' });
        }

        // Fetch Repos from GitHub
        const githubResponse = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=10', {
            headers: {
                Authorization: `token ${githubToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const repos = githubResponse.data.map((repo: any) => ({
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language
        }));

        res.json(repos);

    } catch (error: any) {
        console.error('GitHub API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch GitHub repos' });
    }
});

export default router;
