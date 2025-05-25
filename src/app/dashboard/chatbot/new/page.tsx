import Link from 'next/link';
import { Suspense } from 'react';
// Import the actual builder form component
import ChatbotBuilderForm from './_components/chatbot-builder-form';
// ChatPreview is only available after chatbot is saved
import BuilderHeader from './_components/builder-header'; // Import the header
import { ChatbotAppearanceProvider } from './_components/chatbot-appearance-context';
import { FormSkeleton } from './_components/loading-states';
import { ErrorBoundary } from './_components/error-boundary';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { canCreateChatbot } from '@/lib/services/subscriptionService';

// TODO: Implement the actual chatbot creation form component
// import CreateChatbotForm from './_components/create-chatbot-form';

export default async function NewChatbotPage() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?message=Please log in to create a chatbot.');
  }

  const userCanCreate = await canCreateChatbot(user.id, supabase);

  if (!userCanCreate) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Chatbot Limit Reached</h1>
            <p className="text-gray-400 mb-4">You have reached the maximum number of chatbots allowed for your current plan.</p>
            <p className="text-gray-400 mb-6">Please upgrade your plan to create more chatbots.</p>
          </div>
          <div className="space-y-3">
            <Link href="/dashboard/billing">
              <button className="w-full px-6 py-3 rounded-md font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                Upgrade Plan
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full px-6 py-3 rounded-md font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatbotAppearanceProvider initialAppearance={{}}>
      <div className="min-h-screen bg-gray-950 text-white p-6">
        {/* Add the builder header */}
        <BuilderHeader />
        
        {/* Layout container for the form */}
        <div className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<FormSkeleton />}>
              <ChatbotBuilderForm />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </ChatbotAppearanceProvider>
  );
} 