import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UsageTrendsChart } from './_components/usage-trends-chart'
import { ChatbotPerformanceChart } from './_components/chatbot-performance-chart'

export default async function OverviewPage() {
  // Create a Supabase server client bound to the current user session (via cookies)
  const supabase = createClient()

  // Ensure the user is authenticated; otherwise, redirect to login
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Fetch all chatbots for the current user together with aggregated message counts
  // The `chatbot_messages(count)` syntax instructs PostgREST to give us the row-count of the related messages table.
  const { data: chatbotRows, error: chatbotsError } = await supabase
    .from('chatbots')
    .select('id, name, created_at, chat_messages(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (chatbotsError) {
    console.error('Failed to load chatbots for overview page', chatbotsError)
    // In case of an error we still render – but inform the user.
  }

  // Define expected row structure returned from the Supabase query
  type ChatbotRow = {
    id: string
    name: string
    created_at: string
    chat_messages: { count: number }[] | null
  }

  // Massage the data into a friendlier shape
  const chatbots = (chatbotRows || []).map((cb) => {
    const row = cb as unknown as ChatbotRow
    const messageCount = row.chat_messages && row.chat_messages.length > 0 ? row.chat_messages[0].count : 0
    return {
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      messageCount,
    }
  })

  // Overall stats
  const totalChatbots = chatbots.length
  const totalMessages = chatbots.reduce((sum, cb) => sum + cb.messageCount, 0)

  // --- Data for Chatbot Performance Chart ---
  const performanceData = chatbots
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5) // Top 5 chatbots
    .map(cb => ({
      name: cb.name,
      'Messages Sent': cb.messageCount,
    }))

  // --- Data for Usage Trends Chart (Last 30 days) ---
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dailyMessages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('created_at, chatbot_id')
    .eq('is_user_message', false) // Count only assistant messages
    .in('chatbot_id', chatbots.map(cb => cb.id)) // Filter by user's chatbots
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })
  
  if (messagesError) {
    console.error('Failed to load daily messages for usage trends', messagesError);
  }

  const usageTrendsData = (dailyMessages || []).reduce<Record<string, number>>((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const formattedUsageTrends = Object.entries(usageTrendsData).map(([date, count]) => ({
    date: date,
    'Messages Sent': count,
  }))
  .sort((a,b) => new Date(a.date + ', ' + new Date().getFullYear()) > new Date(b.date + ', ' + new Date().getFullYear()) ? 1 : -1);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Overview</h1>
          <nav className="space-x-4 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/overview" className="text-gray-400 cursor-default">
              Overview
            </Link>
            {/* Other nav links could go here */}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <span className="text-sm text-gray-400">Total Chatbots</span>
            <span className="mt-2 text-3xl font-bold">{totalChatbots}</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <span className="text-sm text-gray-400">Total Messages Sent</span>
            <span className="mt-2 text-3xl font-bold">{totalMessages}</span>
          </div>
          {/* Placeholder cards - adapt to image if Active Users / Avg. Response Time are available */}
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <span className="text-sm text-gray-400">Active Users</span>
            <span className="mt-2 text-3xl font-bold text-gray-500">N/A</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <span className="text-sm text-gray-400">Avg. Response Time</span>
            <span className="mt-2 text-3xl font-bold text-gray-500">N/A</span>
          </div>
        </section>

        {/* Visualizations */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Usage Trends</h2>
                <p className="text-sm text-gray-400 mb-4">Message volume over the past 30 days.</p>
                {messagesError ? 
                    <p className="text-red-500">Error loading usage data.</p> : 
                    <UsageTrendsChart data={formattedUsageTrends} />
                }
            </div>
            <div className="bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Chatbot Performance</h2>
                <p className="text-sm text-gray-400 mb-4">Comparison of your top chatbots by messages sent.</p>
                {chatbotsError ? 
                    <p className="text-red-500">Error loading chatbot performance data.</p> : 
                    <ChatbotPerformanceChart data={performanceData} />
                }
            </div>
        </section>

        {/* Detailed table */}
        <section className="bg-gray-800 shadow rounded-lg p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">All Chatbots</h2>
          {chatbotsError && (
            <p className="text-red-500 mb-4">
              An error occurred while loading your chatbot data – please try again later.
            </p>
          )}
          {chatbots.length === 0 && !chatbotsError ? (
            <p className="text-gray-400">You haven't created any chatbots yet.</p>
          ) : chatbots.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  {/* Add Status, Users, Avg. Response, Last Active if data becomes available */}
                  <th className="px-4 py-2 text-left font-semibold">Messages Sent</th>
                  <th className="px-4 py-2 text-left font-semibold">Created</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {chatbots.map((cb) => (
                  <tr key={cb.id} className="hover:bg-gray-700/40">
                    <td className="px-4 py-2 whitespace-nowrap">{cb.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{cb.messageCount}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(cb.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link
                        href={`/dashboard/chatbot/${cb.id}`}
                        className="text-indigo-400 hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>
      </main>
    </div>
  )
} 