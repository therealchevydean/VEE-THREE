import { Connection, GithubRepo } from './authService';

/**
 * =================================================================
 * VEE BACKEND SERVICE — PRODUCTION
 * =================================================================
 * This service communicates with the real VEE backend.
 */

export const backendService = {
    /**
     * Gets the authorization URL from the backend.
     * Use flow=connect to indicate we want to link an account (popup), not just login.
     * @param service The service to connect to.
     */
    async getAuthUrl(service: 'google' | 'github' | 'vercel'): Promise<{ authorizationUrl: string }> {
        // The backend routes are /auth/google, /auth/github.
        // We append ?flow=connect so the backend knows to handle the callback as a popup message.
        const authorizationUrl = `/auth/${service}?flow=connect`;
        return Promise.resolve({ authorizationUrl });
    },

    /**
     * Handles the successful auth callback.
     * Since the backend now handles the token exchange and storage during the callback request,
     * the frontend just needs to acknowledge the success message.
     * 
     * @param service The service that called back.
     * @param code In the new flow, 'code' might just be a success flag or message.
     */
    async handleAuthCallback(service: 'google' | 'github' | 'vercel', code: string): Promise<Connection> {
        console.log(`[Backend Service]: Processing callback for ${service}`);

        // In the real flow, the backend has already stored the token and linked the user.
        // We can just return a success object. Ideally, we would fetch the updated connection status.

        // Construct a connection object based on the success.
        // In a more robust app, we'd fetch this from an endpoint like /api/connections
        const newConnection: Connection = {
            service,
            username: 'Linked Account', // We could fetch the specific username from an API if needed.
            token: 'stored_securely_on_backend',
            connectedAt: new Date().toISOString(),
        };

        return Promise.resolve(newConnection);
    },

    /**
     * Fetches GitHub repos via the backend proxy.
     */
    async getGithubRepos(): Promise<GithubRepo[]> {
        const response = await fetch('/api/integrations/github/repos');
        if (!response.ok) {
            throw new Error('Failed to fetch repos from backend');
        }
        const repos = await response.json();
        return repos;
    },
};
