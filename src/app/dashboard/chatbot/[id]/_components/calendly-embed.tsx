'use client'

import { useEffect, useRef } from 'react';

interface CalendlyEmbedProps {
  /**
   * The full Calendly scheduling URL, e.g. "https://calendly.com/acme/demo".
   */
  url: string;
  /**
   * Height of the embedded iframe in pixels (default 630 px – Calendly's recommended value).
   */
  height?: number;
}

export default function CalendlyEmbed({ url, height = 630 }: CalendlyEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build Embed URL – Calendly supports simple query-params instead of requiring the external widget.js
  const embedDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const embedUrl = `${url}?embed_domain=${embedDomain}&embed_type=Inline`;

  useEffect(() => {
    // Defensive: ensure the iframe reloads when URL changes
    if (iframeRef.current && iframeRef.current.src !== embedUrl) {
      iframeRef.current.src = embedUrl;
    }
  }, [embedUrl]);

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      style={{ width: '100%', height: `${height}px` }}
      frameBorder={0}
      scrolling="no"
      className="rounded-md"
      title="Calendly Scheduling"
    />
  );
} 