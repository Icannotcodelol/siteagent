"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { usePostHog } from 'posthog-js/react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // Disable automatic pageview capture for manual control
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      // Core performance optimizations
      autocapture: false, // Disable to reduce bundle size
      persistence: 'localStorage',
      cross_subdomain_cookie: false,
      secure_cookie: true,
      opt_out_capturing_by_default: false,
      respect_dnt: true
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // Track pageviews with debouncing for better performance
  useEffect(() => {
    if (pathname && posthog) {
      // Debounce pageview tracking to prevent excessive calls
      const timeoutId = setTimeout(() => {
        let url = window.origin + pathname
        if (searchParams.toString()) {
          url = url + "?" + searchParams.toString();
        }

        posthog.capture('$pageview', { 
          '$current_url': url,
          '$title': document.title
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [pathname, searchParams, posthog])

  return null
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
} 