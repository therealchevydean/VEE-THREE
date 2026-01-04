import React, { createContext, useContext, ReactNode } from 'react';

// Simplified AuthContext - no authentication required
interface AuthContextType {
  user: null;
  isLoading: false;
  error: null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // No authentication - always allow access
  const value: AuthContextType = {
    user: null,
    isLoading: false,
    error: null
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
