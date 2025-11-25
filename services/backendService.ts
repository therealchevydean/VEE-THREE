
import { Connection, GithubRepo } from './authService';

/**
 * =================================================================
 * VEE BACKEND SERVICE — SIMULATION
 * =================================================================
 * This service simulates the VEE backend server. In a real application,
 * the functions here would be API endpoints that the frontend calls via HTTP.
 */

const MOCK_USERNAMES = {
    google: 'josh.ewing@v3.io',
    github: 'therealchevydean',
    vercel: 'josh-v3',
};

// Simulate a database of tokens, which would be managed by the backend.
const tokenDatabase: Partial<Record<'google' | 'github' | 'vercel', Connection>> = {};

export const backendService = {
    /**
     * Simulates the backend generating an authorization URL.
     * @param service The service to connect to.
     */
    async getAuthUrl(service: 'google' | 'github' | 'vercel'): Promise<{ authorizationUrl: string }> {
        console.log(`[Backend Sim]: Generating auth URL for ${service}...`);
        // In a real backend, this would construct the real OAuth URL.
        // The URL would point back to our backend's callback endpoint.
        // This script sends a message back to the parent window to complete the flow.
        const callbackUrl = `javascript:
            window.opener.postMessage({ 
                type: 'auth-callback', 
                service: '${service}', 
                code: 'mock_auth_code_${crypto.randomUUID()}' 
            }, '*');
            // A brief delay to ensure the message is sent before closing.
            setTimeout(() => window.close(), 100);`;
            
        return Promise.resolve({ authorizationUrl: callbackUrl });
    },

    /**
     * Simulates the backend's OAuth callback handler.
     * @param service The service that called back.
     * @param code The authorization code from the provider.
     */
    async handleAuthCallback(service: 'google' | 'github' | 'vercel', code: string): Promise<Connection> {
        console.log(`[Backend Sim]: Handling callback for ${service} with code: ${code}`);
        // A real backend would exchange the code for an access token here.
        // It would then encrypt and store the token.
        const newConnection: Connection = {
            service,
            username: MOCK_USERNAMES[service],
            // This represents a secure session token issued by our backend.
            token: `mock_session_token_${service}_${crypto.randomUUID()}`, 
            connectedAt: new Date().toISOString(),
        };
        
        tokenDatabase[service] = newConnection;
        console.log(`[Backend Sim]: Stored connection for ${service}.`);
        return Promise.resolve(newConnection);
    },

    /**
     * Simulates the backend fetching GitHub repos via its proxy.
     */
    async getGithubRepos(): Promise<GithubRepo[]> {
        console.log('[Backend Sim]: Request to fetch GitHub repos received.');
        if (!tokenDatabase.github) {
            throw new Error("GitHub account is not connected.");
        }
        // In a real backend, this would call the `apiProxyService` which uses the stored token.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return [
            { name: 'v3-app', url: `https://github.com/${tokenDatabase.github.username}/v3-app` },
            { name: 'mobx-token-contracts', url: `https://github.com/${tokenDatabase.github.username}/mobx-token-contracts` },
            { name: 'architect-revelations-site', url: `https://github.com/${tokenDatabase.github.username}/architect-revelations-site` },
            { name: 'vee-ai-assistant', url: `https://github.com/${tokenDatabase.github.username}/vee-ai-assistant` },
        ];
    },
};
