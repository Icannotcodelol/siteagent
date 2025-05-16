'use client';

import { Card, Title, BarChart } from '@tremor/react';
import type { Chatbot } from '../page'; // Assuming Chatbot type is exported from page.tsx

interface AvgMessagesChartProps {
  chatbots: Chatbot[];
}

export default function AvgMessagesChart({ chatbots }: AvgMessagesChartProps) {
  // Prepare data for the chart
  const chartData = chatbots
    .map(chatbot => ({
      name: chatbot.name,
      // Ensure conversationCount is not 0 to avoid NaN/Infinity
      'Avg. Messages/Convo': chatbot.conversationCount > 0 
        ? parseFloat((chatbot.messageCount / chatbot.conversationCount).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b['Avg. Messages/Convo'] - a['Avg. Messages/Convo'])
    .slice(0, 7); // Show top 7 or fewer

  const dataFormatter = (number: number) => Intl.NumberFormat('us').format(number).toString();

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-white border-gray-300 rounded-lg">
        <Title className="text-gray-900">Avg. Messages per Conversation</Title>
        <p className="text-sm text-gray-500 mt-4 text-center">No chatbot data available to display averages.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-300 rounded-lg">
      <Title className="text-gray-900">Avg. Messages per Conversation</Title>
      <BarChart
        className="mt-6 text-gray-700"
        data={chartData}
        index="name"
        categories={['Avg. Messages/Convo']}
        colors={['green']}
        valueFormatter={dataFormatter}
        yAxisWidth={40}
        layout="horizontal"
        showAnimation
      />
    </Card>
  );
} 