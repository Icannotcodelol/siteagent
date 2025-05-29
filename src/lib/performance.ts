// Performance optimization utilities

export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/geist-sans.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const criticalImages = [
    '/icons/AI CHATBOT ICON.svg',
    '/icons/External API Actions.svg',
    '/icons/Document Knowledge Base.svg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// Web Vitals tracking with PostHog
export const trackWebVitals = (metric: any) => {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('web_vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }
};

// Optimize third-party scripts loading
export const optimizeThirdPartyScripts = () => {
  if (typeof window === 'undefined') return;

  // Delay analytics until user interaction
  let analyticsLoaded = false;
  
  const loadAnalytics = () => {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    
    // Trigger deferred analytics loading
    if (window.gtag) {
      window.gtag('config', 'G-P056NB8EH7', {
        send_page_view: true
      });
    }
  };

  // Load analytics on first user interaction
  const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
  events.forEach(event => {
    document.addEventListener(event, loadAnalytics, { once: true, passive: true });
  });

  // Fallback: load after 3 seconds if no interaction
  setTimeout(loadAnalytics, 3000);
};

// Critical CSS injection for above-the-fold content
export const injectCriticalCSS = () => {
  if (typeof window === 'undefined') return;

  const criticalCSS = `
    .hero-gradient {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    }
    .text-loading {
      color: #9ca3af;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}; 