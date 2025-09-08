'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAVIGATION_ITEMS, type NavigationItem, type CommunityCategory } from '@/types/navigation'

interface FeedTabNavigationProps {
  activeTab: string
  onTabChange: (tab: string, category?: CommunityCategory) => void
  className?: string
  onSmartFilterChange?: (filter: string) => void
  activeSmartFilter?: string
}

const SMART_FILTERS = [
  { value: 'latest', label: '최신글', icon: '⏰', color: 'text-blue-600' },
  { value: 'popular', label: '인기글', icon: '🔥', color: 'text-red-600' },
  { value: 'comments', label: '댓글많은글', icon: '💬', color: 'text-green-600' },
  { value: 'expert', label: '전문가글', icon: '⭐', color: 'text-yellow-600' }
]

const getCategoryColorClasses = (item: NavigationItem, isActive: boolean) => {
  if (item.color === 'danger') {
    return isActive 
      ? 'bg-red-600 text-white shadow-lg' 
      : 'bg-white text-red-600 hover:bg-red-50 border-red-200'
  }
  
  if (item.color === 'featured') {
    return isActive 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
  }
  
  return isActive
    ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
}

export default function FeedTabNavigation({ 
  activeTab, 
  onTabChange, 
  className = '',
  onSmartFilterChange,
  activeSmartFilter = 'latest'
}: FeedTabNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const router = useRouter()

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const handleTabClick = (item: NavigationItem) => {
    if (item.category) {
      // 카테고리들은 피드 필터링
      onTabChange(item.id, item.category as CommunityCategory)
    } else {
      // 전용 페이지로 이동
      router.push(item.href)
    }
  }

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`relative bg-white/90 backdrop-blur-sm border-b border-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">

        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-gray-600" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </button>
          )}

          {/* Navigation Tabs */}
          <div
            ref={scrollRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide"
            onScroll={checkScroll}
          >
            {/* 전체 탭 */}
            <button
              onClick={() => onTabChange('all', 'all')}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 border text-sm ${
                activeTab === 'all'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <span className="text-sm">🏠</span>
              <span className="font-medium whitespace-nowrap">전체</span>
            </button>

            {/* 카테고리 탭들 */}
            {NAVIGATION_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 border text-sm ${
                  getCategoryColorClasses(item, activeTab === item.id)
                }`}
                title={item.description}
              >
                <span className="text-sm">{item.emoji}</span>
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              </button>
            ))}

            {/* 스마트 필터 구분선 및 필터들 */}
            {onSmartFilterChange && (
              <>
                <div className="flex-shrink-0 w-px h-8 bg-gray-300 mx-2"></div>
                
                {SMART_FILTERS.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => onSmartFilterChange(filter.value)}
                    className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 border text-sm ${
                      activeSmartFilter === filter.value
                        ? 'bg-blue-600 text-white shadow-md border-blue-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                    }`}
                    title={`${filter.label} 순으로 정렬`}
                  >
                    <span className={`text-sm ${activeSmartFilter === filter.value ? 'text-white' : filter.color}`}>
                      {filter.icon}
                    </span>
                    <span className="font-medium whitespace-nowrap">{filter.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}