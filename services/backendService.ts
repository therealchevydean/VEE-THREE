import { Connection, GithubRepo } from './authService';

/**
 * =================================================================
 * VEE BACKEND SERVICE — SIMULATION
 * =================================================================
 * This service simulates the VEE backend server. In a real application,
 * the functions here would be API endpoints that the frontend calls via HTTP.
 */

const MOCK_USERNAMES = {
  google: 'ewingjoshua.v3prototype@gmail.com',
  github: 'ewingjoshua.v3prototype@gmail.com', // Assuming this email maps to your GitHub for the prototype
  vercel: 'ewingjoshua.v3prototype@gmail.com',
};

// Simulate a database of tokens, which would be managed by the backend.
const tokenDatabase: Partial<Record<'google' | 'github' | 'vercel', Connection>> = {};

// Load persisted connections from localStorage on initialization
const loadPersistedConnections = () => {
  try {
    const stored = localStorage.getItem('vee_connections');
    if (stored) {
      const connections = JSON.parse(stored);
      Object.entries(connections).forEach(([key, conn]: [string, any]) => {
        if (conn) {
          tokenDatabase[key as 'google' | 'github' | 'vercel'] = conn;
        }
      });
      console.log('[Backend Sim]: Loaded persisted connections from localStorage');
    }
  } catch (error) {
    console.error('[Backend Sim]: Failed to load persisted connections', error);
  }
};

// Call on module load
loadPersistedConnections();

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
    
    // ALSO PERSIST TO LOCALSTORAGE
    try {
      const stored = localStorage.getItem('vee_connections');
      const connections = stored ? JSON.parse(stored) : {};
      connections[service] = newConnection;
      localStorage.setItem('vee_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('[Backend Sim]: Failed to persist connection', error);
    }
    
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
      { name: 'v3-app', url: `https://github.com/JoshEwing-V3/v3-app` },
      { name: 'mobx-token-contracts', url: `https://github.com/JoshEwing-V3/mobx-token-contracts` },
      { name: 'architect-revelations-site', url: `https://github.com/JoshEwing-V3/architect-revelations-site` },
      { name: 'vee-ai-assistant', url: `https://github.com/JoshEwing-V3/vee-ai-assistant` },
      { name: 'biofield-protocol-research', url: `https://github.com/JoshEwing-V3/biofield-protocol-research` },
    ];
  },
};
