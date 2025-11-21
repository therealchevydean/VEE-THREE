import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';
import ConnectionsManager from './components/ConnectionsManager';
import CreativeArchive from './components/CreativeArchive';
import { Task, TaskStatus, ArchivedFile } from './types';
import { getConnections, connect, disconnect, Connection } from './services/authService';
import * as creativeArchiveService from './services/creativeArchiveService';

const App: React.FC = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskBoardOpen, setIsTaskBoardOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [connections, setConnections] = useState<Record<string, Connection | null>>({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [archiveFiles, setArchiveFiles] = useState<ArchivedFile[]>([]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('vee_tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      setConnections(getConnections());
      setArchiveFiles(creativeArchiveService.listFiles());
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }
  }, []);

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
      await creativeArchiveService.uploadFile(file);
    }
    setArchiveFiles(creativeArchiveService.listFiles());
  };

  const handleDeleteFromArchive = (id: string) => {
    creativeArchiveService.deleteFile(id);
    setArchiveFiles(creativeArchiveService.listFiles());
  };

  const handleRenameArchiveFile = (id: string, newName: string) => {
    const success = creativeArchiveService.renameFile(id, newName);
    if (success) {
      setArchiveFiles(creativeArchiveService.listFiles());
    }
    return success;
  };

  return (
    <div className="bg-gray-900 text-gray-200 font-sans">
      <Sidebar 
        onToggleTaskBoard={handleToggleTaskBoard}
        onToggleConnections={handleToggleConnections}
        onToggleArchive={handleToggleArchive}
      />
      <div className="pl-20"> {/* This padding is equal to the collapsed sidebar width */}
        <div className="min-h-screen flex flex-col">
          <Header 
            isAudioEnabled={isAudioEnabled} 
            onToggleAudio={() => setIsAudioEnabled(prev => !prev)}
            isScreenSharing={isScreenSharing}
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
      />
    </div>
  );
};

export default App;