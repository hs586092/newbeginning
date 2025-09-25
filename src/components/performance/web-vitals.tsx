'use client'

import { useEffect } from 'react'

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  delta: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Web Vitals 임계값 정의
const thresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 }
}

const getRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = thresholds[metric as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

const sendToAnalytics = (metric: WebVitalsMetric) => {
  // Google Analytics 4로 전송
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      custom_map: {
        metric_name: metric.name
      },
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_delta: metric.delta,
      metric_rating: metric.rating
    })
  }

  // 개발 환경에서 콘솔에 로그
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Web Vitals: ${metric.name}`)
    console.log(`Value: ${Math.round(metric.value)}ms`)
    console.log(`Rating: ${metric.rating}`)
    console.log(`ID: ${metric.id}`)
    console.log(`Delta: ${metric.delta}`)
    console.groupEnd()
  }

  // 성능 저하 경고
  if (metric.rating === 'poor') {
    console.warn(`⚠️ Poor ${metric.name}: ${Math.round(metric.value)}ms`)
  }
}

export function WebVitalsMonitor() {
  useEffect(() => {
    const loadWebVitals = async () => {
      try {
        // Check if window is available (client-side only)
        if (typeof window === 'undefined') {
          return
        }

        // Dynamic import with better error handling
        const webVitalsModule = await import('web-vitals')

        if (!webVitalsModule || typeof webVitalsModule.getCLS !== 'function') {
          console.warn('Web Vitals module not loaded correctly')
          return
        }

        const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitalsModule

        const sendMetric = (metric: any) => {
          try {
            const webVitalsMetric: WebVitalsMetric = {
              ...metric,
              rating: getRating(metric.name, metric.value)
            }
            sendToAnalytics(webVitalsMetric)
          } catch (err) {
            console.error('Error processing web vitals metric:', err)
          }
        }

        // 모든 Core Web Vitals 메트릭 수집 with error handling
        try {
          getCLS && getCLS(sendMetric)
          getFID && getFID(sendMetric)
          getFCP && getFCP(sendMetric)
          getLCP && getLCP(sendMetric)
          getTTFB && getTTFB(sendMetric)
        } catch (metricsError) {
          console.error('Error initializing web vitals metrics:', metricsError)
        }

        // 커스텀 성능 메트릭 추가
        if (typeof performance !== 'undefined') {
          // 페이지 로드 시간
          window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            if (navigation) {
              const loadTime = navigation.loadEventEnd - navigation.navigationStart
              sendToAnalytics({
                name: 'TTFB' as any,
                value: loadTime,
                delta: loadTime,
                id: `load-${Date.now()}`,
                rating: getRating('TTFB', loadTime)
              })
            }
          })

          // 리소스 로딩 성능 모니터링
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'navigation') {
                const nav = entry as PerformanceNavigationTiming
                const domContentLoaded = nav.domContentLoadedEventEnd - nav.navigationStart

                if (domContentLoaded > 3000) {
                  console.warn(`⚠️ Slow DOM Content Loaded: ${Math.round(domContentLoaded)}ms`)
                }
              }
            }
          })

          observer.observe({ entryTypes: ['navigation'] })
        }

      } catch (error) {
        console.error('Failed to load web-vitals:', error)
      }
    }

    loadWebVitals()
  }, [])

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}

// 성능 메트릭을 서버로 전송하는 함수
export const reportWebVitals = async (metric: WebVitalsMetric) => {
  try {
    // 실제 환경에서는 analytics 서비스로 전송
    await fetch('/api/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    })
  } catch (error) {
    console.error('Failed to send web vitals:', error)
  }
}

// 실시간 성능 모니터링 훅
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
        }

        // 메모리 사용량이 80% 초과시 경고
        if (memoryUsage.used / memoryUsage.limit > 0.8) {
          console.warn(`🚨 High memory usage: ${memoryUsage.used}MB / ${memoryUsage.limit}MB`)
        }
      }
    }

    const intervalId = setInterval(monitorMemory, 30000) // 30초마다 체크
    return () => clearInterval(intervalId)
  }, [])
}