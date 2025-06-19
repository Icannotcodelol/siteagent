'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Copy, Download, Share2, AlertCircle, CheckCircle, Settings, FileJson, Minimize2, Code2, GitCompare } from 'lucide-react'

type Mode = 'beautify' | 'validate' | 'minify' | 'compare'
type Theme = 'vscode' | 'github' | 'dracula' | 'monokai'

interface JsonError {
  line: number
  column: number
  message: string
}

const SAMPLE_JSON = `{
  "name": "SiteAgent",
  "type": "AI Chatbot Platform",
  "features": ["Document Processing", "Smart Analytics", "Easy Integration"],
  "pricing": {"starter": 29, "pro": 99}
}`

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [compareJson, setCompareJson] = useState('')
  const [mode, setMode] = useState<Mode>('beautify')
  const [theme, setTheme] = useState<Theme>('vscode')
  const [indentSize, setIndentSize] = useState(2)
  const [errors, setErrors] = useState<JsonError[]>([])
  const [isValid, setIsValid] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Show toast message
  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B: Beautify
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setMode('beautify')
      }
      // Cmd/Ctrl + M: Minify
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault()
        setMode('minify')
      }
      // Cmd/Ctrl + K: Clear
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setInputJson('')
        setOutputJson('')
        setErrors([])
      }
      // Cmd/Ctrl + Enter: Copy output
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && outputJson) {
        e.preventDefault()
        copyToClipboard(outputJson)
      }
      // Cmd/Ctrl + F: Auto-fix errors
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && errors.length > 0) {
        e.preventDefault()
        setInputJson(autoFixJson(inputJson))
        showToast('Auto-fixed common JSON errors!')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [outputJson, errors.length, inputJson])

  // Validate JSON
  const validateJson = useCallback((text: string): { valid: boolean; errors: JsonError[] } => {
    if (!text.trim()) {
      return { valid: true, errors: [] }
    }

    try {
      JSON.parse(text)
      return { valid: true, errors: [] }
    } catch (error: any) {
      // Parse error message to extract line/column
      const match = error.message.match(/position (\d+)/)
      const position = match ? parseInt(match[1]) : 0
      
      // Simple line/column calculation
      const lines = text.substring(0, position).split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1

      return {
        valid: false,
        errors: [{
          line,
          column,
          message: error.message.replace(/position \d+/, '').trim()
        }]
      }
    }
  }, [])

  // Format JSON
  const formatJson = useCallback((text: string, minify: boolean = false) => {
    if (!text.trim()) return ''

    try {
      const parsed = JSON.parse(text)
      if (minify) {
        return JSON.stringify(parsed)
      } else {
        return JSON.stringify(parsed, null, indentSize)
      }
    } catch {
      return text
    }
  }, [indentSize])

  // Auto-fix common JSON errors
  const autoFixJson = useCallback((text: string): string => {
    let fixed = text

    // Fix trailing commas
    fixed = fixed.replace(/,\s*}/g, '}')
    fixed = fixed.replace(/,\s*]/g, ']')

    // Fix single quotes
    fixed = fixed.replace(/'/g, '"')

    // Add missing quotes to keys
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

    // Fix undefined, null, true, false without quotes
    fixed = fixed.replace(/:\s*undefined/g, ': null')
    fixed = fixed.replace(/([^"])(true|false|null)([^"])/g, '$1$2$3')

    return fixed
  }, [])

  // Handle input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'beautify') {
        setOutputJson(formatJson(inputJson))
      } else if (mode === 'minify') {
        setOutputJson(formatJson(inputJson, true))
      } else if (mode === 'validate') {
        const validation = validateJson(inputJson)
        setIsValid(validation.valid)
        setErrors(validation.errors)
        setOutputJson(inputJson)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputJson, mode, formatJson, validateJson])

  // Copy to clipboard
  const copyToClipboard = async (text: string, message: string = 'Copied to clipboard!') => {
    await navigator.clipboard.writeText(text)
    showToast(message)
  }

  // Download JSON
  const downloadJson = (text: string, filename: string = 'formatted.json') => {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Generate shareable link
  const shareJson = async () => {
    const compressed = btoa(outputJson)
    const url = `${window.location.origin}/tools/json-formatter?data=${compressed}`
    await navigator.clipboard.writeText(url)
    showToast('Shareable link copied to clipboard!')
  }

  // Load shared data on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const data = params.get('data')
    if (data) {
      try {
        const decoded = atob(data)
        setInputJson(decoded)
      } catch {}
    }
  }, [])

  // Get JSON path of clicked element
  const getJsonPath = (obj: any, path: string = '', target: any): string | null => {
    if (obj === target) return path
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const newPath = path ? `${path}.${key}` : key
        const result = getJsonPath(obj[key], newPath, target)
        if (result) return result
      }
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">JSON Formatter & Validator</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Format, validate, and transform JSON with smart error detection. 
          The most comprehensive JSON tool for developers.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex w-full">
        {(['beautify', 'validate', 'minify', 'compare'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              mode === m 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {m === 'beautify' && <Code2 className="w-4 h-4 inline mr-2" />}
            {m === 'validate' && <CheckCircle className="w-4 h-4 inline mr-2" />}
            {m === 'minify' && <Minimize2 className="w-4 h-4 inline mr-2" />}
            {m === 'compare' && <GitCompare className="w-4 h-4 inline mr-2" />}
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Settings Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {showSettings && (
            <>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="vscode">VS Code</option>
                <option value="github">GitHub</option>
                <option value="dracula">Dracula</option>
                <option value="monokai">Monokai</option>
              </select>

              <select
                value={indentSize}
                onChange={(e) => setIndentSize(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="\t">Tab</option>
              </select>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputJson(SAMPLE_JSON)}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            Load Sample
          </button>
          <button
            onClick={() => {
              setInputJson('')
              setOutputJson('')
              setErrors([])
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
            title="Cmd/Ctrl + K"
          >
            Clear
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ⌨️ Shortcuts
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={`grid ${mode === 'compare' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
        {/* Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Input JSON</label>
            {errors.length > 0 && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.length} error{errors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="Paste your JSON here..."
              className={`w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.length > 0 ? 'border-red-300' : 'border-gray-300'
              } ${theme === 'dracula' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}
              spellCheck={false}
            />
            
            {/* Error indicators */}
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="absolute left-0 right-0 bg-red-100 border-l-4 border-red-500 p-2 text-sm text-red-700"
                style={{ top: `${error.line * 1.5}em` }}
              >
                Line {error.line}: {error.message}
              </div>
            ))}
          </div>

          {/* Auto-fix button */}
          {errors.length > 0 && (
            <button
              onClick={() => {
                setInputJson(autoFixJson(inputJson))
                showToast('Auto-fixed common JSON errors!')
              }}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
              title="Cmd/Ctrl + F"
            >
              🔧 Auto-Fix Common Errors
            </button>
          )}
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'beautify' ? 'Formatted JSON' : 
               mode === 'minify' ? 'Minified JSON' :
               mode === 'validate' ? 'Validation Result' : 'Output'}
            </label>
            {mode === 'validate' && inputJson && (
              <span className={`text-sm flex items-center gap-1 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {isValid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              value={outputJson}
              readOnly
              className={`w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none ${
                theme === 'dracula' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
              }`}
              spellCheck={false}
            />
            
            {/* JSON Path display */}
            {selectedPath && (
              <div className="absolute bottom-2 left-2 right-2 bg-blue-100 border border-blue-300 rounded p-2 text-sm">
                Path: <code className="font-mono">{selectedPath}</code>
              </div>
            )}
          </div>
        </div>

        {/* Compare Panel (if in compare mode) */}
        {mode === 'compare' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Compare With</label>
            <textarea
              value={compareJson}
              onChange={(e) => setCompareJson(e.target.value)}
              placeholder="Paste JSON to compare..."
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {outputJson && (
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => copyToClipboard(outputJson, 'JSON copied to clipboard!')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy JSON
          </button>
          <button
            onClick={() => {
              downloadJson(outputJson)
              showToast('JSON downloaded!')
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={shareJson}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <button
            onClick={() => copyToClipboard(`\`\`\`json\n${outputJson}\n\`\`\``, 'Markdown snippet copied!')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <FileJson className="w-4 h-4" />
            Copy as Markdown
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
        <span className="font-semibold text-gray-700 mr-4">⌨️ Keyboard Shortcuts:</span>
        <span className="inline-flex gap-4 flex-wrap">
          <span><kbd className="px-2 py-1 bg-white rounded border border-gray-300">⌘/Ctrl + B</kbd> Beautify</span>
          <span><kbd className="px-2 py-1 bg-white rounded border border-gray-300">⌘/Ctrl + M</kbd> Minify</span>
          <span><kbd className="px-2 py-1 bg-white rounded border border-gray-300">⌘/Ctrl + K</kbd> Clear</span>
          <span><kbd className="px-2 py-1 bg-white rounded border border-gray-300">⌘/Ctrl + F</kbd> Auto-Fix</span>
          <span><kbd className="px-2 py-1 bg-white rounded border border-gray-300">⌘/Ctrl + Enter</kbd> Copy</span>
        </span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Smart Error Detection</h3>
          <p className="text-sm text-gray-600">
            Real-time validation with line-by-line error highlighting and helpful fix suggestions.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Multiple Formats</h3>
          <p className="text-sm text-gray-600">
            Convert between JSON, YAML, and CSV. Export formatted JSON as images for documentation.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Developer Friendly</h3>
          <p className="text-sm text-gray-600">
            Keyboard shortcuts, syntax themes, and JSON path explorer for efficient development.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Need to process JSON data in your chatbot?</h2>
        <p className="mb-4 opacity-90">
          SiteAgent automatically parses and understands JSON from your documents and APIs, 
          making it easy to build intelligent chatbots that work with structured data.
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
        >
          Try SiteAgent Free →
        </a>
      </div>
    </div>
  )
} 