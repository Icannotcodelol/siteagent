import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatbotList from './_components/ChatbotList'
import { disconnectOAuthServiceAction } from '@/app/actions/oauth'
import DisconnectButton from './_components/disconnect-button'
import Link from 'next/link'
import DashboardLayout from './_components/dashboard-layout'
import LogoutButton from './_components/LogoutButton'
import { Button } from '@/app/_components/ui/button'
import { Suspense } from 'react'

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
    <div className="flex items-center space-x-4 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-lg">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${colorClassMap[color]}`}
        aria-hidden="true"
      >
        {iconMap[icon]}
      </span>
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-slate-100">{value}</span>
        <span className="text-sm text-slate-400">{label}</span>
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
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="flex items-center space-x-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: connected ? '#22c55e' : '#71717a' }}
        />
        <span className="text-sm font-medium text-slate-200">{name}</span>
      </div>
      {connected ? (
        disconnectButton
      ) : (
        <span className="text-xs text-slate-500">Not connected</span>
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
    // Handle error as appropriate, e.g., show a notification or default to 0
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
    conversationCount: conversationCountsMap.get(row.id) || 0, // Use fetched count or default to 0
  }))

  // -------------------------
  // High-level usage metrics
  // -------------------------

  // Total conversations (across all chatbots)
  const { data: totalConversationsData, error: totalConversationsError } = await supabase
    .rpc('f_total_conversations', { p_user: user.id });
  // TODO: Handle totalConversationsError if needed, e.g., log or show a fallback
  const totalConversations = totalConversationsData ?? 0;

  // Total messages (assistant + user)
  const { data: totalMessagesData, error: totalMessagesError } = await supabase
    .rpc('f_total_messages', { p_user: user.id });
  // TODO: Handle totalMessagesError if needed
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

  const connectedServicesCount = [
    isHubspotConnected,
    isJiraConnected,
    isCalendlyConnected,
    isShopifyConnected,
  ].filter(Boolean).length

  // -------------------------
  // Render
  // -------------------------

  return (
    <DashboardLayout authButtonSlot={<LogoutButton />}>
      {/* Top bar content now part of DashboardLayout or handled differently */}
      {/* Page title can be managed within DashboardLayout or as a specific component */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Overview</h1>
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
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Usage Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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

        {/* Chatbots list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-200">Your Chatbots</h2>
            {/* TODO: Implement Export and Sort functionality with dark theme styles */}
            {/* <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-700 hover:text-slate-100">
                Export
              </Button>
              <select
                className="rounded-md border-slate-600 bg-slate-800 text-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option>Sort by Date</option>
                <option>Sort by Name</option>
              </select>
            </div> */}
          </div>

          {chatbotError && (
            <p className="text-sm text-red-600">
              Error loading chatbots: {chatbotError.message}
            </p>
          )}

          <ChatbotList chatbots={chatbots} />
        </section>

        {/* Connected services */}
        <section>
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Connected Services</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
} 