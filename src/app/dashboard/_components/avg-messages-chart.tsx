'use client';

import { Card, Title, BarChart } from '@tremor/react';
import type { Chatbot } from '../page'; // Assuming Chatbot type is exported from page.tsx

interface AvgMessagesChartProps {
  chatbots: Chatbot[];
}

export default function AvgMessagesChart({ chatbots }: AvgMessagesChartProps) {
  // Function to truncate long chatbot names
  const truncateName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Prepare data for the chart
  const chartData = chatbots
    .map(chatbot => ({
      name: truncateName(chatbot.name),
      fullName: chatbot.name, // Keep full name for tooltip
      // Ensure conversationCount is not 0 to avoid NaN/Infinity
      'Avg. Messages/Convo': chatbot.conversationCount > 0 
        ? parseFloat((chatbot.messageCount / chatbot.conversationCount).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b['Avg. Messages/Convo'] - a['Avg. Messages/Convo'])
    .slice(0, 7); // Show top 7 or fewer

  const dataFormatter = (number: number) => Intl.NumberFormat('us').format(number).toString();

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    // Find the full name for this truncated label
    const dataPoint = chartData.find(item => item.name === label);
    const fullName = dataPoint?.fullName || label;
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-gray-200 font-medium text-sm mb-2 break-words">{fullName}</p>
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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">No data available to display averages</p>
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
      <BarChart
        className="h-full [&_.recharts-wrapper]:!bg-transparent [&_.recharts-wrapper_text]:!fill-gray-200 [&_.recharts-wrapper_tspan]:!fill-gray-200 [&_text]:!fill-gray-200 [&_tspan]:!fill-gray-200 [&_.recharts-bar]:!fill-purple-500"
        data={chartData}
        index="name"
        categories={['Avg. Messages/Convo']}
        colors={['purple']}
        valueFormatter={dataFormatter}
        yAxisWidth={40}
        layout="horizontal"
        showAnimation
        showGridLines={true}
        customTooltip={customTooltip}
      />
    </div>
  );
} 