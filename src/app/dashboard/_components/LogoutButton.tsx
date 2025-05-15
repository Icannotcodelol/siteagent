'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/_components/ui/button'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') // Redirect to login after sign out
    router.refresh() // Force refresh server components
  }

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      size="sm"
    >
      Logout
    </Button>
  )
} 