import React, { useState, useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import TaskColumn from './TaskColumn';

// --- Icon Components ---
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);


interface TaskBoardProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddTask: (content: string) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onUpdateTaskContent: (id: string, content: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ 
  isOpen, onClose, tasks, onAddTask, onUpdateTaskStatus, onUpdateTaskContent, onDeleteTask 
}) => {
    const [newTaskContent, setNewTaskContent] = useState('');
    
    const handleAddTask = () => {
        if (newTaskContent.trim()) {
            onAddTask(newTaskContent.trim());
            setNewTaskContent('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    };
    
    const tasksByStatus = useMemo(() => {
        return tasks.reduce((acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100">VEE Task Board</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close task board">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                    {Object.values(TaskStatus).map(status => (
                        <TaskColumn 
                            key={status} 
                            status={status} 
                            tasks={tasksByStatus[status] || []}
                            onDrop={onUpdateTaskStatus}
                            onUpdateContent={onUpdateTaskContent}
                            onDelete={onDeleteTask}
                        />
                    ))}
                </main>
                <footer className="p-4 border-t border-gray-700/50 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newTaskContent}
                            onChange={(e) => setNewTaskContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a new task to 'To Do'..."
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                        <button
                            onClick={handleAddTask}
                            disabled={!newTaskContent.trim()}
                            className="flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
                        >
                           <PlusIcon className="w-5 h-5 mr-1" /> Add Task
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TaskBoard;
