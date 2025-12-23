
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';
import ConnectionsManager from './components/ConnectionsManager';
import CreativeArchive from './components/CreativeArchive';
import SettingsPanel from './components/SettingsPanel';
import EbayDashboard from './components/EbayDashboard';
import { Task, TaskStatus, ArchivedFile } from './types';
import { getConnections, connect, disconnect, Connection } from './services/authService';
import * as creativeArchiveService from './services/creativeArchiveService';
import { initializeAgent } from './services/veeAgentService';

import { AuthProvider, useAuth } from './components/AuthContext';

const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginWithGithub, error } = useAuth();
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-gray-200 overflow-hidden relative">
      {/* Error Notification */}
      {error && (
        <div className="absolute top-10 transform -translate-x-1/2 left-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-xl animate-bounce-slow font-bold flex items-center gap-2 backdrop-blur-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="bg-gray-800/80 backdrop-blur-xl p-10 rounded-2xl border border-gray-700/50 shadow-2xl space-y-8 text-center max-w-md w-full z-10 relative overflow-hidden group">

        {/* Subtle border gradient on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-500/20 transition-colors pointer-events-none"></div>

        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
          <span className="text-7xl relative z-10 animate-bounce-slow">✨</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient-x bg-[length:200%_auto]">
            VEE-THREE
          </h1>
          <p className="text-gray-400 font-light tracking-wide text-sm uppercase">Virtual Ecosystem Engineer</p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3.5 rounded-xl font-bold hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-white/5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27c3.2 0 5.22 1.83 5.71 2.37l2.18-2.18C18.72 3.28 16.09 2 12.16 2 6.6 2 2 6.6 2 12s4.6 10 10.16 10c5.71 0 9.49-3.9 9.49-9.66c0-.6 0-1.1-.1-1.24z" /></svg>
            Sign in with Google
          </button>
          <button
            onClick={loginWithGithub}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white py-3.5 rounded-xl font-bold hover:bg-[#2f363d] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" /></svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

const VeeApp: React.FC = () => {
  const { user, isLoading } = useAuth();

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskBoardOpen, setIsTaskBoardOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEbayOpen, setIsEbayOpen] = useState(false);
  const [connections, setConnections] = useState<Record<string, Connection | null>>({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [archiveFiles, setArchiveFiles] = useState<ArchivedFile[]>([]);

  // New State: Active Workspace (defaults to 'v3_ecosystem')
  const [activeWorkspace, setActiveWorkspace] = useState<string>('v3_ecosystem');

  // Initialize the VEE Agent Scheduler
  useEffect(() => {
    initializeAgent();
  }, []);

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('vee_tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      setConnections(getConnections());
      // Initial load for default workspace
      setArchiveFiles(creativeArchiveService.listFiles(activeWorkspace));
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }
  }, []);

  // Reload archive files when workspace changes
  useEffect(() => {
    setArchiveFiles(creativeArchiveService.listFiles(activeWorkspace));
  }, [activeWorkspace, isArchiveOpen]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('vee_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
    }
  }, [tasks]);

  const handleToggleTaskBoard = () => setIsTaskBoardOpen(prev => !prev);
  const handleToggleConnections = () => setIsConnectionsOpen(prev => !prev);
  const handleToggleArchive = () => setIsArchiveOpen(prev => !prev);
  const handleToggleSettings = () => setIsSettingsOpen(prev => !prev);
  const handleToggleEbay = () => setIsEbayOpen(prev => !prev);

  const handleConnect = async (service: 'google' | 'github' | 'vercel') => {
    const newConnection = await connect(service);
    if (newConnection) {
      setConnections(prev => ({ ...prev, [service]: newConnection }));
    }
  };

  const handleDisconnect = (service: 'google' | 'github' | 'vercel') => {
    disconnect(service);
    setConnections(prev => ({ ...prev, [service]: null }));
  };

  const addTask = (content: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      content,
      status: TaskStatus.TODO,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, status: newStatus } : task));
  };

  const updateTaskContent = (id: string, newContent: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, content: newContent } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleUploadToArchive = async (files: File[]) => {
    for (const file of files) {
      await creativeArchiveService.uploadFile(file, activeWorkspace);
    }
    setArchiveFiles(creativeArchiveService.listFiles(activeWorkspace));
  };

  const handleDeleteFromArchive = (gcsPath: string) => {
    creativeArchiveService.deleteFile(gcsPath);
    setArchiveFiles(creativeArchiveService.listFiles(activeWorkspace));
  };

  const handleRenameArchiveFile = (oldPath: string, newName: string) => {
    const success = creativeArchiveService.renameFile(oldPath, newName);
    if (success) {
      setArchiveFiles(creativeArchiveService.listFiles(activeWorkspace));
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-400">
        <div className="animate-pulse">Initializing VEE-THREE...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="bg-gray-900 text-gray-200 font-sans">
      <Sidebar
        onToggleTaskBoard={handleToggleTaskBoard}
        onToggleConnections={handleToggleConnections}
        onToggleArchive={handleToggleArchive}
        onToggleSettings={handleToggleSettings}
        onToggleEbay={handleToggleEbay}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        user={user}
      />
      <div className="pl-20"> {/* This padding is equal to the collapsed sidebar width */}
        <div className="min-h-screen flex flex-col">
          <Header
            isAudioEnabled={isAudioEnabled}
            onToggleAudio={() => setIsAudioEnabled(prev => !prev)}
            isScreenSharing={isScreenSharing}
            activeWorkspace={activeWorkspace}
            user={user}
          />
          <main className="flex-1 h-screen overflow-y-hidden p-4">
            <ChatInterface
              isAudioEnabled={isAudioEnabled}
              onAddTask={addTask}
              tasks={tasks}
              onUpdateTaskStatus={updateTaskStatus}
              onDeleteTask={deleteTask}
              isScreenSharing={isScreenSharing}
              onSetIsScreenSharing={setIsScreenSharing}
              connections={connections}
              onRenameArchiveFile={handleRenameArchiveFile}
              onUploadToArchive={handleUploadToArchive}
              activeWorkspace={activeWorkspace}
            />
          </main>
        </div>
      </div>
      <TaskBoard
        isOpen={isTaskBoardOpen}
        onClose={handleToggleTaskBoard}
        tasks={tasks}
        onAddTask={addTask}
        onUpdateTaskStatus={updateTaskStatus}
        onUpdateTaskContent={updateTaskContent}
        onDeleteTask={deleteTask}
      />
      <ConnectionsManager
        isOpen={isConnectionsOpen}
        onClose={handleToggleConnections}
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <CreativeArchive
        isOpen={isArchiveOpen}
        onClose={handleToggleArchive}
        files={archiveFiles}
        onUpload={handleUploadToArchive}
        onDelete={handleDeleteFromArchive}
        onRename={handleRenameArchiveFile}
        activeWorkspace={activeWorkspace}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleToggleSettings}
      />
      <EbayDashboard
        isOpen={isEbayOpen}
        onClose={handleToggleEbay}
      />
    </div>
  );
};

// Root Component
const App = () => (
  <AuthProvider>
    <VeeApp />
  </AuthProvider>
);

export default App;
