'use client'

import { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { HandThumbUpIcon, HandThumbDownIcon, FaceSmileIcon, FaceFrownIcon } from '@heroicons/react/24/solid'

interface AiInsightsTabProps {
  chatbotId: string
}

interface Summary {
  id: string
  summary_type: string
  date_start: string
  date_end: string
  total_messages: number
  unique_sessions: number
  executive_summary: string
  common_topics: Array<{
    topic: string
    frequency: number
    examples: string[]
  }>
  user_intent_categories: {
    support: number
    sales: number
    features: number
    complaints: number
    other: number
  }
  sentiment_analysis: {
    positive: number
    neutral: number
    negative: number
  }
  key_questions: string[]
  improvement_suggestions: string
  anomalies: string
  created_at: string
  processing_time_ms: number
}

export default function AiInsightsTab({ chatbotId }: AiInsightsTabProps) {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summaryType, setSummaryType] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Fetch existing summaries
  const fetchSummaries = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/analytics/summaries?type=${summaryType}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch summaries')
      
      setSummaries(data.summaries || [])
      if (data.summaries && data.summaries.length > 0) {
        setSelectedSummary(data.summaries[0])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Generate new summary
  const generateSummary = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/analytics/summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: summaryType })
      })
      
      const data = await res.json()
      
      if (res.status === 409) {
        setError('A summary already exists for this period')
        return
      }
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate summary')
      
      // Refresh summaries list
      await fetchSummaries()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchSummaries()
  }, [chatbotId, summaryType])

  // Format percentage
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`

  // Get sentiment icon
  const getSentimentIcon = (sentiment: Summary['sentiment_analysis']) => {
    const max = Math.max(sentiment.positive, sentiment.neutral, sentiment.negative)
    if (max === sentiment.positive) return <FaceSmileIcon className="w-8 h-8 text-green-500" />
    if (max === sentiment.negative) return <FaceFrownIcon className="w-8 h-8 text-red-500" />
    return <FaceSmileIcon className="w-8 h-8 text-gray-500" />
  }

  if (loading && summaries.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400">
        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Loading insights...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSummaryType(type)}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  summaryType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={generateSummary}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4" />
              Generate New
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-md">
          {error}
        </div>
      )}

      {summaries.length === 0 ? (
        <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
          <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No AI summaries generated yet</p>
          <p className="text-sm text-gray-500 mt-2">Click "Generate New" to create your first insight summary</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary list */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Available Summaries</h3>
            {summaries.map((summary) => (
              <button
                key={summary.id}
                onClick={() => setSelectedSummary(summary)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedSummary?.id === summary.id
                    ? 'bg-purple-900/20 border-purple-700'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(summary.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">
                  {new Date(summary.date_start).toLocaleDateString()} - {new Date(summary.date_end).toLocaleDateString()}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{summary.total_messages} messages</span>
                  <span>{summary.unique_sessions} sessions</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected summary details */}
          {selectedSummary && (
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Summary */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-400" />
                  Executive Summary
                </h3>
                <p className="text-gray-300 leading-relaxed">{selectedSummary.executive_summary}</p>
              </div>

              {/* Sentiment & Intent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sentiment Analysis */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Sentiment Analysis</h3>
                  <div className="flex items-center justify-center mb-4">
                    {getSentimentIcon(selectedSummary.sentiment_analysis)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Positive</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: formatPercent(selectedSummary.sentiment_analysis.positive) }}
                          />
                        </div>
                        <span className="text-sm text-white">
                          {formatPercent(selectedSummary.sentiment_analysis.positive)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Neutral</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gray-500 h-2 rounded-full"
                            style={{ width: formatPercent(selectedSummary.sentiment_analysis.neutral) }}
                          />
                        </div>
                        <span className="text-sm text-white">
                          {formatPercent(selectedSummary.sentiment_analysis.neutral)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Negative</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: formatPercent(selectedSummary.sentiment_analysis.negative) }}
                          />
                        </div>
                        <span className="text-sm text-white">
                          {formatPercent(selectedSummary.sentiment_analysis.negative)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intent Categories */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">User Intent</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedSummary.user_intent_categories).map(([category, value]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 capitalize">{category}</span>
                        <span className="text-sm text-white">{formatPercent(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Common Topics */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-purple-400" />
                  Common Topics
                </h3>
                <div className="space-y-4">
                  {selectedSummary.common_topics.map((topic, idx) => (
                    <div key={idx} className="border-b border-gray-700 pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{topic.topic}</h4>
                        <span className="text-sm text-purple-400">{formatPercent(topic.frequency)}</span>
                      </div>
                      {topic.examples && topic.examples.length > 0 && (
                        <div className="space-y-1">
                          {topic.examples.map((example, i) => (
                            <p key={i} className="text-sm text-gray-400 italic">"{example}"</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Questions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                  Most Representative Questions
                </h3>
                <ul className="space-y-2">
                  {selectedSummary.key_questions.map((question, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 text-sm">{idx + 1}.</span>
                      <span className="text-sm text-gray-300">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements & Anomalies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                    Improvement Suggestions
                  </h3>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedSummary.improvement_suggestions}</p>
                </div>

                {selectedSummary.anomalies && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
                      Anomalies & Patterns
                    </h3>
                    <p className="text-sm text-gray-300">{selectedSummary.anomalies}</p>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 text-center">
                Generated in {selectedSummary.processing_time_ms}ms on {new Date(selectedSummary.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 