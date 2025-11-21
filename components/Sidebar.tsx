import React from 'react';

// --- Icon Components ---
const VeeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5V15c0-.55.45-1 1-1s1 .45 1 1v1.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V15h-1v1.5c0 .83-.67 1.5-1.5 1.5S9 17.33 9 16.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V15h-1v-1.5c0-.28.22-.5.5-.5s.5.22.5.5V15c0 .55-.45 1-1 1s-1-.45-1-1v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v3c0 1.38-1.12 2.5-2.5 2.5S11 17.88 11 16.5z"/>
    </svg>
);
const TaskIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM10.5 9.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3zM9 12.75a.75.75 0 01.75-.75h5.25a.75.75 0 010 1.5H9.75a.75.75 0 01-.75-.75zM9.75 15a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />
        <path d="M7.5 7.5a.75.75 0 00-1.5 0v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V7.5zm.75 3a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008c0-.414.336-.75.75-.75zm.75 3.75a.75.75 0 00-1.5 0v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008z" />
    </svg>
);
const ConnectIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
    </svg>
);
const ArchiveIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3v13.5a3 3 0 01-3 3H5.25a3 3 0 01-3-3V5.25zm3.563.813a.75.75 0 01.75 0h11.874a.75.75 0 010 1.5H6.563a.75.75 0 01-.75-.75v-.75zm0 3.75a.75.75 0 01.75 0h11.874a.75.75 0 010 1.5H6.563a.75.75 0 01-.75-.75V9.813zm0 3.75a.75.75 0 01.75 0h11.874a.75.75 0 010 1.5H6.563a.75.75 0 01-.75-.75v-.75z" clipRule="evenodd" />
    </svg>
);
const AppIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625V6.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" /> </svg> );
const WebsiteIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12 22a10 10 0 100-20 10 10 0 000 20zm-2-12a1 1 0 11-2 0 1 1 0 012 0zm-4 2a1 1 0 100 2 1 1 0 000-2zm8-5a1 1 0 11-2 0 1 1 0 012 0zm2 3a1 1 0 100 2 1 1 0 000-2zm-5 6a1 1 0 11-2 0 1 1 0 012 0z" /> </svg> );
const ProtocolIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M11.025 2.265c.481-.481 1.264-.481 1.746 0l8.25 8.25c.481.481.481 1.264 0 1.746l-8.25 8.25c-.481.481-1.264.481-1.746 0l-8.25-8.25a1.2 1.2 0 010-1.746l8.25-8.25zM12 6a.75.75 0 01.75.75v3.546l2.122-2.122a.75.75 0 111.06 1.06L13.81 11.4l2.122 2.121a.75.75 0 11-1.06 1.06L12.75 12.46v3.54a.75.75 0 01-1.5 0v-3.54l-2.122 2.12a.75.75 0 01-1.06-1.06l2.122-2.12-2.122-2.122a.75.75 0 011.06-1.06L11.25 9.296V6.75A.75.75 0 0112 6z" clipRule="evenodd" /> </svg> );
const StudiosIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625V6.375zM9 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm2.25-4.5a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" /> </svg> );
const EbookIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" clipRule="evenodd" /> </svg> );
const SocialIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12 12.75a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h15a3 3 0 013 3v15a3 3 0 01-3 3h-15a3 3 0 01-3-3V4.5zM3 16.5v-12a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5-1.5h-15a1.5 1.5 0 01-1.5-1.5z" clipRule="evenodd" /></svg> );
const TikTokIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M10.02 6a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 0v11.25M14.25 3.75v11.25a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V3.75" /></svg> );
const FacebookIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}> <path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm2.25 10.5h-2.25v7h-3v-7h-1.5v-2.5h1.5v-2c0-1.25.6-3 3-3h2.25v2.5h-1.5c-.25 0-.75.12-.75.75v1.75h2.25l-.5 2.5z" /> </svg> );
const InstagramIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <rect width="18" height="18" x="3" y="3" rx="4" /><circle cx="12" cy="12" r="4" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg> );
const XIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> </svg> );

const NAV_ITEMS = [
    { name: 'Tasks', href: '#', icon: TaskIcon, isInternal: true },
    { name: 'Connections', href: '#', icon: ConnectIcon, isInternal: true },
    { name: 'Archive', href: '#', icon: ArchiveIcon, isInternal: true },
    { name: 'V3 App', href: 'https://v3materials.io', icon: AppIcon },
    { name: 'V3 Website', href: 'https://v3materials.com', icon: WebsiteIcon },
    { name: 'Biofield Protocol', href: 'https://v3materials.com/protocol', icon: ProtocolIcon },
    { name: '53 Studios', href: 'https://53studios.art', icon: StudiosIcon },
    { name: 'Ebooks', href: '#', icon: EbookIcon },
];

const SOCIAL_ITEMS = [
    { name: 'TikTok', href: '#', icon: TikTokIcon },
    { name: 'Facebook', href: '#', icon: FacebookIcon },
    { name: 'Instagram', href: '#', icon: InstagramIcon },
    { name: 'X', href: '#', icon: XIcon },
]

interface SidebarProps {
    onToggleTaskBoard: () => void;
    onToggleConnections: () => void;
    onToggleArchive: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggleTaskBoard, onToggleConnections, onToggleArchive }) => {
    
    const handleNavClick = (e: React.MouseEvent, item: typeof NAV_ITEMS[0]) => {
        if (item.isInternal) {
            e.preventDefault();
            if (item.name === 'Tasks') {
                onToggleTaskBoard();
            }
            if (item.name === 'Connections') {
                onToggleConnections();
            }
            if (item.name === 'Archive') {
                onToggleArchive();
            }
        }
    };

    return (
        <aside className="fixed top-0 left-0 h-screen w-20 bg-gray-900/60 backdrop-blur-md border-r border-gray-700/50 flex flex-col z-30 group hover:w-64 transition-all duration-300">
            <div className="flex items-center justify-center h-20 border-b border-gray-700/50 flex-shrink-0">
                <VeeIcon className="w-10 h-10 text-cyan-400"/>
            </div>
            <nav className="flex-1 flex flex-col items-center py-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {NAV_ITEMS.map(item => (
                    <a 
                      key={item.name} 
                      href={item.href} 
                      target={item.isInternal ? '_self' : '_blank'} 
                      rel="noopener noreferrer" 
                      onClick={(e) => handleNavClick(e, item)}
                      className="flex items-center w-full h-12 px-6 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                    >
                        <item.icon className="w-6 h-6 flex-shrink-0" />
                        <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.name}</span>
                    </a>
                ))}
                
                <div className="relative w-full group/social">
                     <div className="flex items-center w-full h-12 px-6 text-gray-300 cursor-pointer">
                        <SocialIcon className="w-6 h-6 flex-shrink-0" />
                        <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Social Media</span>
                    </div>
                    {/* Flyout Menu */}
                    <div className="absolute left-full top-0 ml-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 opacity-0 invisible group-hover/social:opacity-100 group-hover/social:visible transition-all duration-200">
                        {SOCIAL_ITEMS.map(item => (
                           <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center w-full p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">
                               <item.icon className="w-5 h-5 mr-3"/>
                               {item.name}
                           </a>
                        ))}
                    </div>
                </div>

            </nav>
        </aside>
    );
};

export default Sidebar;
