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
        data-chatbot-id="36735ac9-70ed-4d6b-bc11-394b5d2ef930"
        data-launcher-icon="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740"
        strategy="lazyOnload"
      />
    </>
  );
} 