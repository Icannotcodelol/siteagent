import { checkOgImage, OgCheckResult } from '@/lib/services/og-parser'
import type { ReactNode } from 'react'
import UrlForm from './url-form'
import CopySnippetButton from './copy-snippet-button'

interface Props {
  initialUrl?: string
}

export default async function OgImageCheckerTool({ initialUrl }: Props) {
  const result = initialUrl ? await checkOgImage(initialUrl) : null

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">OG Image Checker</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Validate your Open Graph and Twitter image tags, preview how your link will appear on social media, and
          get actionable recommendations.
        </p>
      </div>

      {/* URL Input */}
      <UrlForm defaultUrl={initialUrl} />

      {/* Results */}
      {result && <Results result={result} />}
    </div>
  )
}

function Badge({ children, tone }: { children: ReactNode; tone: 'info' | 'warn' | 'error' }) {
  const colors = {
    info: 'bg-blue-100 text-blue-800',
    warn: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  } as const
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[tone]}`}>{children}</span>
}

function Results({ result }: { result: OgCheckResult }) {
  const { meta, image, issues, generatedTags } = result
  return (
    <div className="space-y-8">
      {/* Previews */}
      {image?.valid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-[#1877F2] h-10"></div>
            {/* Facebook/LinkedIn Card */}
            <img src={image.url} alt="OG Preview" className="w-full" />
          </div>
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-[#1DA1F2] h-10"></div>
            {/* Twitter Card */}
            <img src={image.url} alt="Twitter Preview" className="w-full" />
          </div>
        </div>
      )}

      {/* Meta Tags Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Detected Meta Tags</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border-b">Tag</th>
                <th className="px-4 py-2 border-b">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(meta).map(([key, value]) => (
                <tr key={key} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-mono text-gray-700">{key}</td>
                  <td className="px-4 py-2 text-gray-900 break-all">{value ?? <span className="text-gray-400">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Recommendations</h2>
          <ul className="space-y-2 list-disc pl-5 text-sm text-gray-800">
            {issues.map((issue) => (
              <li key={issue.code} className="flex items-start gap-2">
                <Badge tone={issue.severity}>{issue.severity.toUpperCase()}</Badge>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Snippet */}
      {generatedTags && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Suggested Meta Tags</h3>
            <CopySnippetButton snippet={generatedTags} />
          </div>
          <pre className="whitespace-pre-wrap text-xs text-gray-800 bg-white p-3 rounded-md border border-gray-100 overflow-x-auto">
{generatedTags}
          </pre>
        </div>
      )}
    </div>
  )
} 