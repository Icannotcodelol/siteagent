import SignupForm from './signup-form'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  // Check if user is already logged in
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error checking user session on signup page:', error);
  }
  if (user) {
    // User is logged in, redirect to dashboard
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <SignupForm />
      </div>
    </div>
  )
} 