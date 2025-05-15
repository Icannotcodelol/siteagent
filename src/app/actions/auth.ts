'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// cookies is not needed if createClient doesn't take it
// import { cookies } from 'next/headers';

export async function signOutAction() {
  // const cookieStore = cookies();
  // Call createClient without arguments
  const supabase = createClient(); 

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    // Optionally redirect to an error page or show a message
    // For now, we'll redirect to login even if signout fails server-side
    // The client-side cookie should be cleared anyway.
  }

  // Redirect to login page after sign out
  // Use redirect from next/navigation
  redirect('/login');
} 