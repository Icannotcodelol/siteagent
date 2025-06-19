'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Search, Globe, RefreshCw, Heart, Copy, ExternalLink, Loader2, Check, X, AlertCircle } from 'lucide-react'

type Industry = 'tech' | 'ecommerce' | 'saas' | 'finance' | 'health' | 'education' | 'food' | 'fashion' | 'creative' | 'other'
type Style = 'modern' | 'classic' | 'playful' | 'professional' | 'abstract' | 'descriptive'

interface DomainStatus {
  available: boolean | null
  price?: {
    min: number
    max: number
    note: string
  }
  premium?: boolean
  error?: string
}

interface NameSuggestion {
  name: string
  domains: {
    com: DomainStatus
    io: DomainStatus
    ai: DomainStatus
  }
  reasoning: string
  checking?: boolean
}

// Name generation patterns and components - Updated for more uniqueness
const techPrefixes = ['Aero', 'Algo', 'Byte', 'Cipher', 'Dyna', 'Echo', 'Fusion', 'Helix', 'Ionic', 'Kinetic']
const techSuffixes = ['fy', 'ity', 'verse', 'sync', 'forge', 'craft', 'stack', 'mesh', 'node', 'grid']
const modernWords = ['Prism', 'Zenith', 'Axiom', 'Catalyst', 'Quantum', 'Synapse', 'Nebula', 'Horizon', 'Beacon', 'Spectrum']
const playfulWords = ['Wiggle', 'Bounce', 'Sparkle', 'Doodle', 'Giggly', 'Tickle', 'Wobble', 'Zippity', 'Boing', 'Whoosh']
const professionalWords = ['Meridian', 'Pinnacle', 'Vanguard', 'Legacy', 'Compass', 'Frontier', 'Keystone', 'Blueprint', 'Catalyst', 'Benchmark']
const abstractSyllables = ['qo', 'xu', 'zy', 'wi', 'vu', 'ji', 'ko', 'py', 'qu', 'xi', 'zu', 'wy']
const uniquePatterns = ['CVCV', 'VCVC', 'CVCCV', 'VCCV'] // C=consonant, V=vowel patterns for unique names

const exampleDescriptions = [
  { text: "AI-powered tool that helps writers overcome writer's block", industry: 'tech' as Industry },
  { text: "Marketplace for buying and selling vintage sneakers", industry: 'ecommerce' as Industry },
  { text: "App that connects pet owners with trusted local pet sitters", industry: 'other' as Industry },
  { text: "Platform for learning languages through conversations with AI", industry: 'education' as Industry }
]

export default function StartupNameGenerator() {
  const [industry, setIndustry] = useState<Industry>('tech')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [style, setStyle] = useState<Style>('modern')
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [copiedName, setCopiedName] = useState<string | null>(null)
  const [checkingDomains, setCheckingDomains] = useState<Set<string>>(new Set())
  const [availabilityStats, setAvailabilityStats] = useState({ total: 0, available: 0 })

  // Extract meaningful words from description
  const extractDescriptionWords = (desc: string): string[] => {
    const stopWords = ['a', 'an', 'the', 'that', 'helps', 'for', 'with', 'to', 'and', 'or', 'of', 'in', 'on', 'at', 'by']
    const words = desc.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.includes(w))
    return [...new Set(words)]
  }

  // Generate unique name using pattern
  const generateUniquePattern = (): string => {
    const consonants = 'bcdfghjklmnpqrstvwxyz'
    const vowels = 'aeiou'
    const pattern = uniquePatterns[Math.floor(Math.random() * uniquePatterns.length)]
    
    return pattern.split('').map(char => {
      if (char === 'C') return consonants[Math.floor(Math.random() * consonants.length)]
      return vowels[Math.floor(Math.random() * vowels.length)]
    }).join('')
  }

  // Generate names based on inputs
  const generateNames = useCallback((regenerate: boolean = false) => {
    setIsGenerating(true)
    
    if (!regenerate) {
      setSuggestions([])
      setAvailabilityStats({ total: 0, available: 0 })
    }
    
    // Simulate API delay
    setTimeout(() => {
      const newSuggestions: NameSuggestion[] = []
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k)
      const descWords = extractDescriptionWords(description)
      const allContextWords = [...keywordList, ...descWords]
      
      // Generate 12 unique names with different strategies
      for (let i = 0; i < 12; i++) {
        let name = ''
        let reasoning = ''
        
        // Use description-based generation more often
        if (allContextWords.length > 0 && Math.random() > 0.3) {
          const contextWord = allContextWords[Math.floor(Math.random() * allContextWords.length)]
          
          // Various strategies to modify context words
          const strategy = Math.floor(Math.random() * 6)
          switch (strategy) {
            case 0: // Add unique suffix
              name = contextWord.charAt(0).toUpperCase() + contextWord.slice(1) + 
                     techSuffixes[Math.floor(Math.random() * techSuffixes.length)]
              reasoning = `Modified "${contextWord}" from your description with tech suffix`
              break
            case 1: // Combine with abstract syllable
              name = contextWord.slice(0, Math.ceil(contextWord.length / 2)) + 
                     abstractSyllables[Math.floor(Math.random() * abstractSyllables.length)]
              reasoning = `Creative blend using "${contextWord}" from your idea`
              break
            case 2: // Prefix + modified word
              const prefix = techPrefixes[Math.floor(Math.random() * techPrefixes.length)]
              name = prefix + contextWord.charAt(0).toUpperCase() + contextWord.slice(1, -1)
              reasoning = `Tech-forward name inspired by "${contextWord}"`
              break
            case 3: // Word mashup
              if (allContextWords.length > 1) {
                const word2 = allContextWords[Math.floor(Math.random() * allContextWords.length)]
                name = contextWord.slice(0, Math.ceil(contextWord.length / 2)) + 
                       word2.slice(Math.floor(word2.length / 2))
                reasoning = `Unique combination of your key concepts`
              } else {
                name = generateUniquePattern() + contextWord.slice(-2)
                reasoning = `Abstract name with hint of "${contextWord}"`
              }
              break
            case 4: // Vowel substitution
              name = contextWord.replace(/[aeiou]/g, () => 
                ['y', 'i', 'o'][Math.floor(Math.random() * 3)]
              )
              reasoning = `Stylized version of "${contextWord}"`
              break
            case 5: // Double consonant + suffix
              name = contextWord.charAt(0).toUpperCase() + 
                     contextWord.charAt(1) + contextWord.charAt(1) +
                     contextWord.slice(2, 4) + 'o'
              reasoning = `Catchy variation of "${contextWord}"`
              break
          }
          
          name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        } else {
          // Fallback to style-based generation
          switch (style) {
            case 'modern':
              if (Math.random() > 0.5) {
                name = generateUniquePattern().charAt(0).toUpperCase() + generateUniquePattern().slice(1)
                reasoning = `Modern, unique brandable name`
              } else {
                const word = modernWords[Math.floor(Math.random() * modernWords.length)]
                name = word + generateUniquePattern().slice(0, 3)
                reasoning = `Modern blend with unique ending`
              }
              break
              
            case 'playful':
              const playful = playfulWords[Math.floor(Math.random() * playfulWords.length)]
              name = playful + 'y' + generateUniquePattern().slice(0, 2).toUpperCase()
              reasoning = `Fun, memorable name that's easy to say`
              break
              
            case 'professional':
              const prof = professionalWords[Math.floor(Math.random() * professionalWords.length)]
              name = prof + ' ' + getIndustryWord(industry)
              reasoning = `Professional name for ${industry} sector`
              break
              
            case 'abstract':
              // Generate completely unique abstract names
              name = generateUniquePattern() + abstractSyllables[Math.floor(Math.random() * abstractSyllables.length)]
              name = name.charAt(0).toUpperCase() + name.slice(1)
              reasoning = `Unique, brandable abstract name`
              break
              
            case 'descriptive':
              const descriptor = getIndustryDescriptor(industry)
              if (allContextWords.length > 0) {
                const word = allContextWords[0]
                name = word.charAt(0).toUpperCase() + word.slice(1) + descriptor
              } else {
                name = getIndustryWord(industry) + descriptor
              }
              reasoning = `Descriptive name for ${industry} business`
              break
              
            default:
              // Classic style with unique twist
              const prefix = techPrefixes[Math.floor(Math.random() * techPrefixes.length)]
              name = prefix + generateUniquePattern().slice(0, 4)
              reasoning = `Classic tech-style name with unique ending`
          }
        }
        
        // Ensure uniqueness
        if (!newSuggestions.some(s => s.name === name)) {
          newSuggestions.push({
            name,
            domains: {
              com: { available: null },
              io: { available: null },
              ai: { available: null }
            },
            reasoning,
            checking: false
          })
        }
      }
      
      setSuggestions(newSuggestions)
      setIsGenerating(false)
      
      // Check domain availability for all generated names
      checkDomainsForSuggestions(newSuggestions)
    }, 1500)
  }, [industry, keywords, style, description, extractDescriptionWords, generateUniquePattern])

  // Check domain availability
  const checkDomainsForSuggestions = async (suggestionsList: NameSuggestion[]) => {
    let totalAvailable = 0
    let checkedCount = 0
    
    for (let i = 0; i < suggestionsList.length; i++) {
      const suggestion = suggestionsList[i]
      
      // Add small delay between checks to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      setCheckingDomains(prev => new Set(prev).add(suggestion.name))
      
      try {
        const response = await fetch('/api/tools/check-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: suggestion.name,
            extensions: ['com', 'io', 'ai']
          })
        })

        if (response.ok) {
          const data = await response.json()
          
          // Count available domains
          const availableCount = Object.values(data.results).filter((r: any) => r.available).length
          if (availableCount >= 2) {
            totalAvailable++
          }
          checkedCount++
          
          // Update the suggestion with real domain data
          setSuggestions(prev => prev.map(s => {
            if (s.name === suggestion.name) {
              return {
                ...s,
                domains: {
                  com: data.results.com || { available: null, error: 'Check failed' },
                  io: data.results.io || { available: null, error: 'Check failed' },
                  ai: data.results.ai || { available: null, error: 'Check failed' }
                },
                checking: false
              }
            }
            return s
          }))
          
          // Update stats
          setAvailabilityStats({ total: checkedCount, available: totalAvailable })
        }
      } catch (error) {
        console.error('Domain check error:', error)
        checkedCount++
      } finally {
        setCheckingDomains(prev => {
          const newSet = new Set(prev)
          newSet.delete(suggestion.name)
          return newSet
        })
      }
    }
    
    // If less than 30% of names have available domains, generate more
    if (checkedCount > 0 && (totalAvailable / checkedCount) < 0.3) {
      setTimeout(() => {
        generateNames(true) // Regenerate with different names
      }, 2000)
    }
  }

  // Helper functions
  const getIndustryWord = (ind: Industry): string => {
    const words: Record<Industry, string[]> = {
      tech: ['Tech', 'Digital', 'Code', 'Systems', 'Software'],
      ecommerce: ['Shop', 'Market', 'Store', 'Commerce', 'Retail'],
      saas: ['Cloud', 'Suite', 'Platform', 'Service', 'Solutions'],
      finance: ['Finance', 'Capital', 'Wealth', 'Fund', 'Invest'],
      health: ['Health', 'Care', 'Med', 'Wellness', 'Life'],
      education: ['Learn', 'Edu', 'Academy', 'School', 'Teach'],
      food: ['Food', 'Eat', 'Dine', 'Taste', 'Kitchen'],
      fashion: ['Style', 'Fashion', 'Wear', 'Trend', 'Boutique'],
      creative: ['Creative', 'Design', 'Studio', 'Art', 'Craft'],
      other: ['Venture', 'Group', 'Co', 'Labs', 'Works']
    }
    const industryWords = words[ind]
    return industryWords[Math.floor(Math.random() * industryWords.length)]
  }

  const getIndustryDescriptor = (ind: Industry): string => {
    const descriptors: Record<Industry, string[]> = {
      tech: ['Labs', 'Works', 'Systems', 'Solutions', 'Tech'],
      ecommerce: ['Hub', 'Direct', 'Express', 'Online', 'Plus'],
      saas: ['Cloud', 'Pro', 'Suite', 'App', 'OS'],
      finance: ['Bank', 'Pay', 'Trust', 'Group', 'Partners'],
      health: ['Care', 'Plus', 'Med', 'Bio', 'Life'],
      education: ['Academy', 'Learn', 'Prep', 'U', 'Ed'],
      food: ['Eats', 'Kitchen', 'Fresh', 'Bites', 'Table'],
      fashion: ['Couture', 'Collection', 'Threads', 'Label', 'Atelier'],
      creative: ['Studio', 'Works', 'Lab', 'Collective', 'Agency'],
      other: ['Co', 'Group', 'Partners', 'Collective', 'Ventures']
    }
    const industryDescriptors = descriptors[ind]
    return industryDescriptors[Math.floor(Math.random() * industryDescriptors.length)]
  }

  // Copy name to clipboard
  const copyName = (name: string) => {
    navigator.clipboard.writeText(name)
    setCopiedName(name)
    setTimeout(() => setCopiedName(null), 2000)
  }

  // Toggle favorite
  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  // Generate initial suggestions when description is provided
  useEffect(() => {
    if (description.trim().length > 10) {
      generateNames(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Startup Name Generator</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate unique, memorable names for your startup with instant domain availability checking. 
          Describe your idea below and we'll create names with available domains.
        </p>
      </div>

      {/* Example Ideas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">💡 Try an example (click to use):</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleDescriptions.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDescription(example.text)
                setIndustry(example.industry)
                setTimeout(() => generateNames(false), 100)
              }}
              className="text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1 rounded transition-colors"
            >
              • "{example.text}"
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Description Input - NEW */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your startup idea <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., 'A platform that helps remote teams collaborate on design projects in real-time' or 'An app that connects local farmers directly with consumers'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific! The more detail you provide, the more unique and relevant names we can generate.
          </p>
        </div>

        {/* Industry Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry / Niche
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(['tech', 'ecommerce', 'saas', 'finance', 'health', 'education', 'food', 'fashion', 'creative', 'other'] as Industry[]).map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  industry === ind
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {ind.charAt(0).toUpperCase() + ind.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Keywords Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords (optional)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keywords separated by commas (e.g., fast, secure, cloud)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Naming Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['modern', 'classic', 'playful', 'professional', 'abstract', 'descriptive'] as Style[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  style === s
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => generateNames(false)}
          disabled={isGenerating || !description.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Names...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate New Names
            </>
          )}
        </button>

        {/* Manual Domain Check */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Or check a specific domain:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter domain name (without extension)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  const name = e.currentTarget.value
                  const manualSuggestion: NameSuggestion = {
                    name,
                    domains: {
                      com: { available: null },
                      io: { available: null },
                      ai: { available: null }
                    },
                    reasoning: 'Manually entered domain name',
                    checking: true
                  }
                  setSuggestions(prev => [manualSuggestion, ...prev.slice(0, 11)])
                  checkDomainsForSuggestions([manualSuggestion])
                  e.currentTarget.value = ''
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input')
                if (input && input.value) {
                  const name = input.value
                  const manualSuggestion: NameSuggestion = {
                    name,
                    domains: {
                      com: { available: null },
                      io: { available: null },
                      ai: { available: null }
                    },
                    reasoning: 'Manually entered domain name',
                    checking: true
                  }
                  setSuggestions(prev => [manualSuggestion, ...prev.slice(0, 11)])
                  checkDomainsForSuggestions([manualSuggestion])
                  input.value = ''
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              Check
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generated Names</h2>
              {availabilityStats.total > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {availabilityStats.available} of {availabilityStats.total} names have multiple domains available
                  {availabilityStats.available < 3 && checkingDomains.size === 0 && (
                    <span className="text-blue-600 ml-2">• Generating more unique options...</span>
                  )}
                </p>
              )}
            </div>
            {favorites.length > 0 && (
              <span className="text-sm text-gray-600">
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-all"
              >
                {/* Name and Actions */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{suggestion.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(suggestion.name)}
                      className={`p-1.5 rounded-md transition-colors ${
                        favorites.includes(suggestion.name)
                          ? 'text-red-500 bg-red-50'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(suggestion.name) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => copyName(suggestion.name)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    >
                      {copiedName === suggestion.name ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-sm text-gray-600 mb-3">{suggestion.reasoning}</p>

                {/* Domain Availability */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Domain Availability:</p>
                  <div className="space-y-1.5">
                    {Object.entries(suggestion.domains).map(([ext, status]) => (
                      <div
                        key={ext}
                        className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                          status.available === null
                            ? 'bg-gray-50 text-gray-600'
                            : status.available
                            ? status.premium
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {status.available === null || checkingDomains.has(suggestion.name) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : status.available ? (
                            status.premium ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span className="font-medium">.{ext}</span>
                        </div>
                        
                        {status.available && status.price && (
                          <span className="text-xs">
                            {status.premium ? (
                              <span className="font-semibold text-yellow-700">
                                ${status.price.min.toLocaleString()}-${
                                  status.price.max > 10000 ? '100k+' : status.price.max.toLocaleString()
                                }
                              </span>
                            ) : (
                              <span className="text-green-700">
                                ${status.price.min}-${status.price.max}/yr
                              </span>
                            )}
                          </span>
                        )}
                        
                        {status.available === false && (
                          <span className="text-xs opacity-75">Taken</span>
                        )}
                        
                        {status.error && (
                          <span className="text-xs opacity-75">{status.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${suggestion.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Check all TLDs <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    {(() => {
                      const availableDomains = Object.values(suggestion.domains).filter(d => d.available && d.price)
                      const totalMin = availableDomains.reduce((sum, d) => sum + (d.price?.min || 0), 0)
                      const hasPremium = availableDomains.some(d => d.premium)
                      
                      return (
                        <>
                          {hasPremium && (
                            <span className="text-xs text-yellow-600 font-medium">⚠️ Premium</span>
                          )}
                          {availableDomains.length > 0 && !hasPremium && (
                            <span className="text-xs text-gray-600">
                              ~${totalMin}/yr for all
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Favorites</h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((name) => (
              <div
                key={name}
                className="bg-white px-3 py-1.5 rounded-md border border-blue-300 text-sm font-medium text-blue-700 flex items-center gap-2"
              >
                {name}
                <button
                  onClick={() => copyName(name)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">💡 Pro Tips for Choosing a Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>Domain Availability:</strong> Prioritize names with available .com domains for better credibility.
          </div>
          <div>
            <strong>Pronunciation:</strong> Choose names that are easy to spell and pronounce in your target markets.
          </div>
          <div>
            <strong>Trademark Check:</strong> Always verify your chosen name isn't already trademarked in your industry.
          </div>
          <div>
            <strong>Social Media:</strong> Check if matching social media handles are available across platforms.
          </div>
        </div>
        
        {/* Premium Domain Warning */}
        {suggestions.some(s => Object.values(s.domains).some(d => d.premium)) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>About Premium Domains:</strong> Some domains are marked as "premium" by registrars. 
                These can cost anywhere from $100 to over $100,000+. Premium domains are usually:
                <ul className="mt-1 ml-4 list-disc">
                  <li>Very short (1-3 letters)</li>
                  <li>Common dictionary words</li>
                  <li>Popular keywords (AI, crypto, finance, etc.)</li>
                  <li>Previously owned domains being resold</li>
                </ul>
                <strong>Tip:</strong> Add more detail to your description to generate more unique, affordable names!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Got Your Perfect Name?</h2>
        <p className="mb-4 opacity-90">
          Now create an AI chatbot to engage visitors from day one. SiteAgent helps startups 
          build intelligent customer interactions without coding.
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
        >
          Build Your Startup Chatbot →
        </a>
      </div>
    </div>
  )
} 