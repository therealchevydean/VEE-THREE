import React, { createContext, useContext, ReactNode } from 'react';

// User Interface matches backend schema
interface User {
    id: number;
    email: string;
    display_name?: string;
    avatar_url?: string;
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

// Define global mock user for consistency
export const mockUser: User = {
    id: 1,
    email: 'user@vee-three.local',
    display_name: 'VEE User',
    avatar_url: undefined
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // No authentication - always provide the mock user
    const value: AuthContextType = {
        user: mockUser,
        isLoading: false,
        error: null,
        loginWithGoogle: () => { console.log('Mock login with Google'); },
        loginWithGithub: () => { console.log('Mock login with GitHub'); },
        logout: () => { console.log('Mock logout'); }
    };

    return (
        <AuthContext.Provider value={value}>
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
