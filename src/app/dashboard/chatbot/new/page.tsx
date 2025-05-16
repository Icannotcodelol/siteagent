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