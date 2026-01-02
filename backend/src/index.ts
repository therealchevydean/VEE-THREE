import dotenv from 'dotenv';
import dns from 'dns';
import * as path from 'path';
import * as fs from 'fs';


// Load environment variables from root .env if possible, or local .env
dotenv.config({ path: '../.env' });
dotenv.config(); // Fallback to local .env

// [DEBUG & FIX] Ensure Google Credentials Path is Absolute
console.log('[Startup] CWD:', process.cwd());
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    let credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!path.isAbsolute(credsPath)) {
        // Resolve relative to project root (../ from src/index.ts location if using ts-node/src)
        // or just CWD if that's safer. The feedback suggested projectRoot = path.resolve(__dirname, '..');
        // If we are in backend/src, then .. is backend/.
        const projectRoot = path.resolve(__dirname, '..');
        credsPath = path.resolve(projectRoot, credsPath);
    }

    console.log(`[Startup] GOOGLE_APPLICATION_CREDENTIALS: '${process.env.GOOGLE_APPLICATION_CREDENTIALS}' -> Resolved: '${credsPath}'`);

    if (fs.existsSync(credsPath)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
        console.log('[Startup] Verified key file exists. Path updated in env.');
    } else {
        console.error('[Startup] FATAL: Key file NOT found at', credsPath);
        // Fail fast in production
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
} else {
    console.error('[Startup] WARNING: GOOGLE_APPLICATION_CREDENTIALS is NOT set.');
}


// Force IPv4 to avoid IPv6 timeouts with Supabase
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import pgSession from 'connect-pg-simple';
import { getPool } from './db';
import authRoutes from './routes/auth';
import memoryRoutes from './routes/memory';
import integrationRoutes from './routes/integrations';
import gcsRoutes from './routes/gcs';
import jobsRoutes from './routes/jobs';
import tasksRoutes from './routes/tasks';

import './auth/passport'; // Initialize Passport config

const app = express();
const PORT = process.env.PORT || 3001;
const pgSessionStore = pgSession(session);

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
    store: new pgSessionStore({
        pool: getPool(),
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'vee_secret_dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production', // true in production
        httpOnly: true,
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/gcs', gcsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/tasks', tasksRoutes);


// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'vee-three-backend',
        timestamp: new Date().toISOString(),
        auth: req.isAuthenticated() ? 'authenticated' : 'guest'
    });
});


// Serve static files from /public (frontend build)
const publicPath = path.resolve(__dirname, '..', '..', 'public');app.use(express.static(publicPath));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] Server running on http://0.0.0.0:${PORT}`);});
