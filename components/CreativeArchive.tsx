
import React, { useState, useRef, useEffect } from 'react';
import { ArchivedFile } from '../types';

// --- Icon Components ---
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.25 2.25c.414 0 .75.336.75.75v11.59l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
      <path d="M5.25 18.75a.75.75 0 000 1.5h13.5a.75.75 0 000-1.5H5.25z" />
    </svg>
);
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
    </svg>
);
const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h16.5A2.25 2.25 0 0022.5 18.75V8.25A2.25 2.25 0 0020.25 6H12A2.25 2.25 0 019.75 3.75V3H3.75z" clipRule="evenodd" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4.888c-1.75 0-3.47.08-5.164.24a.75.75 0 01-.722-.684l-.004-.018a.75.75 0 01.683-.722A42.533 42.533 0 0110 3.388c1.75 0 3.47.08 5.164.24a.75.75 0 01.683.722l-.004.018a.75.75 0 01-.722.684A42.533 42.533 0 0110 4.888z" clipRule="evenodd" />
  </svg>
);
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
  </svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
  </svg>
);


interface CreativeArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  files: ArchivedFile[];
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  activeWorkspace: string;
}

const CreativeArchive: React.FC<CreativeArchiveProps> = ({ isOpen, onClose, files, onUpload, onDelete, onRename, activeWorkspace }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingFile, setEditingFile] = useState<{ id: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingFile && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onUpload(Array.from(event.target.files));
        }
    };

    const handleRename = () => {
        if (editingFile && editingFile.name.trim()) {
            onRename(editingFile.id, editingFile.name.trim());
        }
        setEditingFile(null);
    };
    
    // Filter by Search Query (Files are already filtered by activeWorkspace in parent)
    const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!isOpen) return null;

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">GCS Memory Store</h2>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs text-gray-500 font-mono">bucket: vee-memory</span>
                             <span className="text-xs text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-800">prefix: {activeWorkspace}/</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close archive">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search objects in ${activeWorkspace}...`}
                            className="block w-full rounded-md border-0 bg-gray-800 py-2.5 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <main className="flex-1 p-4 overflow-y-auto">
                    {filteredFiles.length > 0 ? (
                         <ul role="list" className="divide-y divide-gray-700/80">
                            {filteredFiles.map((file) => (
                                <li key={file.id || file.gcsPath} className="flex items-center justify-between gap-x-6 py-3 group">
                                    <div className="flex min-w-0 gap-x-4 items-center flex-1">
                                        {/* Thumbnail Preview Logic */}
                                        {file.metadata.contentType.startsWith('image/') && file.content ? (
                                            <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden border border-gray-600 bg-gray-800 relative">
                                                <img 
                                                    src={file.content} 
                                                    alt={file.name} 
                                                    className="h-full w-full object-cover" 
                                                />
                                            </div>
                                        ) : (
                                            <FileIcon className="h-10 w-10 flex-shrink-0 text-gray-400 p-1 bg-gray-800 rounded border border-gray-700/50" />
                                        )}
                                        
                                        {editingFile?.id === file.id ? (
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                value={editingFile.name}
                                                onChange={(e) => setEditingFile({ ...editingFile, name: e.target.value })}
                                                onBlur={handleRename}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                                className="flex-1 bg-gray-700 border border-indigo-500 rounded-md px-2 py-1 text-sm text-gray-100"
                                            />
                                        ) : (
                                            <div className="min-w-0 flex-auto">
                                                <p className="text-sm font-semibold leading-6 text-gray-100">{file.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <p className="truncate text-xs leading-5 text-gray-400">
                                                        {formatBytes(file.size)} • {new Date(file.updated).toLocaleDateString()}
                                                    </p>
                                                    <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 rounded border border-gray-700">
                                                        {file.metadata.type}
                                                    </span>
                                                </div>
                                               
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-1">
                                        {editingFile?.id === file.id ? (
                                            <>
                                                <button onClick={() => setEditingFile(null)} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50" aria-label="Cancel edit"><XMarkIcon className="w-5 h-5" /></button>
                                                <button onClick={handleRename} className="p-2 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-gray-700/50" aria-label="Save changes"><CheckIcon className="w-5 h-5" /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => setEditingFile({ id: file.id, name: file.name })}
                                                    className="p-2 rounded-full text-gray-500 hover:text-cyan-400 hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label={`Edit ${file.name}`}
                                                >
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(file.gcsPath)}
                                                    className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label={`Delete ${file.name}`}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No objects found in <span className="font-mono text-cyan-500">{activeWorkspace}/</span></p>
                        </div>
                    )}
                </main>
                
                <footer className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-gray-800/30">
                     <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors shadow-lg"
                    >
                       <UploadIcon className="w-5 h-5 mr-2" /> Upload to {activeWorkspace}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreativeArchive;
