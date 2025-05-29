'use client'

import { useEffect } from 'react'
import { trackWebVitals } from '@/lib/performance'

export function WebVitals() {
  useEffect(() => {
    // Dynamic import of web-vitals to reduce initial bundle size
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(trackWebVitals)
      onINP(trackWebVitals)
      onFCP(trackWebVitals)
      onLCP(trackWebVitals)
      onTTFB(trackWebVitals)
    })
  }, [])

  return null
} 