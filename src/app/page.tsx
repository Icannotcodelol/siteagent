import { AuthButton } from "@/app/_components/auth-button";
import LandingPageClient from "@/app/landing-page-client";
import { Suspense } from 'react';

export default function Page() {
  // AuthButton is a Server Component, fetching data server-side.
  // LandingPageClient is a Client Component, receiving AuthButton as a prop.
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Suspense for AuthButton if needed */}
      <LandingPageClient authButtonSlot={<AuthButton />} />
    </Suspense>
  );
} 