'use client'

import { AreaChart } from '@tremor/react'

interface UsageDataPoint {
  date: string // e.g., 'Jan 23'
  'Messages Sent': number
}

interface UsageTrendsChartProps {
  data: UsageDataPoint[]
}

const valueFormatter = (number: number) =>
  `${new Intl.NumberFormat('us').format(number).toString()}`

export function UsageTrendsChart({ data }: UsageTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/50">
        <p className="text-sm text-gray-400">Not enough data to display usage trends.</p>
      </div>
    )
  }
  return (
    <AreaChart
      className="h-80"
      data={data}
      index="date"
      categories={['Messages Sent']}
      colors={['blue']}
      valueFormatter={valueFormatter}
      yAxisWidth={60}
      showLegend={false}
      showGridLines={true}
      // Custom tooltip styling can be added if needed
      // customTooltip={...}
    />
  )
} 