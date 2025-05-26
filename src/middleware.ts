import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const { error } = await supabase.auth.getSession()
    
    // If there's an auth error and we're not on a public page, clear the session
    if (error && !isPublicPath(request.nextUrl.pathname)) {
      // Clear invalid auth cookies
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      
      // Clear auth cookies
      response.cookies.delete('sb-liqepcjnkbuqaaolksjn-auth-token')
      response.cookies.delete('sb-liqepcjnkbuqaaolksjn-auth-token.0')
      response.cookies.delete('sb-liqepcjnkbuqaaolksjn-auth-token.1')
      
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

// Helper function to check if a path is public
function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
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
    '/api'
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