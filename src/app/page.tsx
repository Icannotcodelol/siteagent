import { AuthButton } from "@/app/_components/auth-button";
import LandingPageClient from "@/app/landing-page-client";
import { Suspense } from 'react';
import Script from "next/script";

export default function Page() {
  // AuthButton is a Server Component, fetching data server-side.
  // LandingPageClient is a Client Component, receiving AuthButton as a prop.
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}> {/* Suspense for AuthButton if needed */}
        <LandingPageClient authButtonSlot={<AuthButton />} />
      </Suspense>
      <Script
        src="https://www.siteagent.eu/chatbot-widget.js"
        data-chatbot-id="565b9865-a040-40b7-bf33-9e5332432454"
        data-launcher-icon="https://pbs.twimg.com/profile_images/1510001089973792771/yf430h4x_400x400.jpg"
        strategy="afterInteractive"
      />
    </>
  );
} 