import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear all possible Supabase auth cookies
    const authCookieNames = [
      'sb-liqepcjnkbuqaaolksjn-auth-token',
      'sb-liqepcjnkbuqaaolksjn-auth-token.0',
      'sb-liqepcjnkbuqaaolksjn-auth-token.1',
      'sb-liqepcjnkbuqaaolksjn-auth-token.2',
    ]
    
    authCookieNames.forEach(name => {
      cookieStore.delete(name)
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing auth cookies:', error)
    return NextResponse.json({ error: 'Failed to clear cookies' }, { status: 500 })
  }
} 