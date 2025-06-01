'use client';

import { Card, Title, BarChart } from '@tremor/react';
import type { Chatbot } from '../page'; // Assuming Chatbot type is exported from page.tsx

interface ChatbotActivityChartProps {
  chatbots: Chatbot[];
}

export default function ChatbotActivityChart({ chatbots }: ChatbotActivityChartProps) {
  // Function to truncate long chatbot names
  const truncateName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Prepare data for the chart: Show top 5 chatbots by message count
  const chartData = chatbots
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5)
    .map(chatbot => ({
      name: truncateName(chatbot.name),
      fullName: chatbot.name, // Keep full name for tooltip
      'Messages': chatbot.messageCount,
      'Conversations': chatbot.conversationCount,
    }));

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
        <p className="text-sm text-gray-400 text-center">No chatbot activity data available</p>
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
        className="h-full [&_.recharts-wrapper]:!bg-transparent [&_.recharts-wrapper_text]:!fill-gray-200 [&_.recharts-wrapper_tspan]:!fill-gray-200 [&_text]:!fill-gray-200 [&_tspan]:!fill-gray-200 [&_.recharts-bar]:!fill-purple-500 [&_.recharts-bar:nth-child(2)]:!fill-purple-400"
        data={chartData}
        index="name"
        categories={['Messages', 'Conversations']}
        colors={['purple', 'violet']} 
        valueFormatter={dataFormatter}
        yAxisWidth={48}
        layout="horizontal"
        showAnimation
        showGridLines={true}
        customTooltip={customTooltip}
      />
    </div>
  );
} 