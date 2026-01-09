import * as React from 'react';
import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';
import EngineView from './src/pages/EngineView';
import ConnectionsManager from './components/ConnectionsManager';
import CreativeArchive from './components/CreativeArchive';
import SettingsPanel from './components/SettingsPanel';
import EbayDashboard from './components/EbayDashboard';
import { Task, TaskStatus, ArchivedFile } from './types';
import { getConnections, connect, disconnect, Connection } from './services/authService';
import * as creativeArchiveService from './services/creativeArchiveService';
import { initializeAgent } from './services/veeAgentService';
import { AuthProvider, useAuth } from './components/AuthContext';

const VeeApp: React.FC = () => {
  const { user } = useAuth();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskBoardOpen, setIsTaskBoardOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEbayOpen, setIsEbayOpen] = useState(false);
  const [isEngineOpen, setIsEngineOpen] = useState(false);
  const [connections, setConnections] = useState<Record<string, Connection | null>>({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [archiveFiles, setArchiveFiles] = useState<ArchivedFile[]>([]);

  // Active Workspace (defaults to 'v3_ecosystem')
  const [activeWorkspace, setActiveWorkspace] = useState<string>('v3_ecosystem');

  // Initialize the VEE Agent Scheduler
  useEffect(() => {
    initializeAgent();
  }, []);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const initData = async () => {
      try {
        const storedTasks = localStorage.getItem('vee_tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
        setConnections(getConnections());
        // Initial load for default workspace
        const files = await creativeArchiveService.listFiles(activeWorkspace);
        setArchiveFiles(files);
      } catch (error) {
        console.error("Failed to load data from localStorage:", error);
      }
    };
    initData();
  }, []);

  // Reload archive files when workspace changes
  useEffect(() => {
    const loadArchive = async () => {
      const files = await creativeArchiveService.listFiles(activeWorkspace);
      setArchiveFiles(files);
    };
    loadArchive();
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
  const handleToggleEngine = () => setIsEngineOpen(prev => !prev);

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
    const updatedFiles = await creativeArchiveService.listFiles(activeWorkspace);
    setArchiveFiles(updatedFiles);
  };

  const handleDeleteFromArchive = async (gcsPath: string) => {
    await creativeArchiveService.deleteFile(gcsPath);
    const updatedFiles = await creativeArchiveService.listFiles(activeWorkspace);
    setArchiveFiles(updatedFiles);
  };

  const handleRenameArchiveFile = async (oldPath: string, newName: string) => {
    const success = await creativeArchiveService.renameFile(oldPath, newName);
    if (success) {
      const updatedFiles = await creativeArchiveService.listFiles(activeWorkspace);
      setArchiveFiles(updatedFiles);
    }
    return success;
  };

  return (
    <div className="bg-gray-900 text-gray-200 font-sans">
      <Sidebar
        onToggleTaskBoard={handleToggleTaskBoard}
        onToggleConnections={handleToggleConnections}
        onToggleArchive={handleToggleArchive}
        onToggleSettings={handleToggleSettings}
        onToggleEbay={handleToggleEbay}
        onToggleEngine={handleToggleEngine}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        user={user!}
      />
      <div className="pl-20"> {/* This padding is equal to the collapsed sidebar width */}
        <div className="min-h-screen flex flex-col">
          <Header
            isAudioEnabled={isAudioEnabled}
            onToggleAudio={() => setIsAudioEnabled(prev => !prev)}
            isScreenSharing={isScreenSharing}
            activeWorkspace={activeWorkspace}
            user={user!}
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
      <EngineView
        isOpen={isEngineOpen}
        onClose={handleToggleEngine}
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
