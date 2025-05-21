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
      <script
    src="https://www.siteagent.eu/chatbot-widget.js"
    data-chatbot-id="36735ac9-70ed-4d6b-bc11-394b5d2ef930"
    async
  ></script>
    </>
  );
} 