import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function to detect crawlers and SEO tools
function isCrawlerOrBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  
  const crawlerPatterns = [
    'googlebot',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot', // Moz
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'applebot',
    'chrome-lighthouse',
    'gtmetrix',
    'pingdom',
    'uptime',
    'seo',
    'crawler',
    'spider',
    'scraper',
    'bot',
    'check',
    'monitor',
    'test',
    'audit',
    'scan'
  ]
  
  return crawlerPatterns.some(pattern => userAgent.includes(pattern))
}

export async function middleware(request: NextRequest) {
  try {
    // Skip geolocation redirects for crawlers and SEO tools
    if (isCrawlerOrBot(request)) {
      const { supabase, response } = createClient(request)
      return response
    }

    // ============= GEOLOCATION REDIRECTION =============
    // Check if user should be redirected to Italian page
    const shouldRedirectToItalian = checkForItalianRedirect(request)
    if (shouldRedirectToItalian) {
      return shouldRedirectToItalian
    }

    // Check if user should be redirected to German page
    const shouldRedirectToGerman = checkForGermanRedirect(request)
    if (shouldRedirectToGerman) {
      return shouldRedirectToGerman
    }

    // Check if user should be redirected to Polish page
    const shouldRedirectToPolish = checkForPolishRedirect(request)
    if (shouldRedirectToPolish) {
      return shouldRedirectToPolish
    }

    // Check if user should be redirected to Spanish page
    const shouldRedirectToSpanish = checkForSpanishRedirect(request)
    if (shouldRedirectToSpanish) {
      return shouldRedirectToSpanish
    }

    // Check if user should be redirected to Dutch page
    const shouldRedirectToDutch = checkForDutchRedirect(request)
    if (shouldRedirectToDutch) {
      return shouldRedirectToDutch
    }

    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const { error } = await supabase.auth.getSession()
    
    // Don't clear cookies on auth pages (login/signup) as this can interfere with the auth flow
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth') || 
                      request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/signup'
    
    // If there's an auth error and we're not on a public page or auth page, clear the session
    if (error && !isPublicPath(request.nextUrl.pathname) && !isAuthPage) {
      // Clear invalid auth cookies
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      
      // Clear auth cookies (updated for custom domain)
      response.cookies.delete('sb-authsiteagenteu-auth-token')
      response.cookies.delete('sb-authsiteagenteu-auth-token.0')
      response.cookies.delete('sb-authsiteagenteu-auth-token.1')
      
      return response
    }

    return response
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    console.warn('Middleware: Supabase client creation failed:', e)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

// ============= GEOLOCATION FUNCTIONS =============
function checkForItalianRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Don't redirect if already on Italian page or non-landing pages
  if (pathname.startsWith('/it') || !isLandingPage(pathname)) {
    return null
  }
  
  // Check if user has manually chosen a language (via cookie)
  const languagePreference = request.cookies.get('language-preference')?.value
  if (languagePreference && languagePreference !== 'auto') {
    return null // Respect user's manual choice
  }
  
  const isItalianUser = detectItalianUser(request)
  
  if (isItalianUser && pathname === '/') {
    // Redirect to Italian version
    const url = request.nextUrl.clone()
    url.pathname = '/it'
    
    const response = NextResponse.redirect(url)
    
    // Set a cookie to remember this is an auto-redirect
    response.cookies.set('auto-redirected', 'it', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
  return null
}

function checkForGermanRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Don't redirect if already on German page or non-landing pages
  if (pathname.startsWith('/de') || !isLandingPage(pathname)) {
    return null
  }
  
  // Check if user has manually chosen a language (via cookie)
  const languagePreference = request.cookies.get('language-preference')?.value
  if (languagePreference && languagePreference !== 'auto') {
    return null // Respect user's manual choice
  }
  
  const isGermanUser = detectGermanUser(request)
  
  if (isGermanUser && pathname === '/') {
    // Redirect to German version
    const url = request.nextUrl.clone()
    url.pathname = '/de'
    
    const response = NextResponse.redirect(url)
    
    // Set a cookie to remember this is an auto-redirect
    response.cookies.set('auto-redirected', 'de', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
  return null
}

function detectItalianUser(request: NextRequest): boolean {
  // Method 1: Check Vercel's geolocation headers (available on Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country')
  if (country === 'IT') {
    return true
  }
  
  // Method 2: Check Cloudflare geolocation headers (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')
  if (cfCountry === 'IT') {
    return true
  }
  
  // Method 3: Browser language detection as fallback
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Check if Italian is the primary language
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0])
    const primaryLanguage = languages[0]
    if (primaryLanguage.startsWith('it')) {
      return true
    }
  }
  
  return false
}

function detectGermanUser(request: NextRequest): boolean {
  // Method 1: Check Vercel's geolocation headers (available on Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country')
  if (country === 'DE' || country === 'AT' || country === 'CH') {
    return true
  }
  
  // Method 2: Check Cloudflare geolocation headers (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')
  if (cfCountry === 'DE' || cfCountry === 'AT' || cfCountry === 'CH') {
    return true
  }
  
  // Method 3: Browser language detection as fallback
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Check if German is the primary language
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0])
    const primaryLanguage = languages[0]
    if (primaryLanguage.startsWith('de')) {
      return true
    }
  }
  
  return false
}

function checkForPolishRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Don't redirect if already on Polish page or non-landing pages
  if (pathname.startsWith('/pl') || !isLandingPage(pathname)) {
    return null
  }
  
  // Check if user has manually chosen a language (via cookie)
  const languagePreference = request.cookies.get('language-preference')?.value
  if (languagePreference && languagePreference !== 'auto') {
    return null // Respect user's manual choice
  }
  
  const isPolishUser = detectPolishUser(request)
  
  if (isPolishUser && pathname === '/') {
    // Redirect to Polish version
    const url = request.nextUrl.clone()
    url.pathname = '/pl'
    
    const response = NextResponse.redirect(url)
    
    // Set a cookie to remember this is an auto-redirect
    response.cookies.set('auto-redirected', 'pl', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
  return null
}

function detectPolishUser(request: NextRequest): boolean {
  // Method 1: Check Vercel's geolocation headers (available on Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country')
  if (country === 'PL') {
    return true
  }
  
  // Method 2: Check Cloudflare geolocation headers (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')
  if (cfCountry === 'PL') {
    return true
  }
  
  // Method 3: Browser language detection as fallback
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Check if Polish is the primary language
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0])
    const primaryLanguage = languages[0]
    if (primaryLanguage.startsWith('pl')) {
      return true
    }
  }
  
  return false
}

function checkForSpanishRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Don't redirect if already on Spanish page or non-landing pages
  if (pathname.startsWith('/es') || !isLandingPage(pathname)) {
    return null
  }
  
  // Check if user has manually chosen a language (via cookie)
  const languagePreference = request.cookies.get('language-preference')?.value
  if (languagePreference && languagePreference !== 'auto') {
    return null // Respect user's manual choice
  }
  
  const isSpanishUser = detectSpanishUser(request)
  
  if (isSpanishUser && pathname === '/') {
    // Redirect to Spanish version
    const url = request.nextUrl.clone()
    url.pathname = '/es'
    
    const response = NextResponse.redirect(url)
    
    // Set a cookie to remember this is an auto-redirect
    response.cookies.set('auto-redirected', 'es', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
  return null
}

function detectSpanishUser(request: NextRequest): boolean {
  // Method 1: Check Vercel's geolocation headers (available on Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country')
  if (country === 'ES') {
    return true
  }
  
  // Method 2: Check Cloudflare geolocation headers (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')
  if (cfCountry === 'ES') {
    return true
  }
  
  // Method 3: Browser language detection as fallback
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Check if Spanish is the primary language
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0])
    const primaryLanguage = languages[0]
    if (primaryLanguage.startsWith('es')) {
      return true
    }
  }
  
  return false
}

function checkForDutchRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Don't redirect if already on Dutch page or non-landing pages
  if (pathname.startsWith('/nl') || !isLandingPage(pathname)) {
    return null
  }
  
  // Check if user has manually chosen a language (via cookie)
  const languagePreference = request.cookies.get('language-preference')?.value
  if (languagePreference && languagePreference !== 'auto') {
    return null // Respect user's manual choice
  }
  
  const isDutchUser = detectDutchUser(request)
  
  if (isDutchUser && pathname === '/') {
    // Redirect to Dutch version
    const url = request.nextUrl.clone()
    url.pathname = '/nl'
    
    const response = NextResponse.redirect(url)
    
    // Set a cookie to remember this is an auto-redirect
    response.cookies.set('auto-redirected', 'nl', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
  return null
}

function detectDutchUser(request: NextRequest): boolean {
  // Method 1: Check Vercel's geolocation headers (available on Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country')
  if (country === 'NL' || country === 'BE') {
    return true
  }
  
  // Method 2: Check Cloudflare geolocation headers (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')
  if (cfCountry === 'NL' || cfCountry === 'BE') {
    return true
  }
  
  // Method 3: Browser language detection as fallback
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Check if Dutch is the primary language
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0])
    const primaryLanguage = languages[0]
    if (primaryLanguage.startsWith('nl')) {
      return true
    }
  }
  
  return false
}

function isLandingPage(pathname: string): boolean {
  // Only redirect on the main landing page
  return pathname === '/'
}

// Helper function to check if a path is public
function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/it', // Add Italian page to public paths
    '/de', // Add German page to public paths
    '/pl', // Add Polish page to public paths
    '/es', // Add Spanish page to public paths
    '/nl', // Add Dutch page to public paths
    '/login',
    '/signup',
    '/auth',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/security',
    '/blog',
    '/careers',
    '/api',
    '/sitemap.xml', // Add sitemap to public paths
    '/2025sitemap.xml' // Add 2025 sitemap to public paths
  ]
  
  return publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 