'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') // Redirect to login after sign out
    router.refresh() // Force refresh server components
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded transition duration-150 ease-in-out"
    >
      Logout
    </button>
  )
} 