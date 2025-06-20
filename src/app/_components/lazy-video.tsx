'use client'
import { useEffect, useRef, useState } from 'react'

interface LazyVideoProps {
  src: string
  poster: string
  className?: string
}

export default function LazyVideo({ src, poster, className = '' }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '200px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      poster={poster}
      playsInline
      autoPlay
      muted
      loop
      preload="none"
      className={className}
    />
  )
} 