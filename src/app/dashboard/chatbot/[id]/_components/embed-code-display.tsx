'use client'

import { useState, useEffect } from 'react';

interface EmbedCodeDisplayProps {
  chatbotId: string;
  launcherIconUrl?: string | null;
}

export default function EmbedCodeDisplay({ chatbotId, launcherIconUrl }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  // Get window.location.origin safely on client side
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Construct the embed code for the JavaScript widget
  const scriptSrc = `${origin}/chatbot-widget.js`;
  const iconAttr = launcherIconUrl && launcherIconUrl.length < 400 ? `\n    data-launcher-icon=\"${launcherIconUrl}\"` : '';
  const embedCode = `<script
    src="${scriptSrc}"
    data-chatbot-id="${chatbotId}"${iconAttr}
    async
  ></script>`;

  // Don't render anything until we have the origin
  if (!origin) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-20 bg-gray-300 rounded mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy embed code: ', err);
      // You could show an error message to the user here
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Embed this chatbot on your website by pasting the following code into your HTML:
      </p>
      <pre className="bg-gray-900 text-white text-xs p-4 rounded overflow-x-auto">
        <code>
          {embedCode}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={copied}
      >
        {copied ? 'Copied!' : 'Copy Code'}
      </button>
       <p className="text-xs text-gray-500 mt-2">
           Include the above script tag on any page where you want the chatbot widget to appear.
       </p>
    </div>
  );
} 