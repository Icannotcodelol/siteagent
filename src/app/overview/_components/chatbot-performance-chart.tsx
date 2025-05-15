'use client'

import { BarChart } from '@tremor/react'

interface PerformanceDataPoint {
  name: string // Chatbot name
  'Messages Sent': number
}

interface ChatbotPerformanceChartProps {
  data: PerformanceDataPoint[]
}

const dataFormatter = (number: number) =>
  Intl.NumberFormat('us').format(number).toString()

export function ChatbotPerformanceChart({ data }: ChatbotPerformanceChartProps) {
    if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/50">
        <p className="text-sm text-gray-400">No chatbot performance data available.</p>
      </div>
    )
  }
  return (
    <BarChart
      className="mt-6 h-72"
      data={data}
      index="name"
      categories={['Messages Sent']}
      colors={['blue', 'teal', 'amber', 'rose', 'indigo', 'emerald']}
      valueFormatter={dataFormatter}
      yAxisWidth={48}
      showLegend={false}
    />
  )
} 