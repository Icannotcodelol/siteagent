import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/app/_components/ui/button';

export async function AuthButton() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <Link href="/dashboard">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Go to Dashboard
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/login">
        <Button
          variant="ghost"
          className="text-gray-300 hover:bg-gray-800/50 hover:text-white"
        >
          Log in
        </Button>
      </Link>
      <Link href="/signup">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Sign Up
        </Button>
      </Link>
    </>
  );
} 