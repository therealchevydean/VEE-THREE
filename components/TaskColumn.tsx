import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'border-yellow-500/50',
    [TaskStatus.IN_PROGRESS]: 'border-cyan-500/50',
    [TaskStatus.COMPLETED]: 'border-green-500/50',
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onUpdateContent, onDelete, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        onDrop(taskId, status);
    }
    setIsDragOver(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col p-3 bg-gray-900/50 rounded-lg h-full transition-colors ${isDragOver ? 'bg-indigo-900/40' : ''}`}
    >
      <h3 className={`text-md font-semibold text-gray-300 mb-3 border-b-2 pb-2 ${statusColors[status]}`}>{status} <span className="text-sm text-gray-500 font-normal">({tasks.length})</span></h3>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onUpdateContent={onUpdateContent} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
