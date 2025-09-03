'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAVIGATION_ITEMS, type NavigationItem, type CommunityCategory } from '@/types/navigation'

interface FeedTabNavigationProps {
  activeTab: string
  onTabChange: (tab: string, category?: CommunityCategory) => void
  className?: string
}

const getCategoryColorClasses = (item: NavigationItem, isActive: boolean) => {
  if (item.color === 'danger') {
    return isActive 
      ? 'bg-red-600 text-white shadow-lg' 
      : 'bg-white text-red-600 hover:bg-red-50 border-red-200'
  }
  
  if (item.color === 'featured') {
    return isActive 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
      : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border-blue-200 shadow-sm'
  }
  
  return isActive
    ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
}

export default function FeedTabNavigation({ 
  activeTab, 
  onTabChange, 
  className = '' 
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
    if (item.id === 'community') {
      // 커뮤니티는 피드 필터링
      onTabChange(item.id, 'all')
    } else if (item.category) {
      // 다른 카테고리들은 피드 필터링
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
    <div className={`relative bg-white/80 backdrop-blur-sm border-b border-gray-200 ${className}`}>
      {/* Tab Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            카테고리별 정보
          </h2>
          <div className="text-sm text-gray-500">
            {NAVIGATION_ITEMS.find(item => item.id === activeTab)?.name || '전체'}
          </div>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Navigation Tabs */}
          <div
            ref={scrollRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
            onScroll={checkScroll}
          >
            {/* 전체 탭 */}
            <button
              onClick={() => onTabChange('all', 'all')}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 border ${
                activeTab === 'all'
                  ? 'bg-gray-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <span className="text-xl">🏠</span>
              <span className="font-medium whitespace-nowrap">전체</span>
            </button>

            {/* 카테고리 탭들 */}
            {NAVIGATION_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 border ${
                  getCategoryColorClasses(item, activeTab === item.id)
                }`}
                title={item.description}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Category Description */}
        {activeTab !== 'all' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {NAVIGATION_ITEMS.find(item => item.id === activeTab)?.description || '다양한 정보를 확인하세요'}
            </p>
          </div>
        )}
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