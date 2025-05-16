'use client';

import { Card, Title, BarChart } from '@tremor/react';
import type { Chatbot } from '../page'; // Assuming Chatbot type is exported from page.tsx

interface ChatbotActivityChartProps {
  chatbots: Chatbot[];
}

export default function ChatbotActivityChart({ chatbots }: ChatbotActivityChartProps) {
  // Prepare data for the chart: Show top 5 chatbots by message count
  const chartData = chatbots
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5)
    .map(chatbot => ({
      name: chatbot.name,
      'Messages': chatbot.messageCount,
      'Conversations': chatbot.conversationCount,
    }));

  const dataFormatter = (number: number) => Intl.NumberFormat('us').format(number).toString();

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-white border-gray-300 rounded-lg">
        <Title className="text-gray-900">Chatbot Activity</Title>
        <p className="text-sm text-gray-500 mt-4 text-center">No chatbot data available to display activity.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-300 rounded-lg">
      <Title className="text-gray-900">Top 5 Chatbots by Messages</Title>
      <BarChart
        className="mt-6 text-gray-700"
        data={chartData}
        index="name"
        categories={['Messages', 'Conversations']} // Show both, messages will be primary due to sort
        colors={['blue', 'purple']} 
        valueFormatter={dataFormatter}
        yAxisWidth={48}
        layout="horizontal" // For horizontal bars
        showAnimation
      />
    </Card>
  );
} 