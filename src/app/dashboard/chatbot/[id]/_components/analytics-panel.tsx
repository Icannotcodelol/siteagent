'use client'

import { useEffect, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface AnalyticsPanelProps {
  chatbotId: string
}

type MetricRow = {
  date: string
  total_messages: number
  user_messages: number
  bot_messages: number
  unique_sessions: number
  thumbs_up: number
  thumbs_down: number
  satisfaction: number | null
}

export default function AnalyticsPanel({ chatbotId }: AnalyticsPanelProps) {
  const [data, setData] = useState<MetricRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/analytics`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch')
      setData(json.data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400">
        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Loading analytics…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900 text-red-100 p-4 rounded-md">
        Error loading analytics: {error}
      </div>
    )
  }

  if (data.length === 0) {
    return <p className="text-gray-400">No analytics data yet.</p>
  }

  // Calculate last 7-day aggregates
  const last7 = data.slice(0, 7)
  const totals = last7.reduce(
    (acc, row) => {
      acc.total += row.total_messages
      acc.sessions += row.unique_sessions
      acc.up += row.thumbs_up
      acc.down += row.thumbs_down
      return acc
    },
    { total: 0, sessions: 0, up: 0, down: 0 }
  )
  const satisfaction = totals.up + totals.down > 0 ? Math.round((totals.up / (totals.up + totals.down)) * 100) : '—'

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">Messages (7 days)</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totals.total}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">Sessions (7 days)</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totals.sessions}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">Satisfaction</p>
          <p className="mt-1 text-2xl font-semibold text-white">{typeof satisfaction === 'number' ? `${satisfaction}%` : satisfaction}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-700 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-right">Msgs</th>
              <th className="px-3 py-2 text-right">Sessions</th>
              <th className="px-3 py-2 text-right">👍</th>
              <th className="px-3 py-2 text-right">👎</th>
              <th className="px-3 py-2 text-right">Satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date} className="border-t border-gray-700 hover:bg-gray-900">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2 text-right">{row.total_messages}</td>
                <td className="px-3 py-2 text-right">{row.unique_sessions}</td>
                <td className="px-3 py-2 text-right">{row.thumbs_up}</td>
                <td className="px-3 py-2 text-right">{row.thumbs_down}</td>
                <td className="px-3 py-2 text-right">
                  {row.satisfaction !== null ? `${row.satisfaction.toFixed(0)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
