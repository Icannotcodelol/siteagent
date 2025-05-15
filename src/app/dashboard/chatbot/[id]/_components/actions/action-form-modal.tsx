'use client';

import React, { useState, useEffect } from 'react';

// Match the Action interface - include all fields needed for the form
interface Action {
  id: string;
  name: string;
  description: string | null;
  trigger_keywords: string[];
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: object | null; // Allow optional/null
  request_body_template?: object | null; // Allow optional/null
  success_message?: string | null; // Allow optional/null
  is_active: boolean;
}

// Type for the form data, handling JSON fields as strings initially
interface ActionFormData {
  name: string;
  description: string;
  trigger_keywords: string[]; 
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: string; // Use string for textarea input
  request_body_template: string; // Use string for textarea input
  success_message: string;
  is_active: boolean;
}

interface ActionFormModalProps {
  chatbotId?: string; // Added optional chatbotId to match callers
  actionToEdit: Action | null; // If null, it's an 'Add New' modal
  onClose: () => void;
  onSave: (formData: ActionFormData, actionId?: string) => void; // Pass form data and ID if editing
  // Consider passing isLoading prop for save button state
}

const ActionFormModal: React.FC<ActionFormModalProps> = ({ 
    chatbotId, // Removed
    actionToEdit, 
    onClose, 
    onSave 
}) => {
  const headersPlaceholder = `{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{vault:YOUR_SECRET_NAME}}"\n}`;

  const requestBodyPlaceholder = `{\n  "query": "{{user_query}}",\n  "details": {\n    "source_chatbot_id": "{{chatbot_id}}",\n    "request_time": "{{timestamp}}"\n  }\n}`;

  const successMessagePlaceholder = "e.g., Okay, I processed your request. Ref ID: {{response.id}}";

  const [formData, setFormData] = useState<ActionFormData>({
    name: '',
    description: '',
    trigger_keywords: [],
    http_method: 'GET',
    url: '',
    headers: '', // Initialize JSON fields as empty strings
    request_body_template: '', 
    success_message: '',
    is_active: true,
  });
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); // For validation

  const isEditing = actionToEdit !== null;

  useEffect(() => {
    if (isEditing && actionToEdit) {
      // Populate form if editing
      setFormData({
        name: actionToEdit.name || '',
        description: actionToEdit.description || '',
        trigger_keywords: actionToEdit.trigger_keywords || [],
        http_method: actionToEdit.http_method || 'GET',
        url: actionToEdit.url || '',
        headers: actionToEdit.headers ? JSON.stringify(actionToEdit.headers, null, 2) : '', // Prettify JSON for textarea
        request_body_template: actionToEdit.request_body_template ? JSON.stringify(actionToEdit.request_body_template, null, 2) : '',
        success_message: actionToEdit.success_message || '',
        is_active: actionToEdit.is_active ?? true,
      });
    } else {
      // Reset form if adding
      setFormData({
        name: '',
        description: '',
        trigger_keywords: [],
        http_method: 'GET',
        url: '',
        headers: '',
        request_body_template: '',
        success_message: '',
        is_active: true,
      });
    }
  }, [actionToEdit, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific error when user types
    if (formErrors[name]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setFormErrors(prev => { const { [name]: _, ...rest } = prev; return rest; });
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, is_active: e.target.checked }));
  };

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !formData.trigger_keywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({ ...prev, trigger_keywords: [...prev.trigger_keywords, currentKeyword.trim()] }));
      setCurrentKeyword(''); // Clear input
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({ ...prev, trigger_keywords: prev.trigger_keywords.filter(k => k !== keywordToRemove) }));
  };

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentKeyword(e.target.value);
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission on Enter
      handleAddKeyword();
    }
  };

  // Basic validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Action Name is required.';
    if (formData.trigger_keywords.length === 0) errors.trigger_keywords = 'At least one Trigger Keyword is required.';
    if (!formData.url.trim()) errors.url = 'URL is required.';
    // Validate URL format (basic)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try { new URL(formData.url); } catch (_) { errors.url = 'Invalid URL format.'; }
    // Validate JSON format for headers (if not empty)
    if (formData.headers.trim()) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        try { JSON.parse(formData.headers); } catch (_) { errors.headers = 'Headers must be valid JSON or empty.'; }
    }
    // Validate JSON format for body (if not empty and applicable method)
    if (needsRequestBody(formData.http_method) && formData.request_body_template.trim()) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        try { JSON.parse(formData.request_body_template); } catch (_) { errors.request_body_template = 'Request Body Template must be valid JSON or empty.'; }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form is valid, submitting:", formData);
      onSave(formData, actionToEdit?.id); // Pass ID if editing
    } else {
        console.log("Form validation failed:", formErrors);
    }
  };

  const needsRequestBody = (method: string) => {
    return ['POST', 'PUT', 'PATCH'].includes(method);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay, click outside to close */}
        <div className="fixed inset-0" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-white mb-4" id="modal-title">
                    {isEditing ? 'Edit Action' : 'Add New Action'}
                  </h3>
                  
                  {/* Action Name */}
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Action Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Check Order Status"
                      className={`mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.name ? 'border-red-500' : ''}`}
                    />
                     {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description (Optional)</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Briefly describe what this action does."
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Trigger Keywords */}
                  <div className="mb-4">
                    <label htmlFor="trigger_keywords" className="block text-sm font-medium text-gray-300">Trigger Keywords</label>
                    <div className="flex items-center mt-1">
                      <input
                        type="text"
                        id="trigger_keywords"
                        value={currentKeyword}
                        onChange={handleKeywordInputChange}
                        onKeyDown={handleKeywordKeyDown}
                        placeholder="Type a keyword and press Enter"
                        className={`flex-grow rounded-l-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.trigger_keywords ? 'border-red-500' : ''}`}
                      />
                      <button 
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                      >
                        +
                      </button>
                    </div>
                     {formErrors.trigger_keywords && <p className="mt-1 text-xs text-red-400">{formErrors.trigger_keywords}</p>}
                    <div className="mt-2 space-x-2 space-y-2">
                      {formData.trigger_keywords.map(keyword => (
                        <span key={keyword} className="inline-flex items-center bg-gray-700 rounded-full px-3 py-1 text-xs font-semibold text-gray-200">
                          {keyword}
                          <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="ml-1.5 text-gray-400 hover:text-white focus:outline-none">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* HTTP Method & URL */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="http_method" className="block text-sm font-medium text-gray-300">HTTP Method</label>
                      <select
                        name="http_method"
                        id="http_method"
                        value={formData.http_method}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-300">URL</label>
                      <input
                        type="url" 
                        name="url"
                        id="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        placeholder="https://api.example.com/data"
                        className={`mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.url ? 'border-red-500' : ''}`}
                      />
                       {formErrors.url && <p className="mt-1 text-xs text-red-400">{formErrors.url}</p>}
                    </div>
                  </div>

                  {/* Headers */}
                  <div className="mb-4">
                    <label htmlFor="headers" className="block text-sm font-medium text-gray-300">Headers (JSON Format)</label>
                    <textarea
                      name="headers"
                      id="headers"
                      rows={4}
                      value={formData.headers}
                      onChange={handleInputChange}
                      placeholder={headersPlaceholder}
                      className={`font-mono mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.headers ? 'border-red-500' : ''}`}
                    />
                    <p className="mt-1 text-xs text-gray-400">{'Use `{{vault:YOUR_SECRET_NAME}}` to securely include secrets.'}</p>
                     {formErrors.headers && <p className="mt-1 text-xs text-red-400">{formErrors.headers}</p>}
                  </div>

                  {/* Request Body Template (Conditional) */}
                  {needsRequestBody(formData.http_method) && (
                    <div className="mb-4">
                      <label htmlFor="request_body_template" className="block text-sm font-medium text-gray-300">Request Body Template (JSON Format)</label>
                      <textarea
                        name="request_body_template"
                        id="request_body_template"
                        rows={6}
                        value={formData.request_body_template}
                        onChange={handleInputChange}
                        placeholder={requestBodyPlaceholder}
                        className={`font-mono mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.request_body_template ? 'border-red-500' : ''}`}
                      />
                      <p className="mt-1 text-xs text-gray-400">{'Use `{{vault:SECRET}}`, `{{user_query}}`, `{{chatbot_id}}`, `{{timestamp}}`.'}</p>
                       {formErrors.request_body_template && <p className="mt-1 text-xs text-red-400">{formErrors.request_body_template}</p>}
                    </div>
                  )}

                  {/* Success Message */}
                  <div className="mb-4">
                    <label htmlFor="success_message" className="block text-sm font-medium text-gray-300">Success Message (Optional)</label>
                    <textarea
                      name="success_message"
                      id="success_message"
                      rows={3}
                      value={formData.success_message}
                      onChange={handleInputChange}
                      placeholder={successMessagePlaceholder}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-400">{'Use `{{response.path.to.value}}` to include data from the API response.'}</p>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center mb-4">
                     <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={handleToggleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                     />
                     <label htmlFor="is_active" className="ml-2 block text-sm text-gray-300">Enable Action</label>
                  </div>

                </div>
              </div>
            </div>
            {/* Modal Actions (Save/Cancel) */}
            <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isEditing ? 'Update Action' : 'Save Action'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActionFormModal; 