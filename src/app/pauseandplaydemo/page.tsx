import Script from "next/script";

export default function PauseAndPlayDemoPage() {
  return (
    <>
      {/* Full-screen background image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/pauseandplaydemo.png)',
          zIndex: 1
        }}
      />
      
      {/* Demo chatbot script - only for this page */}
      <Script
        src="https://www.siteagent.eu/chatbot-widget.js"
        data-chatbot-id="6e9919f6-15e4-472e-be53-b6c3de0a652d"
        async
        strategy="afterInteractive"
      />
    </>
  );
} 