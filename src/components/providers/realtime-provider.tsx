'use client'

import { useRealtimeSubscription } from '@/lib/hooks/use-realtime-improved'
import { useEffect, useState } from 'react'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  try {
    useRealtimeSubscription()
  } catch (error) {
    console.error('RealtimeProvider error:', error)
    if (!hasError) {
      setHasError(true)
    }
  }

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('channel') || event.error?.message?.includes('realtime')) {
        console.error('Realtime error caught:', event.error)
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return <>{children}</>
}