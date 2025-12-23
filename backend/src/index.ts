import dotenv from 'dotenv';
import dns from 'dns';

// Load environment variables from root .env if possible, or local .env
dotenv.config({ path: '../.env' });
dotenv.config(); // Fallback to local .env

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

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'vee-three-backend',
        timestamp: new Date().toISOString(),
        auth: req.isAuthenticated() ? 'authenticated' : 'guest'
    });
});

app.listen(PORT, () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
});
