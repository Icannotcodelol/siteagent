'use client';

import { useState, useEffect, Fragment } from 'react';
// Import Supabase client for browser components
import { createClient } from '@/lib/supabase/client';
// Import Headless UI Dialog
import { Dialog, Transition } from '@headlessui/react'
// Import the form component
import ActionForm from './action-form';

interface ActionManagerProps {
  chatbotId: string;
}

// Define Action type based on DB schema (reuse from ActionForm or centralize)
type Action = {
  id: string;
  chatbot_id: string;
  name: string;
  description: string | null;
  trigger_keywords: string[];
  http_method: string;
  url: string;
  headers: object | null; 
  request_body_template: object | null; 
  success_message: string | null;
  created_at: string; 
};

export default function ActionManager({ chatbotId }: ActionManagerProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // State for modal and editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch actions function (keep existing logic)
  const fetchActions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('chatbot_actions')
          .select('*')
          .eq('chatbot_id', chatbotId)
          .order('created_at', { ascending: true });
        if (fetchError) throw fetchError;
        setActions(data || []);
      } catch (err: any) {
        console.error("Error fetching actions:", err);
        setError("Failed to load actions. " + err.message);
        setActions([]);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (chatbotId) {
      fetchActions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId]);

  // --- Modal Handlers ---
  const handleOpenModalForCreate = () => {
    setEditingAction(null); // Clear editing state
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (action: Action) => {
    setEditingAction(action); // Set action to edit
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAction(null); // Clear editing state on close
    setModalError(null);
  };

  // --- API Call Handlers ---
  const handleSaveAction = async (actionData: Omit<Action, 'id' | 'chatbot_id' | 'created_at'>) => {
    setIsSaving(true);
    setModalError(null);
    const apiUrl = editingAction
        ? `/api/chatbots/${chatbotId}/actions/${editingAction.id}`
        : `/api/chatbots/${chatbotId}/actions`;
    const method = editingAction ? 'PUT' : 'POST';

    try {
        const response = await fetch(apiUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Failed to ${editingAction ? 'update' : 'create'} action`);
        }
        
        // Success!
        handleCloseModal(); // Close modal
        await fetchActions(); // Refresh the list

    } catch (err: any) {
        console.error(`Error saving action (mode: ${editingAction ? 'edit' : 'create'}):`, err);
        setModalError(err.message || 'An unknown error occurred while saving.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
      if (!confirm('Are you sure you want to delete this action? This cannot be undone.')) {
          return;
      }
      
      // Optimistic UI update (optional but good UX)
      // const previousActions = actions;
      // setActions(currentActions => currentActions.filter(a => a.id !== actionId));
      setError(null); // Clear main list error

      try {
           const response = await fetch(`/api/chatbots/${chatbotId}/actions/${actionId}`, {
                method: 'DELETE',
            });

            const result = await response.json(); // Even on success, check message

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete action');
            }
            
            // Success - fetch actions again to confirm deletion from server
            await fetchActions(); 
            
      } catch (err: any) {
          console.error("Error deleting action:", err);
          setError(`Failed to delete action: ${err.message}`); // Show error in main list area
          // Rollback optimistic update if it was implemented
          // setActions(previousActions);
      }
  };

  // --- Render Logic ---
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-white">Webhook & API Actions</h3>
      <p className="mt-1 text-sm text-gray-400">
        Configure external APIs or webhooks to be triggered based on keywords in the user's message.
      </p>

      {/* Add New Action Button */}
      <div className="text-right">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
          onClick={handleOpenModalForCreate} // Open modal for create
        >
          Add New Action
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-400">Loading actions...</p>
        </div>
      )}

      {/* Error State (for list fetching) */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Empty State / Action List */}
      {!isLoading && !error && (
        <div>
          {actions.length === 0 ? (
             <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                 <svg /* Placeholder icon */ className="mx-auto h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.11c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                 <h3 className="mt-2 text-sm font-medium text-white">No Actions Configured</h3>
                 <p className="mt-1 text-sm text-gray-500">Get started by adding your first API or webhook action.</p>
             </div>
          ) : (
            <ul className="space-y-3">
              {actions.map((action) => (
                <li key={action.id} className="bg-gray-800 shadow overflow-hidden rounded-md px-4 py-3 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate flex-1 min-w-0">
                      <p className="text-sm font-medium text-purple-400 truncate">{action.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">Triggers: {action.trigger_keywords.join(', ')}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{action.http_method} {action.url}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 flex space-x-3">
                       <button 
                          onClick={() => handleOpenModalForEdit(action)} // Open modal for edit
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                            Edit
                        </button>
                       <button 
                           onClick={() => handleDeleteAction(action.id)} // Call delete handler
                           className="text-xs text-red-500 hover:text-red-400"
                        >
                           Delete
                        </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal for Adding/Editing Actions */} 
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={handleCloseModal}>
           {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white mb-4"
                  >
                    {editingAction ? 'Edit Action' : 'Add New Action'}
                  </Dialog.Title>
                  
                  {/* Display modal-specific errors */}
                  {modalError && (
                      <div className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded text-sm" role="alert">
                          {modalError}
                      </div>
                  )}

                  {/* Render the ActionForm */}
                  <ActionForm 
                      chatbotId={chatbotId} // Pass chatbotId if needed by form
                      initialData={editingAction ?? {}} // Pass editing action or empty object
                      onSave={handleSaveAction} // Pass the save handler
                      onCancel={handleCloseModal} // Pass the close handler
                      isSaving={isSaving} // Pass saving state
                  />
                 
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
} 