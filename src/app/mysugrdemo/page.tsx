import Script from 'next/script'

export default function MySugrDemo() {
  return (
    <>
      {/* Full-screen background image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/mysugrdemo.png)',
          zIndex: 1
        }}
      />
      
      {/* MySugr demo chatbot script - only for this page */}
      <Script
        src="https://www.siteagent.eu/chatbot-widget.js"
        data-chatbot-id="c06e2d82-7a92-469b-b7b6-427a8d892e70"
        async
        strategy="afterInteractive"
      />
    </>
  )
} 