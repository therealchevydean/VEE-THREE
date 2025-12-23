import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * Encodes the flow type into the 'state' parameter for OAuth.
 */
const getAuthOptions = (req: express.Request) => {
    const flow = req.query.flow === 'connect' ? 'connect' : 'login';
    const state = Buffer.from(JSON.stringify({ flow })).toString('base64');
    return { state };
};

// Google Auth
router.get('/google', (req, res, next) => {
    const { state } = getAuthOptions(req);
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        handleAuthCallback(req, res);
    }
);

// GitHub Auth
router.get('/github', (req, res, next) => {
    const { state } = getAuthOptions(req);
    passport.authenticate('github', {
        scope: ['user:email'],
        state
    })(req, res, next);
});

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        handleAuthCallback(req, res);
    }
);

// Common Callback Handler
const handleAuthCallback = (req: express.Request, res: express.Response) => {
    try {
        const stateStr = req.query.state as string;
        const state = stateStr ? JSON.parse(Buffer.from(stateStr, 'base64').toString('utf-8')) : {};

        if (state.flow === 'connect') {
            // Popup Flow: Send message to opener
            const responseHtml = `
                <html>
                    <body>
                        <script>
                            window.opener.postMessage({
                                type: 'auth-callback',
                                service: '${req.path.includes('google') ? 'google' : 'github'}',
                                code: 'success', 
                                user: ${JSON.stringify(req.user)}
                            }, '*');
                            window.close();
                        </script>
                        <h1>Connection Successful</h1>
                        <p>You can close this window now.</p>
                    </body>
                </html>
            `;
            res.send(responseHtml);
        } else {
            // Standard Login Flow
            res.redirect('http://localhost:3000');
        }
    } catch (e) {
        console.error("Error parsing auth state:", e);
        res.redirect('http://localhost:3000');
    }
}

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('http://localhost:3000');
    });
});

// Get Current User
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

export default router;
