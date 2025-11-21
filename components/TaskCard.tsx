import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

// --- Icon Components ---
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
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateContent, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (content.trim()) {
      onUpdateContent(task.id, content.trim());
    } else {
        // if content is empty, restore original
        setContent(task.content);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(task.content);
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      className="bg-gray-800 p-3 rounded-lg border border-gray-700/80 shadow-md cursor-grab active:cursor-grabbing"
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
                if (e.key === 'Escape') { handleCancel(); }
            }}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-200 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={handleCancel} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700" aria-label="Cancel edit"><XMarkIcon className="w-4 h-4" /></button>
            <button onClick={handleSave} className="p-1.5 rounded-md text-cyan-400 hover:text-cyan-300 hover:bg-gray-700" aria-label="Save changes"><CheckIcon className="w-4 h-4"/></button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start gap-2 group">
          <p className="text-sm text-gray-300 break-words py-1">{task.content}</p>
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-1 rounded-md text-gray-500 hover:text-cyan-400 hover:bg-gray-700/50" aria-label="Edit task"><EditIcon className="w-4 h-4" /></button>
            <button onClick={() => onDelete(task.id)} className="p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-700/50" aria-label="Delete task"><TrashIcon className="w-4 h-4"/></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
