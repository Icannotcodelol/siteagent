'use client';

import { Card, Title, AreaChart } from '@tremor/react';

export interface UsageTrend {
  report_date: string; // ISO date
  total_messages: number;
  total_conversations: number;
}

interface UsageTrendsChartProps {
  data?: UsageTrend[];
}

const dataFormatter = (number: number) =>
  `${Intl.NumberFormat('us').format(number).toString()}`;

export default function UsageTrendsChart({ data }: UsageTrendsChartProps) {
  const chartdata = (data && data.length > 0)
    ? data.map(d => ({
        date: d.report_date.substring(5), // e.g., "04-30" -> "04-30"
        Conversations: d.total_conversations,
        Messages: d.total_messages,
      }))
    : [
        { date: 'Jan 22', Conversations: 289, Messages: 189 },
        { date: 'Feb 22', Conversations: 275, Messages: 175 },
        { date: 'Mar 22', Conversations: 332, Messages: 232 },
      ];
  return (
    <Card className="bg-white border-gray-300 rounded-lg">
      <Title className="text-gray-900">Overall Usage Trends (Last 30 Days)</Title>
      <div style={{ '--tremor-content': '#374151', '--tremor-content-subtle': '#6b7280' } as React.CSSProperties}>
        <AreaChart
          className="mt-6 h-72 text-gray-700"
          data={chartdata}
          index="date"
          categories={['Conversations', 'Messages']}
          colors={['blue', 'purple']}
          valueFormatter={dataFormatter}
          yAxisWidth={40}
          showAnimation
        />
      </div>
      {(!data || data.length === 0) && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Showing placeholder data – real data will appear once activity is recorded.
        </p>
      )}
    </Card>
  );
} 