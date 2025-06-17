'use client'

import { useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface InsightsSummaryData {
  totalSummaries: number
  latestInsight: {
    chatbotName: string
    chatbotId: string
    executiveSummary: string
    sentiment: {
      positive: number
      neutral: number
      negative: number
    }
  } | null
  topTopics: Array<{
    topic: string
    frequency: number
  }>
}

interface InsightsSummaryCardProps {
  chatbots: Array<{ id: string; name: string }>
}

export function InsightsSummaryCard({ chatbots }: InsightsSummaryCardProps) {
  const [data, setData] = useState<InsightsSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsightsSummary() {
      if (chatbots.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Fetch latest summaries for all chatbots
        const summaryPromises = chatbots.slice(0, 5).map(chatbot => 
          fetch(`/api/chatbots/${chatbot.id}/analytics/summaries?type=daily&limit=1`)
            .then(res => res.json())
            .then(data => ({
              chatbot,
              summary: data.summaries?.[0] || null
            }))
            .catch(() => ({ chatbot, summary: null }))
        )

        const results = await Promise.all(summaryPromises)
        
        // Find the most recent summary
        const latestSummaryData = results
          .filter(r => r.summary)
          .sort((a, b) => 
            new Date(b.summary.created_at).getTime() - new Date(a.summary.created_at).getTime()
          )[0]

        if (!latestSummaryData) {
          setData({
            totalSummaries: 0,
            latestInsight: null,
            topTopics: []
          })
          return
        }

        // Aggregate top topics from all summaries
        const allTopics = new Map<string, number>()
        let totalSummaries = 0

        results.forEach(({ summary }) => {
          if (summary) {
            totalSummaries++
            summary.common_topics?.forEach((topic: any) => {
              const current = allTopics.get(topic.topic) || 0
              allTopics.set(topic.topic, current + topic.frequency)
            })
          }
        })

        // Get top 3 topics
        const topTopics = Array.from(allTopics.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([topic, frequency]) => ({ topic, frequency: frequency / totalSummaries }))

        setData({
          totalSummaries,
          latestInsight: latestSummaryData ? {
            chatbotName: latestSummaryData.chatbot.name,
            chatbotId: latestSummaryData.chatbot.id,
            executiveSummary: latestSummaryData.summary.executive_summary,
            sentiment: latestSummaryData.summary.sentiment_analysis
          } : null,
          topTopics
        })
      } catch (error) {
        console.error('Error fetching insights summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsightsSummary()
  }, [chatbots])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    )
  }

  if (!data || !data.latestInsight) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <p className="text-gray-400 text-sm">No AI insights generated yet. Analytics will appear here once available.</p>
      </div>
    )
  }

  const getSentimentColor = () => {
    const { positive, negative } = data.latestInsight!.sentiment
    if (positive > negative) return 'text-green-400'
    if (negative > positive) return 'text-red-400'
    return 'text-gray-400'
  }

  const getSentimentText = () => {
    const { positive, neutral, negative } = data.latestInsight!.sentiment
    const max = Math.max(positive, neutral, negative)
    if (max === positive) return 'Positive'
    if (max === negative) return 'Negative'
    return 'Neutral'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <span className="text-xs text-gray-500">{data.totalSummaries} summaries</span>
      </div>

      {/* Latest Insight */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Latest from {data.latestInsight.chatbotName}</p>
        <p className="text-sm text-gray-300 line-clamp-2">{data.latestInsight.executiveSummary}</p>
        <Link
          href={`/dashboard/chatbot/${data.latestInsight.chatbotId}?tab=analytics&subtab=insights`}
          className="text-purple-400 text-xs hover:underline mt-1 inline-block"
        >
          View details →
        </Link>
      </div>

      {/* Sentiment Overview */}
      <div className="flex items-center justify-between mb-4 py-3 border-y border-gray-700">
        <span className="text-sm text-gray-400">Overall Sentiment</span>
        <span className={`text-sm font-medium ${getSentimentColor()}`}>
          {getSentimentText()} ({Math.round(data.latestInsight.sentiment[getSentimentText().toLowerCase() as keyof typeof data.latestInsight.sentiment] * 100)}%)
        </span>
      </div>

      {/* Top Topics */}
      {data.topTopics.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Trending Topics</p>
          <div className="space-y-2">
            {data.topTopics.map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-gray-300">{topic.topic}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: `${Math.round(topic.frequency * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(topic.frequency * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 