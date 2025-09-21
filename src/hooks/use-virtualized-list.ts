/**
 * 가상화 리스트 훅
 * 대용량 데이터 리스트의 성능 최적화를 위한 가상화 구현
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '@/lib/utils/logger'

interface UseVirtualizedListOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  enabled?: boolean
}

interface VirtualizedItem {
  index: number
  top: number
  height: number
}

interface UseVirtualizedListReturn {
  virtualizedItems: VirtualizedItem[]
  totalHeight: number
  scrollOffset: number
  setScrollOffset: (offset: number) => void
}

export function useVirtualizedList<T>(
  items: T[],
  options: UseVirtualizedListOptions
): UseVirtualizedListReturn {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    enabled = true
  } = options

  const [scrollOffset, setScrollOffset] = useState(0)

  const virtualizedItems = useMemo(() => {
    if (!enabled || items.length === 0) {
      return items.map((_, index) => ({
        index,
        top: index * itemHeight,
        height: itemHeight
      }))
    }

    const startIndex = Math.floor(scrollOffset / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )

    const visibleStartIndex = Math.max(0, startIndex - overscan)
    const visibleEndIndex = Math.min(endIndex + overscan, items.length)

    logger.log('Virtualized list: Calculating visible items', {
      totalItems: items.length,
      startIndex,
      endIndex,
      visibleStartIndex,
      visibleEndIndex,
      scrollOffset,
      containerHeight
    })

    const virtualItems: VirtualizedItem[] = []
    for (let i = visibleStartIndex; i < visibleEndIndex; i++) {
      virtualItems.push({
        index: i,
        top: i * itemHeight,
        height: itemHeight
      })
    }

    return virtualItems
  }, [items.length, scrollOffset, itemHeight, containerHeight, overscan, enabled])

  const totalHeight = useMemo(() => {
    return items.length * itemHeight
  }, [items.length, itemHeight])

  const handleScroll = useCallback((offset: number) => {
    setScrollOffset(offset)
  }, [])

  return {
    virtualizedItems,
    totalHeight,
    scrollOffset,
    setScrollOffset: handleScroll
  }
}