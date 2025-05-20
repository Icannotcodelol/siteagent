'use client'

import { useState, useEffect, useTransition, ChangeEvent, FormEvent } from 'react'
import {
  ProactiveMessage,
  upsertProactiveMessage,
  deleteProactiveMessage,
} from '@/app/actions/proactive-messages'
import { Button } from '@/app/_components/ui/button'
// Using standard HTML elements for Input, Textarea, Label, and a checkbox for Switch
// import { Input } from '@/app/_components/ui/input';
// import { Textarea } from '@/app/_components/ui/textarea';
// import { Label } from '@/app/_components/ui/label';
// import { Switch } from '@/app/_components/ui/switch';

// You might need a toast library for notifications, e.g., react-hot-toast
// import toast from 'react-hot-toast';

interface ProactiveMessageFormProps {
  chatbotId: string
  initialData: ProactiveMessage | null
}

export default function ProactiveMessageForm({
  chatbotId,
  initialData,
}: ProactiveMessageFormProps) {
  const [isPending, startTransition] = useTransition()
  const [messageContent, setMessageContent] = useState('')
  const [delaySeconds, setDelaySeconds] = useState(5)
  const [isEnabled, setIsEnabled] = useState(true)
  const [messageId, setMessageId] = useState<string | null>(null)
  const [color, setColor] = useState('#111827')

  useEffect(() => {
    if (initialData) {
      setMessageContent(initialData.message_content)
      setDelaySeconds(initialData.delay_seconds)
      setIsEnabled(initialData.is_enabled)
      setMessageId(initialData.id)
      setColor(initialData.color || '#111827')
    } else {
      // Reset to defaults if no initial data (e.g., after deletion)
      setMessageContent('')
      setDelaySeconds(5)
      setIsEnabled(true)
      setMessageId(null)
      setColor('#111827')
    }
  }, [initialData])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await upsertProactiveMessage(
        chatbotId,
        {
          message_content: messageContent,
          delay_seconds: delaySeconds,
          is_enabled: isEnabled,
          color: color,
        },
        messageId, // Pass existing messageId for update, or null/undefined for create
      )
      if (result.error) {
        console.error('Failed to save proactive message:', result.error)
        // toast.error(`Error: ${result.error}`);
      } else {
        // toast.success('Proactive message saved!');
        if (result.data) {
          setMessageId(result.data.id) // Update messageId if it was a new creation
        }
      }
    })
  }

  const handleDelete = async () => {
    if (!messageId) return
    startTransition(async () => {
      // const toastId = toast.loading('Deleting proactive message...');
      const result = await deleteProactiveMessage(messageId, chatbotId)
      if (result.error) {
        console.error('Failed to delete proactive message:', result.error)
        // toast.error(`Error: ${result.error}`, { id: toastId });
      } else {
        // toast.success('Proactive message deleted!', { id: toastId });
        // Reset form fields, server action revalidates and parent will refetch
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message Content</label>
        <textarea
          id="messageContent"
          value={messageContent}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessageContent(e.target.value)}
          placeholder="E.g., 👋 Hi! How can I help you today?"
          maxLength={255}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {255 - messageContent.length} characters remaining.
        </p>
      </div>

      <div>
        <label htmlFor="delaySeconds" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delay (seconds)</label>
        <input
          id="delaySeconds"
          type="number"
          value={delaySeconds}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDelaySeconds(Math.max(0, parseInt(e.target.value, 10) || 0))}
          min="0"
          required
          className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
        />
         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          How long to wait before showing the message.
        </p>
      </div>

      <div>
        <label htmlFor="proactiveMessageColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bubble Color</label>
        <div className="mt-1 flex items-center space-x-2">
          <input
            id="proactiveMessageColor"
            type="color"
            value={color}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
            className="h-10 w-14 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
           <input
            type="text"
            value={color}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
            placeholder="#111827"
            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Choose the background color for the proactive message bubble.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="isEnabled"
          type="checkbox"
          checked={isEnabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setIsEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-indigo-600"
        />
        <label htmlFor="isEnabled" className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
          Enable Proactive Message
        </label>
      </div>

      <div className="flex justify-between space-x-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : (messageId ? 'Update Message' : 'Create Message')}
        </Button>
        {messageId && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Message'}
          </Button>
        )}
      </div>
    </form>
  )
} 