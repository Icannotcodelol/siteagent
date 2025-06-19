import { NextRequest, NextResponse } from 'next/server'
import { Resolver } from 'dns/promises'

const resolver = new Resolver()
// Set public DNS servers for consistent results
resolver.setServers(['8.8.8.8', '8.8.4.4']) // Google DNS

// Common TLDs with typical pricing ranges (in USD)
const TLD_PRICING = {
  com: { min: 10, max: 15, premium: true },
  io: { min: 35, max: 50, premium: true },
  ai: { min: 70, max: 120, premium: true },
  net: { min: 10, max: 15, premium: true },
  org: { min: 10, max: 15, premium: false },
  co: { min: 25, max: 35, premium: true },
  app: { min: 15, max: 20, premium: true },
  dev: { min: 15, max: 20, premium: false },
}

export async function POST(request: NextRequest) {
  try {
    const { domain, extensions = ['com', 'io', 'ai'] } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 })
    }

    // Clean the domain name
    const cleanDomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, '')

    const results: Record<string, any> = {}

    for (const ext of extensions) {
      const fullDomain = `${cleanDomain}.${ext}`
      
      try {
        // Try to resolve the domain - if it resolves, it's taken
        await resolver.resolve4(fullDomain)
        
        results[ext] = {
          available: false,
          price: null,
          premium: false
        }
      } catch (error: any) {
        // If DNS lookup fails, domain might be available
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
          // Domain appears to be available
          const pricing = TLD_PRICING[ext as keyof typeof TLD_PRICING]
          
          // Check if it might be a premium domain
          const isPremium = checkIfPremiumDomain(cleanDomain, ext)
          
          results[ext] = {
            available: true,
            price: isPremium 
              ? { min: pricing?.min ? pricing.min * 10 : 100, max: 100000, note: 'Premium domain' }
              : { min: pricing?.min || 10, max: pricing?.max || 20, note: 'Standard pricing' },
            premium: isPremium
          }
        } else {
          // Other errors - assume unavailable
          results[ext] = {
            available: false,
            price: null,
            premium: false,
            error: 'Check failed'
          }
        }
      }
    }

    return NextResponse.json({
      domain: cleanDomain,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Domain check error:', error)
    return NextResponse.json(
      { error: 'Failed to check domain availability' },
      { status: 500 }
    )
  }
}

function checkIfPremiumDomain(domain: string, tld: string): boolean {
  // Premium domain patterns
  const premiumPatterns = [
    /^[a-z]$/, // Single letter
    /^[a-z]{2}$/, // Two letters
    /^[0-9]+$/, // Numbers only
    /^[a-z]{3}$/, // Three letters (sometimes)
  ]

  // Common premium keywords
  const premiumKeywords = [
    'ai', 'app', 'bet', 'bitcoin', 'blockchain', 'bot', 'casino', 'cloud', 
    'crypto', 'finance', 'forex', 'game', 'gold', 'hotel', 'insurance', 
    'invest', 'loan', 'money', 'nft', 'pay', 'poker', 'shop', 'trade', 'vip'
  ]

  // Check patterns
  if (premiumPatterns.some(pattern => pattern.test(domain))) {
    return true
  }

  // Check keywords
  if (premiumKeywords.some(keyword => domain.includes(keyword))) {
    return true
  }

  // Very short domains are often premium
  if (domain.length <= 4) {
    return true
  }

  return false
} 