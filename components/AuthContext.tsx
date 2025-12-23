import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User Interface matches backend schema
interface User {
    id: number;
    email: string;
    display_name?: string;
    avatar_url?: string;
    google_id?: string;
    github_id?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    loginWithGoogle: () => void;
    loginWithGithub: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = async () => {
        try {
            setError(null);
            const response = await fetch('/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.isAuthenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                if (response.status !== 401) {
                    setError(`Backend Error: ${response.status}`);
                }
                setUser(null);
            }
        } catch (err) {
            console.error("Failed to check auth status:", err);
            setError("Could not connect to VEE Backend.");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginWithGoogle = () => {
        window.location.href = 'http://localhost:3001/auth/google';
    };

    const loginWithGithub = () => {
        window.location.href = 'http://localhost:3001/auth/github';
    };

    const logout = () => {
        window.location.href = 'http://localhost:3001/auth/logout';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, loginWithGoogle, loginWithGithub, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
