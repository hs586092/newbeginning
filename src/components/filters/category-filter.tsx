'use client'

import { useState } from 'react'

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
  resultCount?: number
  isLoading?: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const categories: Category[] = [
  {
    id: 'all',
    name: '전체',
    icon: '🌟',
    description: '모든 카테고리',
    color: 'bg-gradient-to-r from-pink-500 to-purple-500'
  },
  {
    id: 'pregnant',
    name: '예비맘',
    icon: '🤰',
    description: '임신 준비, 태교, 출산 정보',
    color: 'bg-gradient-to-r from-purple-400 to-pink-400'
  },
  {
    id: 'newborn',
    name: '신생아맘',
    icon: '👶',
    description: '0~12개월 육아 정보',
    color: 'bg-gradient-to-r from-pink-400 to-rose-400'
  },
  {
    id: 'toddler',
    name: '성장기맘',
    icon: '🧒',
    description: '1~7세 성장 가이드',
    color: 'bg-gradient-to-r from-blue-400 to-cyan-400'
  },
  {
    id: 'expert',
    name: '선배맘',
    icon: '👩‍👧‍👦',
    description: '육아 경험 공유, 조언',
    color: 'bg-gradient-to-r from-green-400 to-emerald-400'
  }
]

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  resultCount,
  isLoading = false
}: CategoryFilterProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    if (isLoading || categoryId === activeCategory) return
    onCategoryChange(categoryId)
  }

  return (
    <div className="w-full">
      {/* 간소화된 카테고리 헤더 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-gray-600 text-sm font-medium mb-3">
          <span>🔍</span>
          <span>세부 필터</span>
        </div>
      </div>

      {/* 컴팩트한 카테고리 버튼 그리드 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          const isHovered = hoveredCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              disabled={isLoading}
              className={`
                relative group p-3 rounded-lg transition-all duration-200
                min-h-[64px] touch-manipulation
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-100'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${!isActive ? 'bg-white border border-gray-200 hover:border-gray-300' : ''}
              `}
            >
              {/* 활성 상태 배경 그라데이션 */}
              {isActive && (
                <div className={`absolute inset-0 ${category.color} opacity-10 rounded-xl`} />
              )}
              
              {/* 로딩 스피너 */}
              {isLoading && isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl">
                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* 컴팩트한 레이아웃 */}
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`text-xl mb-1 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {category.icon}
                </div>
                <div className={`
                  font-medium text-xs text-center
                  ${isActive ? 'text-white' : 'text-gray-700'}
                `}>
                  {category.name}
                </div>
              </div>

              {/* 카테고리 설명 (호버 시 표시) */}
              {(isHovered || isActive) && !isLoading && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-90 z-10">
                  {category.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}

              {/* 활성 인디케이터 */}
              {isActive && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 결과 카운트 및 상태 표시 */}
      {resultCount !== undefined && (
        <div className="mt-6 text-center">
          <div className={`
            inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${resultCount > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            <span className="text-base">
              {resultCount > 0 ? '📊' : '🔍'}
            </span>
            <span>
              {isLoading ? (
                '검색 중...'
              ) : resultCount > 0 ? (
                `${resultCount}개의 콘텐츠를 찾았습니다`
              ) : (
                '해당 카테고리의 콘텐츠가 없습니다'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// 카테고리 정보 유틸리티 함수들
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id)
}

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id)
  return category ? category.name : '전체'
}

export const getAllCategories = (): Category[] => {
  return categories
}