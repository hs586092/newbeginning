'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
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

const getCategoryColorClasses = (color: string, isSelected: boolean) => {
  const colors = {
    gray: isSelected ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    purple: isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    pink: isSelected ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    blue: isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
    indigo: isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    red: isSelected ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200',
    yellow: isSelected ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  }
  return colors[color as keyof typeof colors] || colors.gray
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false)
  
  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, 6)
  const hasMore = CATEGORIES.length > 6

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">카테고리</h2>
        <div className="text-sm text-gray-500">
          {selectedCategory === 'all' ? '전체' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {visibleCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`p-4 rounded-lg transition-all duration-200 text-center group ${
              getCategoryColorClasses(category.color, selectedCategory === category.id)
            }`}
            title={category.description}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <div className="text-sm font-medium">{category.name}</div>
          </button>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            {showAll ? '접기' : '더보기'}
          </button>
        </div>
      )}

      {selectedCategory !== 'all' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {CATEGORIES.find(c => c.id === selectedCategory)?.description}
          </p>
        </div>
      )}
    </div>
  )
}