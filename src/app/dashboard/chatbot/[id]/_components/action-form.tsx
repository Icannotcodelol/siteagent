'use client';

import { useState, useEffect, FormEvent } from 'react';

// Match the Action type from ActionManager (or use generated types)
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

// Define props for the form
interface ActionFormProps {
  chatbotId: string; // Needed?
  initialData?: Partial<Action>; // For editing existing actions
  onSave: (actionData: Omit<Action, 'id' | 'chatbot_id' | 'created_at'>) => Promise<void>; // Callback when save is successful
  onCancel: () => void; // Callback to close the form/modal
  isSaving: boolean; // Prop to indicate save is in progress
}

// Define allowed HTTP methods
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function ActionForm({ 
    initialData = {},
    onSave,
    onCancel,
    isSaving
}: ActionFormProps) {
    // Form state
    const [name, setName] = useState(initialData.name || '');
    const [description, setDescription] = useState(initialData.description || '');
    // Handle keywords as a comma-separated string in the input
    const [keywordsString, setKeywordsString] = useState(initialData.trigger_keywords?.join(', ') || '');
    const [url, setUrl] = useState(initialData.url || '');
    const [httpMethod, setHttpMethod] = useState(initialData.http_method || 'POST');
    // Handle JSON fields as strings in textareas
    const [headersString, setHeadersString] = useState(initialData.headers ? JSON.stringify(initialData.headers, null, 2) : '');
    const [bodyTemplateString, setBodyTemplateString] = useState(initialData.request_body_template ? JSON.stringify(initialData.request_body_template, null, 2) : '');
    const [successMessage, setSuccessMessage] = useState(initialData.success_message || '');
    const [error, setError] = useState<string | null>(null);

    // Reset error when inputs change
    useEffect(() => {
        setError(null);
    }, [name, description, keywordsString, url, httpMethod, headersString, bodyTemplateString, successMessage]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // --- Basic Validation --- 
        if (!name.trim()) return setError('Action name is required.');
        if (!keywordsString.trim()) return setError('Trigger keywords are required.');
        if (!url.trim()) return setError('URL is required.');
        if (!httpMethod) return setError('HTTP method is required.');

        let headers = null;
        if (headersString.trim()) {
            try {
                headers = JSON.parse(headersString);
            } catch (err) {
                return setError('Headers field contains invalid JSON.');
            }
        }

        let request_body_template = null;
        if (bodyTemplateString.trim()) {
            try {
                request_body_template = JSON.parse(bodyTemplateString);
            } catch (err) {
                return setError('Request Body Template field contains invalid JSON.');
            }
        }

        // Parse keywords string into array
        const trigger_keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k !== '');
        if (trigger_keywords.length === 0) {
             return setError('At least one trigger keyword is required.');
        }

        // Construct data payload
        const actionData = {
            name: name.trim(),
            description: description.trim() || null,
            trigger_keywords,
            url: url.trim(),
            http_method: httpMethod,
            headers,
            request_body_template,
            success_message: successMessage.trim() || null,
        };
        
        // Call the onSave prop (which will handle the API call)
        await onSave(actionData); 
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Added padding */} 
            <div>
                <label htmlFor="action-name" className="block text-sm font-medium text-gray-300">Action Name *</label>
                <input
                    type="text"
                    id="action-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    disabled={isSaving}
                />
            </div>

            <div>
                <label htmlFor="action-description" className="block text-sm font-medium text-gray-300">Description</label>
                <input
                    type="text"
                    id="action-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    disabled={isSaving}
                />
            </div>

             <div>
                <label htmlFor="action-keywords" className="block text-sm font-medium text-gray-300">Trigger Keywords (comma-separated) *</label>
                <input
                    type="text"
                    id="action-keywords"
                    value={keywordsString}
                    onChange={(e) => setKeywordsString(e.target.value)}
                    placeholder="e.g. book demo, schedule call, appointment"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    disabled={isSaving}
                />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="action-method" className="block text-sm font-medium text-gray-300">HTTP Method *</label>
                    <select
                        id="action-method"
                        value={httpMethod}
                        onChange={(e) => setHttpMethod(e.target.value)}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        disabled={isSaving}
                    >
                        {HTTP_METHODS.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="action-url" className="block text-sm font-medium text-gray-300">URL *</label>
                    <input
                        type="url" // Use type url for basic validation
                        id="action-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://api.example.com/endpoint"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        disabled={isSaving}
                    />
                 </div>
            </div>

            <div>
                <label htmlFor="action-headers" className="block text-sm font-medium text-gray-300">Headers (JSON)</label>
                 <textarea
                    id="action-headers"
                    rows={3}
                    value={headersString}
                    onChange={(e) => setHeadersString(e.target.value)}
                    placeholder='{ "Content-Type": "application/json", "Authorization": "Bearer YOUR_API_KEY" }'
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm font-mono" // Added font-mono
                    disabled={isSaving}
                />
                <p className="mt-1 text-xs text-gray-500">Enter a valid JSON object. For security, consider using Supabase Vault for sensitive keys.</p>
            </div>

             <div>
                <label htmlFor="action-body" className="block text-sm font-medium text-gray-300">Request Body Template (JSON)</label>
                 <textarea
                    id="action-body"
                    rows={4}
                    value={bodyTemplateString}
                    onChange={(e) => setBodyTemplateString(e.target.value)}
                    placeholder='{ "user_query": "{{query}}", "chat_history": "{{history}}" } \n(Placeholders like {{query}} will be added later)'
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm font-mono"
                    disabled={isSaving}
                />
                 <p className="mt-1 text-xs text-gray-500">Enter a valid JSON object. Template variables will be implemented later.</p>
            </div>

            <div>
                <label htmlFor="action-success-message" className="block text-sm font-medium text-gray-300">Success Message (Optional)</label>
                <input
                    type="text"
                    id="action-success-message"
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    placeholder="Okay, I've scheduled that for you!"
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    disabled={isSaving}
                />
                 <p className="mt-1 text-xs text-gray-500">Message shown to the user if the action succeeds.</p>
            </div>

            {/* Error Display */} 
            {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded text-sm" role="alert">
                    {error}
                </div>
            )}

            {/* Action Buttons */} 
            <div className="flex justify-end gap-3 pt-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSaving ? 'bg-purple-800 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500`}
                >
                    {isSaving ? 'Saving...' : (initialData.id ? 'Update Action' : 'Save Action')}
                </button>
            </div>
        </form>
    );
} 