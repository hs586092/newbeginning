'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number | null
  firstContentfulPaint: number | null
  largestContentfulPaint: number | null
  cumulativeLayoutShift: number | null
  firstInputDelay: number | null
  timeToInteractive: number | null
}

interface PerformanceEntry extends PerformanceEntry {
  value?: number
  startTime?: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    cumulativeLayoutShift: null,
    firstInputDelay: null,
    timeToInteractive: null
  })

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    const measurePerformance = () => {
      try {
        // Navigation timing
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationTiming) {
          setMetrics(prev => ({
            ...prev,
            loadTime: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
            timeToInteractive: navigationTiming.domInteractive - navigationTiming.navigationStart
          }))
        }

        // Paint timing
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev,
              firstContentfulPaint: entry.startTime
            }))
          }
        })

        // Web Vitals through PerformanceObserver
        if ('PerformanceObserver' in window) {
          // Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const lastEntry = entries[entries.length - 1] as any
            setMetrics(prev => ({
              ...prev,
              largestContentfulPaint: lastEntry.startTime
            }))
          })

          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
          } catch (e) {
            console.debug('LCP observation not supported')
          }

          // Cumulative Layout Shift (CLS)
          let clsValue = 0
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            }
            setMetrics(prev => ({
              ...prev,
              cumulativeLayoutShift: clsValue
            }))
          })

          try {
            clsObserver.observe({ entryTypes: ['layout-shift'] })
          } catch (e) {
            console.debug('CLS observation not supported')
          }

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const firstEntry = entries[0] as any
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: firstEntry.processingStart - firstEntry.startTime
            }))
          })

          try {
            fidObserver.observe({ entryTypes: ['first-input'] })
          } catch (e) {
            console.debug('FID observation not supported')
          }

          // Cleanup observers
          return () => {
            lcpObserver.disconnect()
            clsObserver.disconnect()
            fidObserver.disconnect()
          }
        }
      } catch (error) {
        console.debug('Performance measurement error:', error)
      }
    }

    // Measure immediately and on load
    measurePerformance()
    
    if (document.readyState === 'loading') {
      window.addEventListener('load', measurePerformance)
      return () => window.removeEventListener('load', measurePerformance)
    }
  }, [])

  return metrics
}

// Performance grade calculator
export function getPerformanceGrade(metrics: PerformanceMetrics): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
  issues: string[]
} {
  let score = 100
  const issues: string[] = []

  // LCP scoring (40 points)
  if (metrics.largestContentfulPaint !== null) {
    if (metrics.largestContentfulPaint > 4000) {
      score -= 40
      issues.push('Largest Contentful Paint > 4s (느린 로딩)')
    } else if (metrics.largestContentfulPaint > 2500) {
      score -= 20
      issues.push('Largest Contentful Paint > 2.5s (보통 로딩)')
    }
  }

  // FID scoring (25 points)
  if (metrics.firstInputDelay !== null) {
    if (metrics.firstInputDelay > 300) {
      score -= 25
      issues.push('First Input Delay > 300ms (느린 반응)')
    } else if (metrics.firstInputDelay > 100) {
      score -= 10
      issues.push('First Input Delay > 100ms (보통 반응)')
    }
  }

  // CLS scoring (25 points)
  if (metrics.cumulativeLayoutShift !== null) {
    if (metrics.cumulativeLayoutShift > 0.25) {
      score -= 25
      issues.push('Cumulative Layout Shift > 0.25 (레이아웃 불안정)')
    } else if (metrics.cumulativeLayoutShift > 0.1) {
      score -= 10
      issues.push('Cumulative Layout Shift > 0.1 (약간의 레이아웃 변화)')
    }
  }

  // FCP scoring (10 points)
  if (metrics.firstContentfulPaint !== null) {
    if (metrics.firstContentfulPaint > 3000) {
      score -= 10
      issues.push('First Contentful Paint > 3s (느린 첫 렌더링)')
    }
  }

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (score >= 90) grade = 'A'
  else if (score >= 80) grade = 'B'
  else if (score >= 70) grade = 'C'
  else if (score >= 60) grade = 'D'
  else grade = 'F'

  return { grade, score: Math.max(0, score), issues }
}

// Log performance metrics in development
export function logPerformanceMetrics(metrics: PerformanceMetrics) {
  if (process.env.NODE_ENV !== 'development') return

  console.group('🚀 Performance Metrics')
  console.log('Load Time:', metrics.loadTime ? `${metrics.loadTime.toFixed(2)}ms` : 'Not measured')
  console.log('First Contentful Paint:', metrics.firstContentfulPaint ? `${metrics.firstContentfulPaint.toFixed(2)}ms` : 'Not measured')
  console.log('Largest Contentful Paint:', metrics.largestContentfulPaint ? `${metrics.largestContentfulPaint.toFixed(2)}ms` : 'Not measured')
  console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift !== null ? metrics.cumulativeLayoutShift.toFixed(3) : 'Not measured')
  console.log('First Input Delay:', metrics.firstInputDelay ? `${metrics.firstInputDelay.toFixed(2)}ms` : 'Not measured')
  console.log('Time to Interactive:', metrics.timeToInteractive ? `${metrics.timeToInteractive.toFixed(2)}ms` : 'Not measured')
  
  const { grade, score, issues } = getPerformanceGrade(metrics)
  console.log(`Performance Grade: ${grade} (${score}/100)`)
  if (issues.length > 0) {
    console.log('Issues:', issues)
  }
  console.groupEnd()
}