'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, X, TrendingUp, Clock, MessageCircle, Star } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'all', label: '전체', icon: '🏠' },
  { value: 'expecting', label: '예비맘', icon: '🤰', description: '임신~출산' },
  { value: 'newborn', label: '신생아맘', icon: '👶', description: '0-6개월' },
  { value: 'toddler', label: '성장기맘', icon: '🧒', description: '7개월-5세' },
  { value: 'expert', label: '선배맘', icon: '👩‍👧‍👦', description: '경험공유' }
]

const SORT_FILTERS = [
  { value: 'latest', label: '최신글', icon: Clock, color: 'text-blue-600' },
  { value: 'popular', label: '인기글', icon: TrendingUp, color: 'text-red-600' },
  { value: 'comments', label: '댓글많은글', icon: MessageCircle, color: 'text-green-600' },
  { value: 'expert', label: '전문가글', icon: Star, color: 'text-yellow-600' }
]

const COMMON_LOCATIONS = [
  '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [location, setLocation] = useState(searchParams.get('location') || '')

  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'latest'
  const hasActiveFilters = searchParams.has('category') || searchParams.has('location') || searchParams.has('sort')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    router.push(`?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('location')
    params.delete('sort')
    setLocation('')
    router.push(`?${params.toString()}`)
  }

  const applyLocationFilter = () => {
    updateFilter('location', location)
    setIsOpen(false)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">필터</span>
          {hasActiveFilters && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              적용됨
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            전체 해제
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* 정렬 필터 */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            정렬
          </Label>
          <div className="flex flex-wrap gap-2">
            {SORT_FILTERS.map((sort) => {
              const IconComponent = sort.icon
              return (
                <button
                  key={sort.value}
                  onClick={() => updateFilter('sort', sort.value)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                    currentSort === sort.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${
                    currentSort === sort.value ? 'text-white' : sort.color
                  }`} />
                  <span>{sort.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            카테고리
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => updateFilter('category', category.value)}
                className={`p-3 rounded-lg text-center transition-all duration-200 ${
                  currentCategory === category.value
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="font-semibold text-sm">{category.label}</div>
                {category.description && (
                  <div className={`text-xs mt-1 ${
                    currentCategory === category.value ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {category.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 지역 필터 */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            지역
          </Label>
          
          {!isOpen ? (
            <div className="space-y-2">
              {searchParams.get('location') && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-blue-700">
                    {searchParams.get('location')}
                  </span>
                  <button
                    onClick={() => updateFilter('location', '')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="w-full justify-start"
              >
                {searchParams.get('location') ? '지역 변경' : '지역 선택'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="지역명 입력..."
                className="text-sm"
              />
              
              <div className="grid grid-cols-3 gap-2">
                {COMMON_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-left"
                  >
                    {loc}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={applyLocationFilter}
                  className="flex-1"
                >
                  적용
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    setLocation(searchParams.get('location') || '')
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}