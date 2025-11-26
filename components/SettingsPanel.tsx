import React, { useState, useEffect } from 'react';
import { getManualToken, setManualToken } from '../services/authService';

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [githubToken, setGithubToken] = useState('');
  const [ebayAppId, setEbayAppId] = useState('');
  const [ebayCertId, setEbayCertId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGithubToken(getManualToken('github_pat') || '');
      setEbayAppId(getManualToken('ebay_app_id') || '');
      setEbayCertId(getManualToken('ebay_cert_id') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    setManualToken('github_pat', githubToken);
    setManualToken('ebay_app_id', ebayAppId);
    setManualToken('ebay_cert_id', ebayCertId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-100">VEE Settings & Configuration</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">GitHub Automation</h3>
            <p className="text-sm text-gray-400 mb-3">
              Enter a Personal Access Token (PAT) with <code>repo</code> scope to allow VEE to commit code, create branches, and push updates autonomously.
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">GitHub Personal Access Token</label>
              <input 
                type="password" 
                value={githubToken} 
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </section>

          <hr className="border-gray-700/50" />

          <section>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">eBay Integration</h3>
            <p className="text-sm text-gray-400 mb-3">
              Configure your eBay Developer credentials to enable product research and automated listing drafts.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500 uppercase">App ID (Client ID)</label>
                <input 
                  type="text" 
                  value={ebayAppId} 
                  onChange={(e) => setEbayAppId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500 uppercase">Cert ID (Client Secret)</label>
                <input 
                  type="password" 
                  value={ebayCertId} 
                  onChange={(e) => setEbayCertId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </section>

          <button 
            onClick={handleSave}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition-colors"
          >
            Save Configuration
          </button>
        </main>
      </div>
    </div>
  );
};

export default SettingsPanel;