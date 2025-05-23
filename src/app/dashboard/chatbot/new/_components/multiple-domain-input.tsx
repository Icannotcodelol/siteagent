'use client'

import { useState } from 'react'
import { PlusIcon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface MultipleDomainInputProps {
  domains: string[]
  onChange: (domains: string[]) => void
  disabled?: boolean
}

export default function MultipleDomainInput({ domains, onChange, disabled = false }: MultipleDomainInputProps) {
  const [newDomain, setNewDomain] = useState('')
  const [errors, setErrors] = useState<{ [index: number]: string }>({})

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false
    return url.startsWith('http://') || url.startsWith('https://')
  }

  const addDomain = () => {
    const trimmedDomain = newDomain.trim()
    
    if (!trimmedDomain) return
    
    if (!isValidUrl(trimmedDomain)) {
      return
    }
    
    // Check for duplicates
    if (domains.includes(trimmedDomain)) {
      return
    }
    
    const updatedDomains = [...domains, trimmedDomain]
    onChange(updatedDomains)
    setNewDomain('')
    
    // Clear any existing errors for the new domain
    if (errors[domains.length]) {
      const newErrors = { ...errors }
      delete newErrors[domains.length]
      setErrors(newErrors)
    }
  }

  const removeDomain = (index: number) => {
    const updatedDomains = domains.filter((_, i) => i !== index)
    onChange(updatedDomains)
    
    // Clear errors for removed domain and reindex
    const newErrors: { [index: number]: string } = {}
    Object.keys(errors).forEach(key => {
      const keyIndex = parseInt(key)
      if (keyIndex < index) {
        newErrors[keyIndex] = errors[keyIndex]
      } else if (keyIndex > index) {
        newErrors[keyIndex - 1] = errors[keyIndex]
      }
    })
    setErrors(newErrors)
  }

  const updateDomain = (index: number, value: string) => {
    const updatedDomains = [...domains]
    updatedDomains[index] = value
    onChange(updatedDomains)
    
    // Clear error for this domain when user starts typing
    if (errors[index]) {
      const newErrors = { ...errors }
      delete newErrors[index]
      setErrors(newErrors)
    }
  }

  const validateDomain = (index: number, value: string) => {
    const newErrors = { ...errors }
    
    if (value.trim() && !isValidUrl(value.trim())) {
      newErrors[index] = 'Please include http:// or https://'
    } else if (value.trim() && domains.filter(d => d === value.trim()).length > 1) {
      newErrors[index] = 'This domain is already added'
    } else {
      delete newErrors[index]
    }
    
    setErrors(newErrors)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDomain()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
        <label className="block text-sm font-medium text-gray-300">
          Website Domains to Scrape
        </label>
      </div>
      
      <p className="text-xs text-gray-500">
        Add multiple website URLs to scrape content from. Each domain will be processed separately.
      </p>

      {/* Existing domains list */}
      {domains.length > 0 && (
        <div className="space-y-2">
          {domains.map((domain, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="url"
                  value={domain}
                  onChange={(e) => updateDomain(index, e.target.value)}
                  onBlur={(e) => validateDomain(index, e.target.value)}
                  placeholder="https://example.com"
                  className={`block w-full px-3 py-2 bg-gray-800 border rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                    errors[index] ? 'border-red-500' : 'border-gray-700'
                  }`}
                  disabled={disabled}
                />
                {errors[index] && (
                  <p className="mt-1 text-xs text-red-400">{errors[index]}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeDomain(index)}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Remove domain"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new domain input */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="url"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com"
            className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          onClick={addDomain}
          disabled={disabled || !newDomain.trim() || !isValidUrl(newDomain.trim()) || domains.includes(newDomain.trim())}
          className="p-2 text-gray-400 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Add domain"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {domains.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <div className="mb-3">
            <GlobeAltIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p>No domains added yet. Add your first domain above.</p>
          </div>
          <div className="text-xs text-gray-600">
            <p className="mb-2">Examples of domains you can add:</p>
            <div className="space-y-1">
              <p>• https://example.com</p>
              <p>• https://docs.example.com</p>
              <p>• https://blog.example.com/help</p>
              <p>• https://support.example.com/faq</p>
            </div>
          </div>
        </div>
      )}

      {domains.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{domains.length} domain{domains.length !== 1 ? 's' : ''} added</span>
          <span>Each domain will be scraped separately</span>
        </div>
      )}
    </div>
  )
} 