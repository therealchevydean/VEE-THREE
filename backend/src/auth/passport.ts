import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { query } from '../db';


// Serialize user to session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
    try {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            done(null, result.rows[0]);
        } else {
            done(new Error('User not found'), null);
        }
    } catch (err) {
        done(err, null);
    }
});

/**
 * Helper to update user tokens
 */
const updateUserTokens = async (userId: number, provider: string, accessToken: string) => {
    // Fetch current tokens
    const result = await query('SELECT tokens FROM users WHERE id = $1', [userId]);
    let tokens = result.rows[0]?.tokens || {};

    // Update token for this provider
    tokens[provider] = accessToken;

    // Save back to DB
    await query('UPDATE users SET tokens = $1 WHERE id = $2', [tokens, userId]);
};

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
        callbackURL: '/auth/google/callback',
        passReqToCallback: true // Enable access to req (for linking accounts)
    },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Scenario 1: User is already logged in -> Link Account
                if (req.user) {
                    const userId = (req.user as any).id;
                    await query('UPDATE users SET google_id = $1 WHERE id = $2', [profile.id, userId]);
                    await updateUserTokens(userId, 'google', accessToken);

                    // Return the updated user
                    const updatedUser = await query('SELECT * FROM users WHERE id = $1', [userId]);
                    return done(null, updatedUser.rows[0]);
                }

                // Scenario 2: User not logged in -> Login or Register
                let result = await query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

                if (result.rows.length === 0) {
                    // Create new user
                    const email = profile.emails?.[0].value;
                    const displayName = profile.displayName;
                    const avatarUrl = profile.photos?.[0].value;

                    // Initial tokens object
                    const tokens = { google: accessToken };

                    result = await query(
                        'INSERT INTO users (google_id, email, display_name, avatar_url, tokens) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [profile.id, email, displayName, avatarUrl, tokens]
                    );
                } else {
                    // User exists, just update token
                    const userId = result.rows[0].id;
                    await updateUserTokens(userId, 'google', accessToken);
                }

                return done(null, result.rows[0]);
            } catch (err) {
                return done(err);
            }
        }
    ));
}

// GitHub Strategy
if (process.env.GITHUB_TOKEN || (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)) {
    // Priority to OAuth credentials if available
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (clientID && clientSecret) {
        passport.use(new GitHubStrategy({
            clientID: clientID.trim(),
            clientSecret: clientSecret.trim(),
            callbackURL: '/auth/github/callback',
            passReqToCallback: true
        },
            async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    // Scenario 1: Link Account
                    if (req.user) {
                        const userId = (req.user as any).id;
                        await query('UPDATE users SET github_id = $1 WHERE id = $2', [profile.id, userId]);
                        await updateUserTokens(userId, 'github', accessToken);

                        const updatedUser = await query('SELECT * FROM users WHERE id = $1', [userId]);
                        return done(null, updatedUser.rows[0]);
                    }

                    // Scenario 2: Login/Register
                    let result = await query('SELECT * FROM users WHERE github_id = $1', [profile.id]);

                    if (result.rows.length === 0) {
                        const email = profile.emails?.[0].value || `${profile.username}@github.com`;
                        const displayName = profile.displayName || profile.username;
                        const avatarUrl = profile.photos?.[0].value;
                        const tokens = { github: accessToken };

                        result = await query(
                            'INSERT INTO users (github_id, email, display_name, avatar_url, tokens) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                            [profile.id, email, displayName, avatarUrl, tokens]
                        );
                    } else {
                        const userId = result.rows[0].id;
                        await updateUserTokens(userId, 'github', accessToken);
                    }

                    return done(null, result.rows[0]);
                } catch (err) {
                    return done(err);
                }
            }));
    }
}
