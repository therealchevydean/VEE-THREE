
import { backendService } from './backendService';

/**
 * =================================================================
 * VEE AUTHENTICATION SERVICE — PRODUCTION ARCHITECTURE
 * =================================================================
 *
 * This service manages the frontend state for service connections. It no longer
 * contains simulation logic itself. Instead, it communicates with the
 * `backendService` (a simulation of our real backend) to handle the
 * secure OAuth 2.0 flow. This architecture is ready for production.
 *
 * The `localStorage` is now used as a client-side cache for connection
 * status, but the backend remains the source of truth for authentication.
 */

export interface Connection {
    service: 'google' | 'github' | 'vercel';
    username: string;
    token: string; // Represents a secure session token from our backend.
    connectedAt: string;
}

export interface GithubRepo {
    name: string;
    url: string;
}

const STORAGE_KEY = 'vee_connections';

/**
 * Initiates the OAuth 2.0 connection flow by calling the backend.
 * @param service The service to connect to.
 * @returns A promise that resolves with the new connection details or null if canceled.
 */
export const connect = (service: 'google' | 'github' | 'vercel'): Promise<Connection | null> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Ask our backend for the provider's unique authorization URL.
            const { authorizationUrl } = await backendService.getAuthUrl(service);

            // 2. Open a popup window to that URL for the user to grant permissions.
            const width = 600, height = 700;
            const left = (window.innerWidth / 2) - (width / 2);
            const top = (window.innerHeight / 2) - (height / 2);
            const popup = window.open(authorizationUrl, `VEE_Auth_${service}`, `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`);

            if (!popup) {
                return reject(new Error("Popup was blocked. Please allow popups for this site."));
            }

            // 3. Listen for a message from the popup, which is sent by our backend's callback page.
            const handleAuthMessage = async (event: MessageEvent) => {
                if (event.data?.type === 'auth-callback' && event.data.service === service) {
                    try {
                        // 4. Send the temporary authorization code to our backend to finalize the connection.
                        const newConnection = await backendService.handleAuthCallback(service, event.data.code);
                        
                        // 5. Update the client-side cache (localStorage) and resolve the promise.
                        const allConnections = getConnections();
                        allConnections[service] = newConnection;
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(allConnections));
                        
                        console.log(`Successfully connected to ${service} as ${newConnection.username}.`);
                        
                        window.removeEventListener('message', handleAuthMessage);
                        resolve(newConnection);

                    } catch (e) {
                         window.removeEventListener('message', handleAuthMessage);
                         reject(e);
                    }
                }
            };
            window.addEventListener('message', handleAuthMessage);

            // Poll to see if the user manually closed the popup before completion.
            const checkPopup = setInterval(() => {
                if (!popup || popup.closed) {
                    clearInterval(checkPopup);
                    window.removeEventListener('message', handleAuthMessage);
                    resolve(null);
                }
            }, 500);

        } catch (error) {
            console.error(`Error initiating connection for ${service}:`, error);
            reject(error);
        }
    });
};

/**
 * Disconnects a service. In a real app, this would also notify the backend.
 */
export const disconnect = (service: 'google' | 'github' | 'vercel'): void => {
    const allConnections = getConnections();
    delete allConnections[service];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConnections));
    console.log(`Disconnected from ${service}.`);
};

/**
 * Retrieves a single connection status from the local cache.
 */
export const getConnection = (service: 'google' | 'github' | 'vercel'): Connection | null => {
    return getConnections()[service] || null;
};

/**
 * Retrieves all connection statuses from the local cache.
 */
export const getConnections = (): Record<string, Connection | null> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to parse connections from localStorage:", error);
        return {};
    }
};

/**
 * Fetches GitHub repos via our backend service, which acts as a secure proxy.
 */
export const getGithubRepos = async (connection: Connection): Promise<GithubRepo[]> => {
    // The connection object is passed for context, but the backend would use the user's secure session.
    return backendService.getGithubRepos();
};
