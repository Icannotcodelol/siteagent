'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@headlessui/react'

interface HybridModeToggleProps {
  chatbotId: string
  initialEnabled: boolean
}

export default function HybridModeToggle({ chatbotId, initialEnabled }: HybridModeToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggleHybridMode = async (newValue: boolean) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('chatbots')
        .update({ hybrid_mode_enabled: newValue })
        .eq('id', chatbotId)

      if (error) throw error
      
      setEnabled(newValue)
      
      // Show toast or notification
      const message = newValue 
        ? 'Hybrid mode enabled. You can now respond to conversations.' 
        : 'Hybrid mode disabled. Only AI will respond to messages.'
      
      // You could use a toast library here
      console.log(message)
      
    } catch (error) {
      console.error('Error toggling hybrid mode:', error)
      // Revert on error
      setEnabled(!newValue)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3" data-hybrid-toggle>
      <Switch
        checked={enabled}
        onChange={toggleHybridMode}
        disabled={loading}
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
      >
        <span className="sr-only">Enable hybrid mode</span>
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <div>
        <label className="text-sm font-medium text-gray-900">
          Hybrid Mode
        </label>
        <p className="text-xs text-gray-500">
          {enabled ? 'Human agents can respond' : 'AI only responses'}
        </p>
      </div>
    </div>
  )
} 