/**
 * =================================================================
 * VEE LOCAL FILE & SHELL SERVICE — SIMULATION
 * =================================================================
 *
 * This service simulates VEE's ability to interact with the user's local
 * filesystem and execute shell commands. In a real application, this would
 * require a secure bridge, such as a companion desktop app built with
 * Electron or Tauri, to which this web UI would connect.
 *
 * --- SECURITY WARNING ---
 * Direct file system and shell access from a browser is not possible
 * for security reasons. This simulation provides a safe, sandboxed
 * environment to develop and test VEE's tool-using capabilities.
 *
 * --- MOCK FILE SYSTEM ---
 * The service maintains an in-memory object representing a simple
 * directory structure and file contents, allowing VEE to perform
 * `readFile`, `writeFile`, and `ls` commands as if it were on a real system.
 */

// Represents our in-memory file system.
// In a real app, this would not exist; calls would go to the bridge.
let mockFileSystem: { [key: string]: string } = {
    'README.md': '# VEE - Virtual Ecosystem Engineer\nThis is the main project README.',
    'package.json': JSON.stringify({
        name: 'vee-ai-assistant',
        version: '1.0.0',
        dependencies: {
            'react': '^19.2.0',
            '@google/genai': '^1.28.0'
        }
    }, null, 2),
    'src/App.tsx': `import React from 'react';\n// ... (mock content of App.tsx)`,
    'src/components/ChatInterface.tsx': `import React from 'react';\n// ... (mock content of ChatInterface.tsx)`,
    'server/package.json': JSON.stringify({
      name: 'vee-backend',
      version: '1.0.0',
      description: 'Secure backend service for VEE AI Assistant.',
      main: 'dist/index.js',
      scripts: {
        "start": "node dist/index.js",
        "dev": "nodemon src/index.ts",
        "build": "tsc"
      },
      dependencies: {
        "axios": "^1.7.2",
        "cors": "^2.8.5",
        "dotenv": "^16.4.5",
        "express": "^4.19.2"
      },
      devDependencies: {
        "@types/cors": "^2.8.17",
        "@types/express": "^4.17.21",
        "@types/node": "^20.12.12",
        "nodemon": "^3.1.0",
        "ts-node": "^10.9.2",
        "typescript": "^5.4.5"
      }
    }, null, 2),
    'server/tsconfig.json': JSON.stringify({
      "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "rootDir": "./src",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true
      },
      "include": ["src/**/*"]
    }, null, 2),
    'server/.env.example': `
# Server Configuration
PORT=8080

# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET

# Vercel OAuth Credentials
VERCEL_CLIENT_ID=YOUR_VERCEL_CLIENT_ID
VERCEL_CLIENT_SECRET=YOUR_VERCEL_CLIENT_SECRET

# Encryption Key for Tokens
TOKEN_ENCRYPTION_KEY=a_very_strong_random_32_byte_string
`,
    'server/README.md': `
# VEE Backend Server

This server provides the secure backend infrastructure for the VEE AI Assistant. It handles OAuth 2.0 flows, secure token storage, and acts as a proxy for all third-party API interactions.

## Setup

1.  **Install Dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

2.  **Configure Environment Variables:**
    - Copy the \`.env.example\` file to a new file named \`.env\`.
    - Fill in the required credentials for Google, GitHub, and Vercel. You will need to create OAuth applications in their respective developer consoles.
    - Generate a secure, random 32-byte string for \`TOKEN_ENCRYPTION_KEY\`.

3.  **Run in Development:**
    \`\`\`bash
    npm run dev
    \`\`\`
    This will start the server using \`nodemon\`, which automatically restarts on file changes.

4.  **Build for Production:**
    \`\`\`bash
    npm run build
    \`\`\`
    This compiles the TypeScript code into JavaScript in the \`dist\` directory.

5.  **Run in Production:**
    \`\`\`bash
    npm start
    \`\`\`
`,
    'server/src/index.ts': `
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { isAuthenticated } from './middleware/authMiddleware';
// import githubRoutes from './routes/githubRoutes'; // Example for proxy routes

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors()); // Configure allowed origins in production
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
// Protected routes that require authentication would go here
// app.use('/api/github', isAuthenticated, githubRoutes);

app.get('/', (req, res) => {
  res.send('VEE Backend is operational.');
});

app.listen(port, () => {
  console.log(\`[server]: VEE backend is running at http://localhost:\${port}\`);
});
`,
    'server/src/routes/authRoutes.ts': `
import { Router } from 'express';

const router = Router();

// --- GOOGLE OAUTH ---
router.get('/google/connect', (req, res) => {
    // TODO: Construct the Google OAuth URL with client ID, scopes, and redirect URI.
    // Redirect the user to that URL.
    console.log('Received request to connect with Google.');
    const MOCK_AUTH_URL = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=MOCK_CLIENT_ID&redirect_uri=\${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar\`;
    res.json({ authorizationUrl: MOCK_AUTH_URL });
});

router.get('/google/callback', (req, res) => {
    const { code } = req.query;
    console.log(\`Received Google callback with authorization code: \${code}\`);
    // TODO:
    // 1. Exchange the authorization code for an access token and refresh token.
    // 2. Encrypt and store the tokens securely using the tokenService.
    // 3. Respond to the frontend to close the popup and confirm success.
    res.send('<script>window.close();</script>');
});


// --- GITHUB OAUTH ---
router.get('/github/connect', (req, res) => {
    // TODO: Implement GitHub OAuth connection logic.
    res.status(501).json({ message: 'GitHub connection not implemented.' });
});

router.get('/github/callback', (req, res) => {
    // TODO: Implement GitHub OAuth callback logic.
    res.status(501).send('GitHub callback not implemented.');
});

// --- VERCEL OAUTH ---
router.get('/vercel/connect', (req, res) => {
    // TODO: Implement Vercel OAuth connection logic.
    res.status(501).json({ message: 'Vercel connection not implemented.' });
});

router.get('/vercel/callback', (req, res) => {
    // TODO: Implement Vercel OAuth callback logic.
    res.status(501).send('Vercel callback not implemented.');
});


export default router;
`,
    'server/src/services/tokenService.ts': `
import crypto from 'crypto';

/**
 * =================================================================
 * VEE SECURE TOKEN SERVICE - BLUEPRINT
 * =================================================================
 *
 * This service is responsible for encrypting, decrypting, and storing user tokens.
 * In a production environment, the \`tokenStore\` would be replaced with a
 * secure, persistent database (e.g., PostgreSQL, Redis).
 *
 * The encryption key MUST be a secure, randomly generated key stored as an
 * environment variable and managed with a secret manager (e.g., AWS KMS,
 * HashiCorp Vault).
 */

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 32-byte string.');
}

const ALGORITHM = 'aes-256-gcm';

// In-memory store for demonstration. REPLACE WITH A SECURE DATABASE.
const tokenStore: { [userId: string]: { [service: string]: string } } = {};


export const encryptToken = (token: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return \`\${iv.toString('hex')}:\${authTag.toString('hex')}:\${encrypted}\`;
};

export const decryptToken = (encryptedToken: string): string => {
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

/**
 * Stores an encrypted token for a user and service.
 * @param userId - A unique identifier for the user.
 * @param service - The service name (e.g., 'google', 'github').
 * @param token - The raw access or refresh token to be stored.
 */
export const storeToken = async (userId: string, service: string, token: string): Promise<void> => {
    const encryptedToken = encryptToken(token);
    // TODO: Replace this with a database write operation.
    if (!tokenStore[userId]) {
        tokenStore[userId] = {};
    }
    tokenStore[userId][service] = encryptedToken;
    console.log(\`[TokenService]: Stored encrypted token for user \${userId}, service \${service}.\`);
};

/**
 * Retrieves and decrypts a token for a user and service.
 * @param userId - A unique identifier for the user.
 * @param service - The service name (e.g., 'google', 'github').
 * @returns The decrypted token, or null if not found.
 */
export const retrieveToken = async (userId: string, service: string): Promise<string | null> => {
    // TODO: Replace this with a database read operation.
    const encryptedToken = tokenStore[userId]?.[service];
    if (encryptedToken) {
        console.log(\`[TokenService]: Retrieved encrypted token for user \${userId}, service \${service}.\`);
        return decryptToken(encryptedToken);
    }
    return null;
};
`,
    'server/src/middleware/authMiddleware.ts': `
import { Request, Response, NextFunction } from 'express';

/**
 * =================================================================
 * VEE AUTHENTICATION MIDDLEWARE - BLUEPRINT
 * =================================================================
 *
 * This middleware protects API routes that require an authenticated user session.
 * In a production system, it would validate a secure, HTTP-only session cookie
 * or a JWT (JSON Web Token) sent in the Authorization header.
 */

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    console.log('[AuthMiddleware]: Checking for authenticated session...');
    // TODO:
    // 1. Extract the session cookie or JWT from the request headers.
    // 2. Validate the session/token (e.g., check signature, expiration).
    // 3. If valid, find the associated user ID and attach it to the request object (e.g., req.userId = 'user123').
    // 4. If invalid, respond with a 401 Unauthorized error.

    const mockSessionToken = req.headers['authorization']?.split(' ')[1];

    if (mockSessionToken && mockSessionToken.startsWith('mock_session_token')) {
        // In this simulation, we'll assume any mock token is valid.
        // @ts-ignore - attaching custom property to request
        req.userId = 'user_josh_ewing'; // Attach mock user ID
        return next();
    }

    return res.status(401).json({ error: 'Unauthorized: No valid session token provided.' });
};
`,
    'server/src/services/apiProxyService.ts': `
import axios from 'axios';
import { retrieveToken } from './tokenService';

/**
 * =================================================================
 * VEE API PROXY SERVICE - BLUEPRINT
 * =================================================================
 *
 * This service acts as a secure proxy for all interactions with third-party APIs
 * (e.g., Google, GitHub, Vercel). The frontend NEVER calls these APIs directly.
 * Instead, it calls our own backend endpoints, which then use this service.
 * This prevents exposure of sensitive API keys or access tokens to the browser.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetches repositories for the authenticated user.
 * This function would be called by a dedicated, authenticated route (e.g., GET /api/github/repos).
 * @param userId - The ID of the user making the request, extracted from their session by the authMiddleware.
 * @returns A promise that resolves to the list of repositories.
 */
export const fetchGithubRepos = async (userId: string) => {
    // 1. Retrieve the user's encrypted GitHub token from the database.
    const accessToken = await retrieveToken(userId, 'github');

    if (!accessToken) {
        throw new Error('GitHub token not found for this user. Please connect your account.');
    }

    // 2. Make the authenticated request to the GitHub API on behalf of the user.
    const response = await axios.get(\`\${GITHUB_API_BASE}/user/repos\`, {
        headers: {
            'Authorization': \`Bearer \${accessToken}\`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    // 3. Map the response to the format expected by the frontend.
    return response.data.map((repo: any) => ({
        name: repo.name,
        url: repo.html_url,
    }));
};

// ... Add other proxy functions for creating PRs, committing files, creating calendar events etc. ...
`
};

const resolvePath = (path: string): string => {
    // Basic path normalization for simulation, removing './'
    return path.startsWith('./') ? path.substring(2) : path;
};


/**
 * Simulates reading a file from the local filesystem.
 * @param path The path to the file.
 * @returns An object with the file content or an error message.
 */
export const readFile = async (path: string): Promise<{ status: string; content?: string; message?: string }> => {
    console.log(`Simulating readFile: ${path}`);
    const resolvedPath = resolvePath(path);
    
    if (mockFileSystem.hasOwnProperty(resolvedPath)) {
        return {
            status: 'success',
            content: mockFileSystem[resolvedPath],
        };
    } else {
        return {
            status: 'error',
            message: `File not found at path: ${path}`,
        };
    }
};

/**
 * Simulates writing a file to the local filesystem.
 * @param path The path to the file.
 * @param content The content to write.
 * @returns A confirmation or error message.
 */
export const writeFile = async (path: string, content: string): Promise<{ status: string; message: string }> => {
    console.log(`Simulating writeFile: ${path}`);
    const resolvedPath = resolvePath(path);

    // Basic security check simulation
    if (path.includes('../') || (!path.startsWith('./') && !path.startsWith('server/'))) {
        return {
            status: 'error',
            message: `Permission denied. Path is outside the allowed directory.`,
        };
    }

    mockFileSystem[resolvedPath] = content;
    return {
        status: 'success',
        message: `File successfully written to ${path}.`,
    };
};

/**
 * Simulates executing a shell command.
 * @param command The command to execute.
 * @returns The output of the command or an error.
 */
export const executeShellCommand = async (command: string): Promise<{ status: string; output?: string; message?: string }> => {
    console.log(`Simulating executeShellCommand: ${command}`);
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (cmd === 'ls') {
        const targetPath = args[0] || './';
        let basePath = '';
        if (targetPath !== './' && targetPath !== '.') {
            basePath = resolvePath(targetPath);
            if (!basePath.endsWith('/')) {
                basePath += '/';
            }
        }
        
        const filesAndDirs = new Set<string>();
        Object.keys(mockFileSystem).forEach(p => {
            if (p.startsWith(basePath)) {
                const relativePath = p.substring(basePath.length);
                const firstPart = relativePath.split('/')[0];
                filesAndDirs.add(firstPart);
            }
        });
        
        const output = Array.from(filesAndDirs).join('\n');
        return {
            status: 'success',
            output: `total ${filesAndDirs.size}\n${output}`
        };
    }
    
    if (cmd === 'git' && args[0] === 'status') {
         return {
            status: 'success',
            output: `On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`
        };
    }
    
    if (cmd === 'pwd') {
        return {
            status: 'success',
            output: '/home/user/vee-project'
        };
    }

    return {
        status: 'error',
        message: `Command not recognized or permitted in this simulation: ${cmd}`,
    };
};

/**
 * Simulates searching for files by name or pattern.
 * @param query The search query or pattern.
 * @returns A list of matching file paths.
 */
export const searchFiles = async (query: string): Promise<{ status: string; files?: string[]; message?: string }> => {
    console.log(`Simulating searchFiles: ${query}`);
    
    try {
        const allFilePaths = Object.keys(mockFileSystem).map(p => `./${p}`);
        let matchingFiles: string[];

        if (query.includes('*')) {
            // Convert simple glob to regex. This only handles '*'
            const pattern = query.replace(/\./g, '\\.').replace(/\*/g, '.*');
            const regex = new RegExp(pattern);
            matchingFiles = allFilePaths.filter(path => regex.test(path));
        } else {
            // Simple substring search
            matchingFiles = allFilePaths.filter(path => path.includes(query));
        }

        if (matchingFiles.length > 0) {
            return {
                status: 'success',
                files: matchingFiles,
                message: `Found ${matchingFiles.length} file(s) matching "${query}".`
            };
        } else {
            return {
                status: 'success',
                files: [],
                message: `No files found matching "${query}".`
            };
        }
    } catch (error) {
        return {
            status: 'error',
            message: `An error occurred while searching for files: ${(error as Error).message}`
        };
    }
};