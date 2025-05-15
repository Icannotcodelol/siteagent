'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ActionsEmptyState from './actions-empty-state'; 
import ActionCard from './action-card'; 
import ActionFormModal from './action-form-modal';

// Keep Action interface aligned (ensure it matches DB + API response)
interface Action {
  id: string;
  chatbot_id: string; // Add if needed based on API response or usage
  name: string;
  description: string | null;
  trigger_keywords: string[];
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: object | null; 
  request_body_template?: object | null;
  success_message?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Type for the form data coming from the modal
interface ActionFormData {
  name: string;
  description: string;
  trigger_keywords: string[]; 
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: string; // Stringified JSON
  request_body_template: string; // Stringified JSON
  success_message: string;
  is_active: boolean;
}

interface ActionsTabProps {
  chatbotId: string;
}


const ActionsTab: React.FC<ActionsTabProps> = ({ chatbotId }) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingAction, setEditingAction] = useState<Action | null>(null); 
  const [isMutating, setIsMutating] = useState(false); // Loading state for save/delete/toggle
  const [mutationError, setMutationError] = useState<string | null>(null); // Error state for mutations

  // Fetch Actions Function - Now uses API call
  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMutationError(null); // Clear mutation errors on refetch
    console.log(`Fetching actions for chatbot: ${chatbotId}`);
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/actions`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const fetchedActions: Action[] = await response.json();
      setActions(fetchedActions);
    } catch (err: any) {
      console.error("Error fetching actions:", err);
      setError(err.message || 'Failed to fetch actions.');
      setActions([]); 
    }
    setIsLoading(false);
  }, [chatbotId]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]); // Use fetchActions in dependency array

  const handleAddAction = () => {
    setEditingAction(null); 
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleEditAction = (action: Action) => {
    setEditingAction(action);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleDeleteAction = async (actionId: string) => {
    setMutationError(null);
    if (window.confirm('Are you sure you want to delete this action?')) {
      setIsMutating(true);
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}/actions/${actionId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to delete action (status: ${response.status})`);
        }
        console.log(`Action ${actionId} deleted successfully.`);
        // Refetch or optimistic update
        // setActions(prevActions => prevActions.filter(a => a.id !== actionId));
        await fetchActions(); // Refetch after delete
      } catch (err: any) {
        console.error("Error deleting action:", err);
        setMutationError(err.message || 'Failed to delete action.');
      }
      setIsMutating(false);
    }
  };

  const handleToggleActive = async (actionId: string, isActive: boolean) => {
    setIsMutating(true);
    setMutationError(null);
    console.log(`Toggling active status for action ID: ${actionId} to ${isActive}`);
    try {
       const response = await fetch(`/api/chatbots/${chatbotId}/actions/${actionId}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ is_active: isActive }), // Only send the is_active field
       });
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || `Failed to update status (status: ${response.status})`);
       }
       // Optimistic update in UI (can be removed if fetchActions is fast)
       setActions(prevActions => 
         prevActions.map(a => a.id === actionId ? { ...a, is_active: isActive } : a)
       );
       // Optionally refetch for consistency
       // await fetchActions(); 
    } catch (err: any) {
        console.error("Error toggling action status:", err);
        setMutationError(err.message || 'Failed to update action status.');
        // Revert optimistic update on error if needed
        fetchActions(); // Refetch to get the correct state back
    }
    setIsMutating(false);
  };
  
  const handleSaveAction = async (formData: ActionFormData, actionId?: string) => {
      setIsMutating(true);
      setMutationError(null);
      let headers_json: object | null = null;
      let request_body_template_json: object | null = null;
      
      // Validate and parse JSON fields before sending
      try {
         headers_json = formData.headers.trim() ? JSON.parse(formData.headers) : null;
      } catch (e) { 
          setMutationError("Invalid JSON format in Headers.");
          setIsMutating(false);
          return; 
      }
      try { 
          // Only parse body if it should exist and is not empty
          const methodNeedsBody = ['POST', 'PUT', 'PATCH'].includes(formData.http_method);
          if (methodNeedsBody && formData.request_body_template.trim()) {
              request_body_template_json = JSON.parse(formData.request_body_template);
          } else {
              request_body_template_json = null; // Ensure it's null if not needed or empty
          }
      } catch (e) { 
          setMutationError("Invalid JSON format in Request Body Template.");
          setIsMutating(false);
          return; 
      }
      
      // Prepare payload for API (excluding stringified JSON)
      const payload = {
          name: formData.name,
          description: formData.description || null,
          trigger_keywords: formData.trigger_keywords,
          http_method: formData.http_method,
          url: formData.url,
          headers: headers_json,
          request_body_template: request_body_template_json,
          success_message: formData.success_message || null,
          is_active: formData.is_active,
      };

      const url = actionId 
          ? `/api/chatbots/${chatbotId}/actions/${actionId}` 
          : `/api/chatbots/${chatbotId}/actions`;
      const method = actionId ? 'PUT' : 'POST';

      try {
          console.log(`${method} action at ${url}`);
          const response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${actionId ? 'update' : 'create'} action (status: ${response.status})`);
          }

          // If successful:
          console.log(`Action ${actionId ? 'updated' : 'created'} successfully.`);
          await fetchActions(); // Refetch actions to show the latest data
          setIsModalOpen(false);
          setEditingAction(null);

      } catch (err: any) {
          console.error(`Error ${actionId ? 'updating' : 'creating'} action:`, err);
          setMutationError(err.message || `Failed to ${actionId ? 'update' : 'create'} action.`);
      }
      setIsMutating(false);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-white">Loading actions...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error fetching actions: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Webhook & API Actions</h2>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
          onClick={handleAddAction}
          disabled={isMutating} // Disable button while mutating
        >
          + Add New Action
        </button>
      </div>

      {/* Display Mutation Error */}
      {mutationError && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded-md text-sm">
          <strong>Error:</strong> {mutationError}
        </div>
      )}

      {actions.length === 0 && !isLoading ? (
        <ActionsEmptyState onAddNewAction={handleAddAction} /> 
      ) : (
        <div className={`${isMutating ? 'opacity-50 pointer-events-none' : ''}`}> {/* Indicate loading state */}
          {actions.map(action => (
            <ActionCard 
              key={action.id} 
              action={action} 
              onEdit={handleEditAction}
              onDelete={handleDeleteAction}
              onToggleActive={handleToggleActive}
              // Pass isMutating or similar if needed to disable card actions
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ActionFormModal 
          chatbotId={chatbotId} 
          actionToEdit={editingAction}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAction}
          // Pass isMutating to disable Save button in modal?
        />
      )}
    </div>
  );
};

export default ActionsTab;
 