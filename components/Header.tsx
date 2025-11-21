import React from 'react';

interface HeaderProps {
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  isScreenSharing: boolean;
}

// --- SVG Icon Components ---
const VeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-400">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5V15c0-.55.45-1 1-1s1 .45 1 1v1.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V15h-1v1.5c0 .83-.67 1.5-1.5 1.5S9 17.33 9 16.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V15h-1v-1.5c0-.28.22-.5.5-.5s.5.22.5.5V15c0 .55-.45 1-1 1s-1-.45-1-1v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v3c0 1.38-1.12 2.5-2.5 2.5S11 17.88 11 16.5z"/>
    </svg>
);
const SpeakerOnIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.672 3.672 3.672 9.584 0 13.256a.75.75 0 11-1.06-1.06c3.102-3.101 3.102-8.095 0-11.196a.75.75 0 010-1.06z" />
        <path d="M16.464 7.226a.75.75 0 011.06 0c2.101 2.101 2.101 5.492 0 7.592a.75.75 0 11-1.06-1.06c1.53-1.53 1.53-4.002 0-5.532a.75.75 0 010-1.06z" />
    </svg>
);
const SpeakerOffIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.28 17.28a.75.75 0 001.06-1.06l-4.28-4.28a.75.75 0 00-1.06 1.06l4.28 4.28zm-4.28-4.28a.75.75 0 001.06 1.06l4.28-4.28a.75.75 0 00-1.06-1.06l-4.28 4.28z" />
    </svg>
);
const ScreenShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M2.25 5.25v13.5a.75.75 0 00.75.75h17.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3a.75.75 0 00-.75.75zM12 8.25a.75.75 0 01.75.75v3.25l1.22-1.22a.75.75 0 111.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06l1.22 1.22V9a.75.75 0 01.75-.75z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ isAudioEnabled, onToggleAudio, isScreenSharing }) => {
    return (
        <header className="p-4 bg-gray-900/60 backdrop-blur-md border-b border-gray-700/50 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-4">
                <VeeIcon />
                <div>
                    <h1 className="text-xl font-bold text-gray-100">VEE</h1>
                    <p className="text-sm text-gray-400 hidden sm:block">Virtual Ecosystem Engineer</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isScreenSharing && (
                    <div className="flex items-center gap-2 text-red-400 animate-pulse bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
                        <ScreenShareIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">LIVE</span>
                    </div>
                )}
                <button
                    onClick={onToggleAudio}
                    className={`p-2 rounded-full transition-colors ${isAudioEnabled ? 'text-cyan-400 bg-gray-700' : 'text-gray-400 hover:bg-gray-700'}`}
                    aria-label={isAudioEnabled ? "Disable audio output" : "Enable audio output"}
                    title={isAudioEnabled ? "Disable audio output" : "Enable audio output"}
                >
                    {isAudioEnabled ? <SpeakerOnIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;