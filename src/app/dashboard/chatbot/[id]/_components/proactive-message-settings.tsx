import { getProactiveMessageForChatbot } from '@/app/actions/proactive-messages'
import ProactiveMessageForm from './proactive-message-form' // Assuming same directory for the form

interface ProactiveMessageSettingsProps {
  chatbotId: string
}

export default async function ProactiveMessageSettings({
  chatbotId,
}: ProactiveMessageSettingsProps) {
  const proactiveMessage = await getProactiveMessageForChatbot(chatbotId)

  // You might want to add a loading state here if the fetch can be slow,
  // or handle potential errors from getProactiveMessageForChatbot more explicitly.
  // For now, we directly pass the result (or null) to the form.

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Proactive Message
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure a message that appears automatically to engage visitors.
          Only one proactive message can be active at a time.
        </p>
      </div>
      <ProactiveMessageForm
        chatbotId={chatbotId}
        initialData={proactiveMessage}
      />
    </div>
  )
} 