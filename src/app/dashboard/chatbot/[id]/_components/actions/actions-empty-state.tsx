'use client';

import React from 'react';

interface ActionsEmptyStateProps {
  onAddNewAction: () => void;
}

const ActionsEmptyState: React.FC<ActionsEmptyStateProps> = ({ onAddNewAction }) => {
  return (
    <div className="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-white">No Actions Configured</h3>
      <p className="mt-1 text-sm text-gray-400">Get started by adding your first API or webhook action.</p>
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
          onClick={onAddNewAction}
        >
          + Add New Action
        </button>
      </div>
    </div>
  );
};

export default ActionsEmptyState; 