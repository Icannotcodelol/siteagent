import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Define a function to create a Supabase client for server-side operations
// This version calls cookies() internally in each method.
export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Make ALL methods async and call cookies() inside
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
            console.warn(`Server Component: Failed to set cookie '${name}'. ${error}`)
          }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
            console.warn(`Server Component: Failed to remove cookie '${name}'. ${error}`)
          }
        },
      },
    }
  )
}
