'use client';

import { Card, Title, LineChart } from '@tremor/react';

export interface UsageTrend {
  report_date: string; // e.g., "2023-04-30"
  total_messages: number;
  total_conversations: number;
}

interface UsageTrendsChartProps {
  data: UsageTrend[] | null;
}

export default function UsageTrendsChart({ data }: UsageTrendsChartProps) {
  const formattedData = (data && data.length > 0)
    ? data.map(d => ({
        date: new Date(d.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(d.report_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        Messages: d.total_messages,
        Conversations: d.total_conversations,
      }))
    : [];

  const dataFormatter = (number: number) => {
    return Intl.NumberFormat('us').format(number).toString();
  };

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    // Find the full date for this label
    const dataPoint = formattedData.find(item => item.date === label);
    const fullDate = dataPoint?.fullDate || label;
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-gray-200 font-medium text-sm mb-2">{fullDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">{entry.dataKey}:</span>
            </div>
            <span className="text-white font-medium">{dataFormatter(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!formattedData || formattedData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">No usage data available yet</p>
      </div>
    );
  }

  return (
    <div 
      className="h-[200px] tremor-base"
      style={{
        '--tremor-content-subtle': '#e5e7eb',
        '--tremor-content-default': '#f3f4f6',
        '--tremor-content-emphasis': '#ffffff'
      } as React.CSSProperties}
    >
      <LineChart
        className="h-full [&_.recharts-wrapper]:!bg-transparent [&_.recharts-wrapper_text]:!fill-gray-200 [&_.recharts-wrapper_tspan]:!fill-gray-200 [&_text]:!fill-gray-200 [&_tspan]:!fill-gray-200 [&_.recharts-line]:!stroke-purple-500 [&_.recharts-line:nth-child(2)]:!stroke-purple-400"
        data={formattedData}
        index="date"
        categories={['Messages', 'Conversations']}
        colors={['purple', 'violet']}
        valueFormatter={dataFormatter}
        yAxisWidth={40}
        showAnimation
        showLegend
        connectNulls
        curveType="natural"
        showGridLines={true}
        customTooltip={customTooltip}
      />
    </div>
  );
} 