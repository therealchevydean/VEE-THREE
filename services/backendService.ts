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
  github: 'therealchevydean',
  vercel: 'ewingjoshua.v3prototype@gmail.com',
};

// Simulate a database of tokens, which would be managed by the backend.
const tokenDatabase: Partial<Record<'google' | 'github' | 'vercel', Connection>> = {};

// Initialize tokenDatabase from localStorage on module load
const initTokenDatabase = () => {
  try {
    const stored = localStorage.getItem('vee_connections');
    if (stored) {
      const connections = JSON.parse(stored);
      Object.keys(connections).forEach(key => {
        tokenDatabase[key as 'google' | 'github' | 'vercel'] = connections[key];
      });
      console.log('[Backend Sim]: Initialized tokenDatabase from localStorage');
    }
  } catch (e) {
    console.error('[Backend Sim]: Failed to init tokenDatabase:', e);
  }
};
initTokenDatabase();

export const backendService = {
  /**
   * Simulates the backend generating an authorization URL.
   * @param service The service to connect to.
   */
  async getAuthUrl(service: 'google' | 'github' | 'vercel'): Promise<{ authorizationUrl: string }> {
    console.log(`[Backend Sim]: Generating auth URL for ${service}...`);
    const callbackUrl = `javascript:
      window.opener.postMessage({ 
        type: 'auth-callback', 
        service: '${service}', 
        code: 'mock_auth_code_${crypto.randomUUID()}' 
      }, '*');
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
    const newConnection: Connection = {
      service,
      username: MOCK_USERNAMES[service],
      token: `mock_session_token_${service}_${crypto.randomUUID()}`,
      connectedAt: new Date().toISOString(),
    };
    
    tokenDatabase[service] = newConnection;
    console.log(`[Backend Sim]: Stored connection for ${service}.`);
    return Promise.resolve(newConnection);
  },

  /**
   * Fetches GitHub repos - uses real API if PAT available, otherwise simulation.
   */
  async getGithubRepos(): Promise<GithubRepo[]> {
    console.log('[Backend Sim]: Request to fetch GitHub repos received.');
    
    // Re-sync tokenDatabase from localStorage in case it was updated
    initTokenDatabase();
    
    // Check for manual GitHub PAT token first
    const manualTokens = localStorage.getItem('vee_manual_tokens');
    const tokens = manualTokens ? JSON.parse(manualTokens) : {};
    const githubPat = tokens.github_pat;
    
    // If we have a PAT, use the real GitHub API
    if (githubPat) {
      console.log('[Backend Sim]: Using GitHub PAT for real API call');
      try {
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
          headers: {
            'Authorization': `Bearer ${githubPat}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          console.error('[Backend Sim]: GitHub API error:', response.status);
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        console.log(`[Backend Sim]: Fetched ${repos.length} repos from GitHub API`);
        return repos.map((repo: any) => ({
          name: repo.name,
          url: repo.html_url
        }));
      } catch (error) {
        console.error('[Backend Sim]: Failed to fetch from GitHub API:', error);
        throw new Error('Failed to connect to GitHub. Please check your token.');
      }
    }
    
    // Check if connected via OAuth simulation
    if (!tokenDatabase.github) {
      throw new Error("GitHub account is not connected.");
    }
    
    // Fallback to simulation with your actual repos
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [
      { name: 'VEE-THREE', url: 'https://github.com/therealchevydean/VEE-THREE' },
      { name: 'v3-app', url: 'https://github.com/therealchevydean/v3-app' },
      { name: 'Chevy-Dean-tour-guide', url: 'https://github.com/therealchevydean/Chevy-Dean-tour-guide' },
      { name: 'mobx-token-contracts', url: 'https://github.com/therealchevydean/mobx-token-contracts' },
      { name: 'architect-revelations-site', url: 'https://github.com/therealchevydean/architect-revelations-site' },
    ];
  },
};
