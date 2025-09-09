'use client'

import { useEffect } from 'react'
import { usePerformance, logPerformanceMetrics } from '@/hooks/use-performance'

export function PerformanceMonitor() {
  const metrics = usePerformance()

  useEffect(() => {
    // Log metrics when they're available
    if (metrics.largestContentfulPaint || metrics.firstContentfulPaint) {
      logPerformanceMetrics(metrics)
    }
  }, [metrics])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return null // This component only logs to console
}