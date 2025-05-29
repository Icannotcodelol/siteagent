'use client'

import Script from "next/script";

// Global types for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function Analytics() {
  return (
    <>
      {/* Optimized Google Analytics - Load after critical content */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-P056NB8EH7"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(...args: any[]) {
              window.dataLayer.push(args);
            };
            window.gtag('js', new Date());
            window.gtag('config', 'G-P056NB8EH7', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: false // Manual control for better performance
            });
          }
        }}
      />
      
      {/* Optimized DataFast Analytics - Non-blocking */}
      <Script
        src="/js/script.js"
        data-website-id="682e196bcf3d65067036c6f7"
        data-domain="siteagent.eu"
        strategy="lazyOnload"
      />
    </>
  );
} 