'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface HorizontalCategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  compact?: boolean
}

const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: '전체',
    icon: '🏠',
    color: 'gray',
    description: '모든 카테고리의 게시글'
  },
  {
    id: 'pregnancy',
    name: '임신',
    icon: '🤰',
    color: 'purple',
    description: '임신 관련 경험과 정보'
  },
  {
    id: 'newborn',
    name: '신생아',
    icon: '👶',
    color: 'pink',
    description: '0-3개월 신생아 돌봄'
  },
  {
    id: 'infant',
    name: '영아',
    icon: '🍼',
    color: 'blue',
    description: '4-12개월 영아 돌봄'
  },
  {
    id: 'babyfood',
    name: '이유식',
    icon: '🥄',
    color: 'green',
    description: '이유식 레시피와 노하우'
  },
  {
    id: 'sleep',
    name: '수면',
    icon: '😴',
    color: 'indigo',
    description: '수면 패턴과 수면 교육'
  },
  {
    id: 'health',
    name: '건강',
    icon: '🏥',
    color: 'red',
    description: '아기 건강과 병원 정보'
  },
  {
    id: 'daily',
    name: '일상',
    icon: '💬',
    color: 'yellow',
    description: '육아 일상과 소소한 이야기'
  },
  {
    id: 'emergency',
    name: '응급',
    icon: '🚨',
    color: 'red',
    description: '응급상황 대처와 안전'
  }
]

const getCategoryColorClasses = (color: string, isSelected: boolean, compact = false) => {
  const colors = {
    gray: isSelected ? 'bg-gray-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50',
    purple: isSelected ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-purple-700 hover:bg-purple-50',
    pink: isSelected ? 'bg-pink-600 text-white shadow-lg' : 'bg-white text-pink-700 hover:bg-pink-50',
    blue: isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-700 hover:bg-blue-50',
    green: isSelected ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-green-700 hover:bg-green-50',
    indigo: isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-700 hover:bg-indigo-50',
    red: isSelected ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-red-700 hover:bg-red-50',
    yellow: isSelected ? 'bg-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 hover:bg-yellow-50'
  }
  return colors[color as keyof typeof colors] || colors.gray
}

export default function HorizontalCategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  compact = false 
}: HorizontalCategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

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

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`relative ${compact ? 'bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100' : 'bg-white rounded-xl p-6 shadow-sm border border-gray-100'}`}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">카테고리</h3>
          <div className="text-sm text-gray-500">
            {selectedCategory === 'all' ? '전체' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </div>
        </div>
      )}

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

        {/* Categories */}
        <div
          ref={scrollRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
          onScroll={checkScroll}
        >
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 border border-gray-200 ${
                getCategoryColorClasses(category.color, selectedCategory === category.id, compact)
              } ${compact ? 'text-sm' : ''}`}
              title={category.description}
            >
              <span className={compact ? 'text-lg' : 'text-xl'}>{category.icon}</span>
              <span className="font-medium whitespace-nowrap">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Category Description (only for non-compact) */}
      {!compact && selectedCategory !== 'all' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {CATEGORIES.find(c => c.id === selectedCategory)?.description}
          </p>
        </div>
      )}

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