'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ConversationStatsProps {
  chatbotId: string
}

interface Stats {
  total: number
  active: number
  waiting: number
  resolved: number
}

export default function ConversationStats({ chatbotId }: ConversationStatsProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    waiting: 0,
    resolved: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('status')
        .eq('chatbot_id', chatbotId)

      if (error) throw error

      const counts = {
        total: data.length,
        active: data.filter(c => c.status === 'active' || c.status === 'agent_responding').length,
        waiting: data.filter(c => c.status === 'waiting_for_agent').length,
        resolved: data.filter(c => c.status === 'resolved').length
      }

      setStats(counts)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`conversation-stats:${chatbotId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `chatbot_id=eq.${chatbotId}`
        },
        () => {
          loadStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatbotId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Conversations',
      value: stats.total,
      icon: (
        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: (
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-green-50'
    },
    {
      title: 'Waiting for Agent',
      value: stats.waiting,
      icon: (
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
              {stat.icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.title}
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 