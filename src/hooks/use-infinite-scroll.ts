/**
 * 무한 스크롤 훅
 * Intersection Observer API를 사용한 성능 최적화된 무한 스크롤
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/utils/logger'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

interface UseInfiniteScrollReturn {
  loadMoreRef: React.RefObject<HTMLDivElement>
  isNearEnd: boolean
}

export function useInfiniteScroll(
  fetchNextPage: () => void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 1.0,
    rootMargin = '100px',
    enabled = true,
    hasNextPage = true,
    isFetchingNextPage = false
  } = options

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isNearEnd, setIsNearEnd] = useState(false)

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target?.isIntersecting) {
      setIsNearEnd(true)
      logger.log('Infinite scroll: Near end detected', {
        intersectionRatio: target.intersectionRatio,
        hasNextPage,
        isFetchingNextPage
      })

      if (enabled && hasNextPage && !isFetchingNextPage) {
        logger.time('fetch-next-page')
        fetchNextPage()
        logger.timeEnd('fetch-next-page')
      }
    } else {
      setIsNearEnd(false)
    }
  }, [enabled, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin
    })

    observer.observe(element)
    logger.log('Infinite scroll: Observer initialized', { threshold, rootMargin })

    return () => {
      observer.disconnect()
      logger.log('Infinite scroll: Observer disconnected')
    }
  }, [handleIntersect, threshold, rootMargin])

  return {
    loadMoreRef,
    isNearEnd
  }
}