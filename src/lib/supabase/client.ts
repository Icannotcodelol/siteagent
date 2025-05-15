import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Note: supabaseUrl and supabaseAnonKey are validatedNonNull by lint rules
  // Ensure your .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 