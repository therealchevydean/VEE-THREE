
import React, { useState } from 'react';
import { Connection } from '../services/authService';

// --- Icon Components ---
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.87-2.13 15.84-5.73l-7.73-6c-2.15 1.45-4.92 2.3-8.11 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
);
const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);
const VercelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l12 20H0l12-20z" /></svg>
);

const SERVICE_CONFIG = {
    google: { name: 'Google', icon: GoogleIcon, description: 'Connect your Google account to manage Calendar events and access Drive files.' },
    github: { name: 'GitHub', icon: GithubIcon, description: 'Connect your GitHub account to create repositories and manage code.' },
    vercel: { name: 'Vercel', icon: VercelIcon, description: 'Connect your Vercel account to deploy projects and manage deployments.' },
}

interface ConnectionsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    connections: Record<string, Connection | null>;
    onConnect: (service: 'google' | 'github' | 'vercel') => void;
    onDisconnect: (service: 'google' | 'github' | 'vercel') => void;
}

const ConnectionsManager: React.FC<ConnectionsManagerProps> = ({ isOpen, onClose, connections, onConnect, onDisconnect }) => {
    const [loadingService, setLoadingService] = useState<string | null>(null);

    const handleConnectClick = async (service: 'google' | 'github' | 'vercel') => {
        setLoadingService(service);
        try {
            await onConnect(service);
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
             setLoadingService(null);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100">Manage Connections (Prototype)</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close connections manager">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    {Object.entries(SERVICE_CONFIG).map(([key, config]) => {
                        const serviceKey = key as 'google' | 'github' | 'vercel';
                        const connection = connections[serviceKey];
                        const isLoading = loadingService === serviceKey;

                        return (
                            <div key={key} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700/80">
                                <div className="flex items-center gap-4">
                                    <config.icon className="w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-100">{config.name}</h3>
                                        {connection ? (
                                            <p className="text-sm text-green-400">Connected as <span className="font-medium">{connection.username}</span></p>
                                        ) : (
                                            <p className="text-sm text-gray-400">{config.description}</p>
                                        )}
                                    </div>
                                </div>
                                {connection ? (
                                     <button
                                        onClick={() => onDisconnect(serviceKey)}
                                        className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnectClick(serviceKey)}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-wait transition-colors"
                                    >
                                        {isLoading ? 'Connecting...' : 'Connect'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </main>
            </div>
        </div>
    );
};

export default ConnectionsManager;
