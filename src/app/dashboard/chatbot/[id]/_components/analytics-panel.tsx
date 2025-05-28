'use client'

import { useEffect, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
// @ts-ignore
import { Line, Bar } from 'react-chartjs-2'
// @ts-ignore
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

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
  avg_messages_per_session: number
}

type HourlyData = {
  hour_of_day: number
  message_count: number
  session_count: number
}

type QuestionData = {
  content: string
  frequency: number
  avg_satisfaction: number | null
}

type AlertData = {
  id: string
  alert_type: string
  threshold_value: number | null
  is_enabled: boolean
  last_triggered_at: string | null
}

export default function AnalyticsPanel({ chatbotId }: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'questions' | 'alerts'>('overview')
  const [data, setData] = useState<MetricRow[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([])
  const [alertsData, setAlertsData] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (type: string = 'daily') => {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/chatbots/${chatbotId}/analytics?type=${type}`
      if (type === 'alerts') {
        url = `/api/chatbots/${chatbotId}/alerts`
      }
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch')
      
      if (type === 'daily') {
        setData(json.data)
      } else if (type === 'hourly') {
        setHourlyData(json.data)
      } else if (type === 'questions') {
        setQuestionsData(json.data)
      } else if (type === 'alerts') {
        setAlertsData(json.data)
      }
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

  const handleTabChange = async (tab: 'overview' | 'patterns' | 'questions' | 'alerts') => {
    setActiveTab(tab)
    if (tab === 'patterns' && hourlyData.length === 0) {
      await fetchData('hourly')
    } else if (tab === 'questions' && questionsData.length === 0) {
      await fetchData('questions')
    } else if (tab === 'alerts' && alertsData.length === 0) {
      await fetchData('alerts')
    }
  }

  if (loading && activeTab === 'overview') {
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

  // Calculate last 7-day aggregates for overview
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

  // Prepare data for charts
  const dates = [...data].reverse().map((d) => d.date)
  const satisfactionSeries = [...data].reverse().map((d) => (d.satisfaction !== null ? d.satisfaction : null))
  const messagesSeries = [...data].reverse().map((d) => d.total_messages)
  const engagementSeries = [...data].reverse().map((d) => Number(d.avg_messages_per_session.toFixed(2)))

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'patterns', label: 'Usage Patterns' },
            { key: 'questions', label: 'Top Questions' },
            { key: 'alerts', label: 'Alerts' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {data.length === 0 ? (
            <p className="text-gray-400">No analytics data yet.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Avg Msgs / Session</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{engagementSeries.length > 0 ? engagementSeries[engagementSeries.length - 1] : '—'}</p>
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

              {/* Trend Charts */}
              {dates.length > 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm text-gray-300 mb-2">Satisfaction Trend</h3>
                    <Line
                      data={{
                        labels: dates,
                        datasets: [
                          {
                            label: 'Satisfaction %',
                            data: satisfactionSeries,
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16,185,129,0.2)',
                            spanGaps: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { 
                            beginAtZero: true, 
                            max: 100,
                            grid: {
                              color: 'rgba(107, 114, 128, 0.2)',
                            },
                            ticks: {
                              color: '#9CA3AF',
                            },
                          },
                          x: {
                            grid: {
                              color: 'rgba(107, 114, 128, 0.2)',
                            },
                            ticks: {
                              color: '#9CA3AF',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-300 mb-2">Messages & Engagement</h3>
                    <Line
                      data={{
                        labels: dates,
                        datasets: [
                          {
                            label: 'Total Messages',
                            data: messagesSeries,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59,130,246,0.2)',
                            yAxisID: 'y',
                          },
                          {
                            label: 'Avg Msgs / Session',
                            data: engagementSeries,
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245,158,11,0.2)',
                            yAxisID: 'y1',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { 
                            position: 'top' as const,
                            labels: {
                              color: '#9CA3AF',
                            },
                          },
                        },
                        scales: {
                          y: {
                            type: 'linear' as const,
                            display: true,
                            position: 'left' as const,
                            grid: {
                              color: 'rgba(107, 114, 128, 0.2)',
                            },
                            ticks: {
                              color: '#9CA3AF',
                            },
                          },
                          y1: {
                            type: 'linear' as const,
                            display: true,
                            position: 'right' as const,
                            grid: { 
                              drawOnChartArea: false,
                            },
                            ticks: {
                              color: '#9CA3AF',
                            },
                          },
                          x: {
                            grid: {
                              color: 'rgba(107, 114, 128, 0.2)',
                            },
                            ticks: {
                              color: '#9CA3AF',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Usage Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Loading usage patterns…
            </div>
          ) : hourlyData.length === 0 ? (
            <p className="text-gray-400">No usage pattern data available yet.</p>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Hourly Usage Patterns (Last 30 Days)</h3>
              <Bar
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                  datasets: [
                    {
                      label: 'Messages',
                      data: Array.from({ length: 24 }, (_, hour) => {
                        const hourData = hourlyData.find(h => h.hour_of_day === hour)
                        return hourData?.message_count || 0
                      }),
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(107, 114, 128, 0.2)',
                      },
                      ticks: {
                        color: '#9CA3AF',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(107, 114, 128, 0.2)',
                      },
                      ticks: {
                        color: '#9CA3AF',
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Top Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Loading questions…
            </div>
          ) : questionsData.length === 0 ? (
            <p className="text-gray-400">No frequently asked questions data available yet.</p>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Most Frequently Asked Questions (Last 30 Days)</h3>
              <div className="space-y-3">
                {questionsData.map((question, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-purple-400">#{index + 1}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-400">Asked {question.frequency} times</span>
                        {question.avg_satisfaction !== null && (
                          <div className="text-sm text-gray-400">
                            Satisfaction: {Math.round(question.avg_satisfaction * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm">{question.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Loading alerts…
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Alert Settings</h3>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm">
                  Add Alert
                </button>
              </div>
              
              {alertsData.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-400 mb-4">No alerts configured yet.</p>
                  <p className="text-sm text-gray-500">Set up alerts to monitor satisfaction drops, engagement issues, or high volume periods.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertsData.map((alert) => (
                    <div key={alert.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium capitalize">
                            {alert.alert_type.replace('_', ' ')}
                          </h4>
                          {alert.threshold_value && (
                            <p className="text-sm text-gray-400">
                              Threshold: {alert.threshold_value}
                              {alert.alert_type.includes('satisfaction') ? '%' : ''}
                            </p>
                          )}
                          {alert.last_triggered_at && (
                            <p className="text-xs text-gray-500">
                              Last triggered: {new Date(alert.last_triggered_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            alert.is_enabled 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {alert.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button className="text-gray-400 hover:text-white text-sm">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
