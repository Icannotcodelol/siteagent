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
        src="https://siteagent.eu/chatbot-widget.js"
        data-chatbot-id="d92f5fd4-a883-4a56-9bd8-46dc8707d8f6"
        data-launcher-icon="https://www.mysugr.com/files/styles/large/public/pictures/people/Blog_logo_mysugr.jpg?itok=4b8N3sWV"
        async
        strategy="afterInteractive"
      />
    </>
  )
} 