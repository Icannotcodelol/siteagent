import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatbotList from './_components/ChatbotList'
import { disconnectOAuthServiceAction } from '@/app/actions/oauth'
import DisconnectButton from './_components/disconnect-button'
import Link from 'next/link'
import { Button } from '@/app/_components/ui/button'
import { Suspense } from 'react'
import { BarChart3, Bot, Cable, TrendingUp } from 'lucide-react'

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
  trend,
}: {
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'yellow'
  icon: 'chat' | 'chart' | 'user' | 'bolt'
  trend?: { value: number; isPositive: boolean }
}) {
  const iconMap: Record<typeof icon, string> = {
    chat: '💬',
    chart: '📈',
    user: '👤',
    bolt: '⚡',
  }

  const colorClassMap: Record<typeof color, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }

  const glowClassMap: Record<typeof color, string> = {
    blue: 'shadow-blue-500/20',
    green: 'shadow-green-500/20',
    purple: 'shadow-purple-500/20',
    yellow: 'shadow-yellow-500/20',
  }

  return (
    <div className="card-base card-hover group relative overflow-hidden">
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClassMap[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${colorClassMap[color]} text-white mb-3 shadow-lg ${glowClassMap[color]}`}>
            <span className="text-xl">{iconMap[icon]}</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</h3>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceCard({
  name,
  connected,
  disconnectButton,
  icon,
  description,
}: {
  name: string
  connected: boolean
  disconnectButton: React.ReactNode
  icon?: string
  description?: string
}) {
  return (
    <div className="card-base card-hover group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700/50 text-xl">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{name}</span>
              <div
                className={`h-2 w-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}
              />
            </div>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {connected ? (
          disconnectButton
        ) : (
          <span className="text-xs text-gray-500">Not connected</span>
        )}
      </div>
    </div>
  )
}

// Hero Welcome Section
function HeroWelcome({ userName }: { userName?: string }) {
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          {greeting()}{userName ? `, ${userName}` : ''}! 👋
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          Welcome to your chatbot command center. What would you like to build today?
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/chatbot/new">
            <Button className="gradient-primary text-white btn-scale glow px-6 py-3 text-base font-semibold">
              <span className="mr-2">🚀</span>
              Create New Chatbot
            </Button>
          </Link>
          <Link href="/dashboard/billing">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white px-6 py-3 text-base">
              <span className="mr-2">💳</span>
              Manage Billing
            </Button>
          </Link>
        </div>
      </div>
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
  // Chatbot-specific activity
  // -------------------------
  const { data: chatbotActivityData, error: chatbotActivityError } = await supabase
    .rpc('f_get_chatbot_message_activity', { p_user: user.id, p_days: 7 });

  if (chatbotActivityError) {
    console.error('Error fetching chatbot activity:', chatbotActivityError);
  }

  // -------------------------
  // Average messages per conversation
  // -------------------------
  const { data: avgMessagesData, error: avgMessagesError } = await supabase
    .rpc('f_get_avg_messages_per_conversation', { p_user: user.id, p_days: 30 });

  if (avgMessagesError) {
    console.error('Error fetching average messages:', avgMessagesError);
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Welcome Section */}
        <HeroWelcome userName={user.email?.split('@')[0]} />

        {/* Stats Overview Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            <span className="text-blue-400">Overview</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Conversations"
              value={totalConversations}
              color="blue"
              icon="chat"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              label="Total Messages"
              value={totalMessages}
              color="green"
              icon="chart"
              trend={{ value: 8, isPositive: true }}
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
        </div>

        {/* Analytics Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-purple-400" />
            <span className="text-purple-400">Analytics</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="card-base">
              <h3 className="text-lg font-semibold text-white mb-4">Usage Trends</h3>
              <Suspense fallback={<ChartSkeleton />}>
                <UsageTrendsChart data={usageTrendsData || []} />
              </Suspense>
            </div>
            <div className="card-base">
              <h3 className="text-lg font-semibold text-white mb-4">Chatbot Activity</h3>
              <Suspense fallback={<ChartSkeleton />}>
                <ChatbotActivityChart chatbots={chatbots} />
              </Suspense>
            </div>
            <div className="card-base">
              <h3 className="text-lg font-semibold text-white mb-4">Avg Messages/Conversation</h3>
              <Suspense fallback={<ChartSkeleton />}>
                <AvgMessagesChart chatbots={chatbots} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* My Chatbots Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bot className="w-7 h-7 text-green-400" />
              <span className="text-green-400">My Chatbots</span>
            </h2>
            <Link href="/dashboard/chatbot/new">
              <Button className="gradient-secondary text-white btn-scale px-4 py-2">
                <span className="mr-2">➕</span>
                New Chatbot
              </Button>
            </Link>
          </div>
          <Suspense fallback={<ChatbotListSkeleton />}>
            <ChatbotList chatbots={chatbots} />
          </Suspense>
        </div>

        {/* Connected Services Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Cable className="w-7 h-7 text-yellow-400" />
            <span className="text-yellow-400">Connected Services</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ServiceCard
              name="HubSpot"
              icon="🏢"
              description="CRM & Marketing automation"
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
              icon="📋"
              description="Project management"
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
              icon="📅"
              description="Meeting scheduling"
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
              icon="🛍️"
              description="E-commerce platform"
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
              icon="📊"
              description="Work management"
              connected={isMondayConnected}
              disconnectButton={
                <DisconnectButton
                  serviceName="monday"
                  displayName="Monday.com"
                  disconnectAction={disconnectOAuthServiceAction}
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading Skeletons
function ChatbotListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card-base animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-700 rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-[200px] animate-pulse">
      <div className="h-full bg-gray-700/30 rounded-lg" />
    </div>
  )
} 