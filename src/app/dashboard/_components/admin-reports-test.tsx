'use client'

import { useState } from 'react'

export default function AdminReportsTest() {
  const [reports, setReports] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/weekly-reports', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReports(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Weekly Reports Test</h2>
      
      <button
        onClick={generateReports}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Weekly Reports'}
      </button>

      {error && (
        <div className="mt-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {reports && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Reports Generated: {reports.reportsGenerated}
          </h3>
          
          <div className="space-y-4">
            {reports.reports?.map((report: any, index: number) => (
              <div key={index} className="bg-gray-800 border border-gray-700 p-4 rounded">
                <h4 className="text-white font-medium">{report.chatbotName}</h4>
                <p className="text-sm text-gray-400">Owner: {report.ownerEmail}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <span className="text-xs text-gray-500">Messages</span>
                    <p className="text-white">{report.weeklyStats.totalMessages}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Sessions</span>
                    <p className="text-white">{report.weeklyStats.totalSessions}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Satisfaction</span>
                    <p className="text-white">
                      {report.weeklyStats.satisfaction ? `${report.weeklyStats.satisfaction}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Avg Msgs/Session</span>
                    <p className="text-white">{report.weeklyStats.avgMessagesPerSession}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <details className="mt-4">
            <summary className="text-purple-400 cursor-pointer">View Raw JSON</summary>
            <pre className="bg-black p-4 rounded mt-2 text-xs text-green-400 overflow-auto">
              {JSON.stringify(reports, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
} 