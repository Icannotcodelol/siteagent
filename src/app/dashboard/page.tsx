import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatbotList from './_components/ChatbotList'
import LogoutButton from './_components/LogoutButton'
import { disconnectOAuthServiceAction } from '@/app/actions/oauth'
import DisconnectButton from './_components/disconnect-button'
import Link from 'next/link'

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
// Small presentational components
// -----------------------------

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: 'indigo' | 'green' | 'purple' | 'yellow'
  icon: 'chat' | 'chart' | 'user' | 'bolt'
}) {
  const iconMap: Record<typeof icon, string> = {
    chat: '💬',
    chart: '📈',
    user: '👤',
    bolt: '⚡',
  }

  const colorClassMap: Record<typeof color, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }

  return (
    <div className="flex items-center space-x-4 rounded-lg border bg-white p-4 shadow-sm">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${colorClassMap[color]}`}
        aria-hidden="true"
      >
        {iconMap[icon]}
      </span>
      <div className="flex flex-col">
        <span className="text-xl font-semibold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
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
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: connected ? '#16a34a' : '#a1a1aa' }}
        />
        <span className="text-sm font-medium">{name}</span>
      </div>
      {connected ? (
        disconnectButton
      ) : (
        <span className="text-xs text-gray-400">Not connected</span>
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold">Your Chatbots</h1>
          <div className="flex items-center space-x-4">
            {/* Create Chatbot */}
            <Link
              href="/dashboard/chatbot/new"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              + Create New Chatbot
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Conversations"
            value={totalConversations}
            color="indigo"
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
        </section>

        {/* Chatbots list */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Your Chatbots</h2>
            <div className="flex items-center space-x-2">
              {/* Export placeholder */}
              <button className="rounded-md border bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50">
                Export
              </button>
              <select
                className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                defaultValue="newest"
                aria-label="Sort chatbots"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
              </select>
            </div>
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
          <h2 className="mb-4 text-lg font-medium">Connected Services</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              name="HubSpot"
              connected={isHubspotConnected}
              disconnectButton={
                isHubspotConnected && (
                  <DisconnectButton
                    serviceName="hubspot"
                    displayName="HubSpot"
                    disconnectAction={disconnectOAuthServiceAction}
                  />
                )
              }
            />
            <ServiceCard
              name="Jira"
              connected={isJiraConnected}
              disconnectButton={
                isJiraConnected && (
                  <DisconnectButton
                    serviceName="jira"
                    displayName="Jira"
                    disconnectAction={disconnectOAuthServiceAction}
                  />
                )
              }
            />
            <ServiceCard
              name="Calendly"
              connected={isCalendlyConnected}
              disconnectButton={
                isCalendlyConnected && (
                  <DisconnectButton
                    serviceName="calendly"
                    displayName="Calendly"
                    disconnectAction={disconnectOAuthServiceAction}
                  />
                )
              }
            />
            <ServiceCard
              name="Shopify"
              connected={isShopifyConnected}
              disconnectButton={
                isShopifyConnected && (
                  <DisconnectButton
                    serviceName="shopify"
                    displayName="Shopify"
                    disconnectAction={disconnectOAuthServiceAction}
                  />
                )
              }
            />
          </div>
        </section>
      </main>
    </div>
  )
} 