'use client'

import { useState, useEffect, useCallback } from 'react'
import { encode } from 'gpt-tokenizer'

interface ModelInfo {
  name: string
  inputCost: number // per 1K tokens
  outputCost: number // per 1K tokens
  maxTokens: number
}

const MODELS: Record<string, ModelInfo> = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    inputCost: 0.0005,
    outputCost: 0.0015,
    maxTokens: 16385
  },
  'gpt-4': {
    name: 'GPT-4',
    inputCost: 0.03,
    outputCost: 0.06,
    maxTokens: 8192
  },
  'gpt-4o': {
    name: 'GPT-4o',
    inputCost: 0.0025,
    outputCost: 0.01,
    maxTokens: 128000
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    inputCost: 0.00015,
    outputCost: 0.0006,
    maxTokens: 128000
  }
}

export default function TokenCounterTool() {
  const [text, setText] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [tokenCount, setTokenCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const countTokens = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setTokenCount(0)
      return
    }

    setIsLoading(true)
    try {
      // Use gpt-tokenizer to count tokens
      const tokens = encode(inputText)
      setTokenCount(tokens.length)
    } catch (error) {
      console.error('Error counting tokens:', error)
      // Fallback: rough estimation (1 token ≈ 4 chars)
      setTokenCount(Math.ceil(inputText.length / 4))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      countTokens(text)
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [text, countTokens])

  const model = MODELS[selectedModel]
  const inputCost = (tokenCount / 1000) * model.inputCost
  const outputCost = (tokenCount / 1000) * model.outputCost
  const characterCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isOverLimit = tokenCount > model.maxTokens

  const clearText = () => {
    setText('')
  }

  const splitIntoChunks = () => {
    if (!text.trim()) return

    const chunkSize = Math.floor(model.maxTokens * 0.8) // Use 80% of max to be safe
    const words = text.split(' ')
    const chunks = []
    let currentChunk = ''
    let currentTokens = 0

    for (const word of words) {
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + word
      const testTokens = encode(testChunk).length
      
      if (testTokens > chunkSize && currentChunk) {
        chunks.push(currentChunk)
        currentChunk = word
        currentTokens = encode(word).length
      } else {
        currentChunk = testChunk
        currentTokens = testTokens
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk)
    }

    // Copy chunks to clipboard as JSON
    const chunksJson = JSON.stringify(chunks, null, 2)
    navigator.clipboard.writeText(chunksJson)
    alert(`Split into ${chunks.length} chunks and copied to clipboard!`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI Token Counter</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Count tokens, estimate costs, and optimize your AI prompts for different models. 
          Perfect for managing costs and context limits in GPT-based applications.
        </p>
      </div>

      {/* Model Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select AI Model
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.entries(MODELS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.name} (Max: {model.maxTokens.toLocaleString()} tokens)
            </option>
          ))}
        </select>
      </div>

      {/* Text Input Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
          Text to Analyze
        </label>
        <div className="relative">
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your prompt, document, or text here to count tokens..."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />
          {text && (
            <button
              onClick={clearText}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Tokens</div>
          <div className={`text-2xl font-bold ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
            {isLoading ? '...' : tokenCount.toLocaleString()}
            {isOverLimit && (
              <span className="text-sm text-red-600 block">Exceeds limit!</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Input Cost</div>
          <div className="text-2xl font-bold text-gray-900">
            ${inputCost.toFixed(4)}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Characters</div>
          <div className="text-2xl font-bold text-gray-900">
            {characterCount.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Words</div>
          <div className="text-2xl font-bold text-gray-900">
            {wordCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="text-sm text-blue-800">
          <strong>Model Info:</strong> {model.name} • 
          Input: ${model.inputCost}/1K tokens • 
          Output: ${model.outputCost}/1K tokens • 
          Max Context: {model.maxTokens.toLocaleString()} tokens
        </div>
      </div>

      {/* Action Buttons */}
      {text && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={splitIntoChunks}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Split into Chunks & Copy JSON
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Copy Text
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(tokenCount.toString())}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Copy Token Count
          </button>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Need to build an AI chatbot with optimal token usage?</h2>
        <p className="mb-4 opacity-90">
          SiteAgent helps you create intelligent chatbots that efficiently process documents and manage token costs automatically.
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