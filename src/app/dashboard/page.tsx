import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatbotList from './_components/ChatbotList'
import { disconnectOAuthServiceAction } from '@/app/actions/oauth'
import DisconnectButton from './_components/disconnect-button'
import Link from 'next/link'
import { Button } from '@/app/_components/ui/button'
import { Suspense } from 'react'

// Import new chart components
import UsageTrendsChart from './_components/usage-trends-chart';
import ChatbotActivityChart from './_components/chatbot-activity-chart';
import AvgMessagesChart from './_components/avg-messages-chart';

// Type representing the chatbot data passed to the list component
export type Chatbot = {
  id: string
  name: string
  description: string | null
  created_at: string
  messageCount: number
  conversationCount: number
}

// -----------------------------
// Small presentational components (adapted for dark theme)
// -----------------------------

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'yellow'
  icon: 'chat' | 'chart' | 'user' | 'bolt'
}) {
  const iconMap: Record<typeof icon, string> = {
    chat: '💬',
    chart: '📈',
    user: '👤',
    bolt: '⚡',
  }

  const colorClassMap: Record<typeof color, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  }

  return (
    <div className="flex items-center space-x-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${colorClassMap[color]}`}
        aria-hidden="true"
      >
        {iconMap[icon]}
      </span>
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-white">{value}</span>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  )
}

function ServiceCard({
  name,
  connected,
  disconnectButton,
}: {
  name: string
  connected: boolean
  disconnectButton: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-md">
      <div className="flex items-center space-x-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: connected ? '#22c55e' : '#71717a' /* gray-500 */ }}
        />
        <span className="text-sm font-medium text-gray-200">{name}</span>
      </div>
      {connected ? (
        disconnectButton
      ) : (
        <span className="text-xs text-gray-500">Not connected</span>
      )}
    </div>
  )
}

// -----------------------------
// Dashboard page
// -----------------------------

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Fetch chatbots along with aggregated message & conversation counts
  const { data: chatbotRows, error: chatbotError } = await supabase
    .from('chatbots')
    .select(
      'id, name, description, created_at, chat_messages(count)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch conversation counts for each chatbot
  const { data: conversationCountsData, error: conversationCountsError } = await supabase
    .rpc('f_chatbot_conversation_counts', { p_user_id: user.id });

  if (conversationCountsError) {
    console.error("Error fetching chatbot conversation counts:", conversationCountsError);
  }

  const conversationCountsMap = new Map<string, number>();
  if (conversationCountsData) {
    for (const item of conversationCountsData) {
      conversationCountsMap.set(item.chatbot_id_out, Number(item.conversation_count));
    }
  }

  const chatbots: Chatbot[] = (chatbotRows || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    created_at: row.created_at,
    messageCount: row.chat_messages?.[0]?.count ?? 0,
    conversationCount: conversationCountsMap.get(row.id) || 0,
  }))

  // -------------------------
  // High-level usage metrics
  // -------------------------

  // Total conversations (across all chatbots)
  const { data: totalConversationsData, error: totalConversationsError } = await supabase
    .rpc('f_total_conversations', { p_user: user.id });
  const totalConversations = totalConversationsData ?? 0;

  // Total messages (assistant + user)
  const { data: totalMessagesData, error: totalMessagesError } = await supabase
    .rpc('f_total_messages', { p_user: user.id });
  const totalMessages = totalMessagesData ?? 0;

  // Active chatbots – treat all user chatbots as active for now
  const activeChatbots = chatbots.length

  // -------------------------
  // OAuth service connections
  // -------------------------

  const { data: tokenRows, error: tokenError } = await supabase
    .from('user_oauth_tokens')
    .select('service_name')
    .eq('user_id', user.id)

  if (tokenError) {
    console.error('Error fetching OAuth tokens:', tokenError)
  }

  const connectedServices = (tokenRows || []).map(
    (row: { service_name: string }) => row.service_name
  )
  const isHubspotConnected = connectedServices.includes('hubspot')
  const isJiraConnected = connectedServices.includes('jira')
  const isCalendlyConnected = connectedServices.includes('calendly')
  const isShopifyConnected = connectedServices.includes('shopify')
  const isMondayConnected = connectedServices.includes('monday')

  const connectedServicesCount = [
    isHubspotConnected,
    isJiraConnected,
    isCalendlyConnected,
    isShopifyConnected,
    isMondayConnected,
  ].filter(Boolean).length

  // -------------------------
  // Daily usage trends (messages & conversations)
  // -------------------------
  const { data: usageTrendsData, error: usageTrendsError } = await supabase
    .rpc('f_get_daily_usage_trends', { p_user: user.id, p_days: 30 });

  if (usageTrendsError) {
    console.error('Error fetching usage trends:', usageTrendsError);
  }

  // -------------------------
  // Render
  // -------------------------

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            Overview of your chatbot performance and analytics
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/chatbot/new">
            + Create New Chatbot
          </Link>
        </Button>
      </div>

      {/* Main content area */}
      <div className="space-y-8">
        {/* Stats */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Usage Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Conversations"
              value={totalConversations}
              color="blue"
              icon="chat"
            />
            <StatCard
              label="Total Messages"
              value={totalMessages}
              color="green"
              icon="chart"
            />
            <StatCard
              label="Active Chatbots"
              value={activeChatbots}
              color="purple"
              icon="user"
            />
            <StatCard
              label="Connected Services"
              value={connectedServicesCount}
              color="yellow"
              icon="bolt"
            />
          </div>
        </section>

        {/* Data Visualizations Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <UsageTrendsChart data={usageTrendsData as any} />
            </div>
            <ChatbotActivityChart chatbots={chatbots} /> 
          </div>
          <div className="grid grid-cols-1 gap-6">
            <AvgMessagesChart chatbots={chatbots} />
          </div>
        </section>

        {/* Chatbots list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Your Chatbots</h2>
          </div>

          {chatbotError && (
            <p className="text-sm text-red-600">
              Error loading chatbots: {chatbotError.message}
            </p>
          )}

          <Suspense fallback={<ChatbotListSkeleton />}>
            <ChatbotList chatbots={chatbots} />
          </Suspense>
        </section>

        {/* Connected services */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Connected Services</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ServiceCard
              name="HubSpot"
              connected={isHubspotConnected}
              disconnectButton={
                <DisconnectButton
                  serviceName="hubspot"
                  displayName="HubSpot"
                  disconnectAction={disconnectOAuthServiceAction}
                />
              }
            />
            <ServiceCard
              name="Jira"
              connected={isJiraConnected}
              disconnectButton={
                <DisconnectButton
                  serviceName="jira"
                  displayName="Jira"
                  disconnectAction={disconnectOAuthServiceAction}
                />
              }
            />
            <ServiceCard
              name="Calendly"
              connected={isCalendlyConnected}
              disconnectButton={
                <DisconnectButton
                  serviceName="calendly"
                  displayName="Calendly"
                  disconnectAction={disconnectOAuthServiceAction}
                />
              }
            />
            <ServiceCard
              name="Shopify"
              connected={isShopifyConnected}
              disconnectButton={
                <DisconnectButton
                  serviceName="shopify"
                  displayName="Shopify"
                  disconnectAction={disconnectOAuthServiceAction}
                />
              }
            />
            <ServiceCard
              name="Monday.com"
              connected={isMondayConnected}
              disconnectButton={
                <DisconnectButton
                  serviceName="monday"
                  displayName="Monday.com"
                  disconnectAction={disconnectOAuthServiceAction}
                />
              }
            />
            {/* Placeholder for future service integrations */}
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 p-4 text-gray-500">
              <span>+ Add New Service</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Define a skeleton component for the chatbot list
function ChatbotListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-md animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 