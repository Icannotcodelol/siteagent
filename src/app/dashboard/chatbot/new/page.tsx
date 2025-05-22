import Link from 'next/link';
// Import the actual builder form component
import ChatbotBuilderForm from './_components/chatbot-builder-form';
// ChatPreview is only available after chatbot is saved
import BuilderHeader from './_components/builder-header'; // Import the header
import { ChatbotAppearanceProvider } from './_components/chatbot-appearance-context';
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
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-4">Chatbot Limit Reached</h1>
          <p className="mb-6">You have reached the maximum number of chatbots allowed for your current plan.</p>
          <p className="mb-6">Please upgrade your plan to create more chatbots.</p>
          <Link href="/dashboard/billing">
            {/* Basic HTML button styled with Tailwind as a placeholder */}
            <button 
              className="px-6 py-3 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Upgrade Plan
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ChatbotAppearanceProvider initialAppearance={{}}>
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Add the builder header */}
      <BuilderHeader />
      
      {/* Removed redundant breadcrumb and title */}

      {/* Layout container for the form - no specific background needed here if ChatbotBuilderForm handles its own card style */}
      <div className="mt-6"> {/* Added margin-top for spacing from header */}
        {/* The ChatbotBuilderForm will now control its own background and padding for the form area */}
        <ChatbotBuilderForm />
      </div>

      {/* Global Save/Cancel buttons might be managed within BuilderHeader or ChatbotBuilderForm */}

    </div>
    </ChatbotAppearanceProvider>
  );
} 