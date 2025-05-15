'use client';

import React from 'react';

// Match the Action interface from actions-tab.tsx
interface Action {
  id: string;
  chatbot_id: string;
  name: string;
  description: string | null;
  trigger_keywords: string[];
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  is_active: boolean;
}

interface ActionCardProps {
  action: Action;
  onEdit: (action: Action) => void;
  onDelete: (actionId: string) => void;
  onToggleActive: (actionId: string, isActive: boolean) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-white">{action.name}</h3>
        <div className="flex items-center">
          <span className={`mr-3 text-xs font-semibold px-2.5 py-0.5 rounded-full ${action.is_active ? 'bg-green-700 text-green-100' : 'bg-gray-600 text-gray-100'}`}>
            {action.is_active ? 'Active' : 'Inactive'}
          </span>
          {/* Basic Toggle Switch UI */}
          <button
            type="button"
            onClick={() => onToggleActive(action.id, !action.is_active)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${action.is_active ? 'bg-indigo-600' : 'bg-gray-600'}`}
            aria-pressed={action.is_active}
          >
            <span className="sr-only">Toggle Active Status</span>
            <span
              aria-hidden="true"
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${action.is_active ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
      {action.description && <p className="text-sm text-gray-300 mb-3">{action.description}</p>}
      <div className="mb-3">
        {action.trigger_keywords.map(keyword => (
          <span key={keyword} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-xs font-semibold text-gray-200 mr-2 mb-2">
            {keyword}
          </span>
        ))}
      </div>
      <div className="flex items-center text-sm text-gray-400 mb-4">
        <span className={`inline-block text-white px-2 py-0.5 text-xs font-bold rounded mr-2 
          ${action.http_method === 'GET' ? 'bg-sky-600' : 
            action.http_method === 'POST' ? 'bg-green-600' : 
            action.http_method === 'PUT' ? 'bg-yellow-600' : 
            action.http_method === 'PATCH' ? 'bg-orange-600' : 
            action.http_method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'}
        `}>
          {action.http_method}
        </span>
        <span className="truncate" title={action.url}>{action.url}</span>
      </div>
      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => onEdit(action)}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(action.id)} 
          className="text-red-500 hover:text-red-400 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ActionCard; 