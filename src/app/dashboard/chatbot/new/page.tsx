import Link from 'next/link';
// Import the actual builder form component
import ChatbotBuilderForm from './_components/chatbot-builder-form';
// ChatPreview is only available after chatbot is saved
import BuilderHeader from './_components/builder-header'; // Import the header
import { ChatbotAppearanceProvider } from './_components/chatbot-appearance-context';

// TODO: Implement the actual chatbot creation form component
// import CreateChatbotForm from './_components/create-chatbot-form';

export default function NewChatbotPage() {

  // TODO: Add logic to handle form submission using a server action

  return (
    <ChatbotAppearanceProvider initialAppearance={{}}>
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Add the builder header */}
      <BuilderHeader />
      
      {/* Remove redundant breadcrumb and title */}
      {/* 
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/" className="hover:text-indigo-400">Dashboard</Link>
          </li>
          <li>
            <span className="text-gray-600">/</span>
          </li>
          <li className="font-medium text-gray-200" aria-current="page">
            Create New Chatbot
          </li>
        </ol>
      </nav>
      <h1 className="text-3xl font-semibold text-white mb-6">Create New Chatbot</h1> 
      */}

      {/* Two-column layout - Adjust styling slightly? */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Form */}
        {/* Use slightly darker bg, maybe remove padding if form adds it */}
        <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           {/* Remove <h2/> and <p/> placeholders */}
           {/* <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2> */}
           {/* <p className="text-gray-400">Form elements will go here...</p> */}
           <ChatbotBuilderForm />
        </div>

        {/* Right Column reserved for preview after save */}

      </div>

      {/* TODO: Add global Save/Cancel buttons here later */}

    </div>
    </ChatbotAppearanceProvider>
  );
} 