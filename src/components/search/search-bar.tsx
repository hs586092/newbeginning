'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  placeholder?: string
  className?: string
  totalPosts?: number
  showFilters?: boolean
}

const categories = [
  { value: 'all', label: '전체', icon: '📋' },
  { value: '신생아', label: '신생아 (0-100일)', icon: '👶' },
  { value: '영아', label: '영아 (100일-12개월)', icon: '🍼' },
  { value: '유아', label: '유아 (12개월+)', icon: '🧸' },
  { value: '임신', label: '임신/출산', icon: '🤱' },
  { value: '이유식', label: '이유식/수유', icon: '🥄' },
  { value: '건강', label: '건강/의료', icon: '🏥' },
  { value: '교육', label: '교육/발달', icon: '📚' },
  { value: '일상', label: '육아 일상', icon: '☀️' }
]

const ageGroups = [
  { value: 'all', label: '전체' },
  { value: '0-3m', label: '0-3개월' },
  { value: '3-6m', label: '3-6개월' },
  { value: '6-12m', label: '6-12개월' },
  { value: '12m+', label: '12개월+' },
  { value: 'pregnant', label: '임신 중' }
]

const sortOptions = [
  { value: 'recent', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'mostLiked', label: '좋아요 많은순' },
  { value: 'mostCommented', label: '댓글 많은순' }
]

export function SearchBar({
  placeholder = "육아 고민을 검색해보세요... (예: 밤잠, 이유식, 기저귀)",
  className = "",
  totalPosts = 0,
  showFilters = true
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // URL에서 필터 값 가져오기
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    ageGroup: searchParams.get('ageGroup') || 'all',
    sortBy: searchParams.get('sortBy') || 'recent'
  })

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set('q', query.trim())
    }
    if (filters.category !== 'all') {
      params.set('category', filters.category)
    }
    if (filters.ageGroup !== 'all') {
      params.set('ageGroup', filters.ageGroup)
    }
    if (filters.sortBy !== 'recent') {
      params.set('sortBy', filters.sortBy)
    }

    router.push(`?${params.toString()}`)
  }

  // 필터 변경시 자동 검색 (디바운스)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() || filters.category !== 'all' || filters.ageGroup !== 'all' || filters.sortBy !== 'recent') {
        handleSearch()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  const handleClear = () => {
    setQuery('')
    setFilters({
      category: 'all',
      ageGroup: 'all',
      sortBy: 'recent'
    })
    router.push('/')
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.ageGroup !== 'all') count++
    if (filters.sortBy !== 'recent') count++
    return count
  }, [filters])

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-4 ${className}`}>
      {/* 검색 입력 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 h-11"
            aria-label="게시글 검색"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-11 px-3 relative"
            aria-label="필터 옵션 열기/닫기"
            aria-expanded={isFilterOpen}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">필터</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        <Button type="submit" className="h-11 px-4" aria-label="검색 실행">
          <Search className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">검색</span>
        </Button>
      </form>

      {/* 검색 결과 정보 */}
      {totalPosts > 0 && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">{totalPosts.toLocaleString()}개</span>의 게시글이 있습니다
        </div>
      )}

      {/* 필터 패널 */}
      {showFilters && isFilterOpen && (
        <div className="border-t pt-4 space-y-4">
          {/* 카테고리 필터 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">카테고리</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleFilterChange('category', category.value)}
                  className={`p-2 text-xs rounded-md border transition-colors ${
                    filters.category === category.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-pressed={filters.category === category.value}
                >
                  <div className="text-base mb-1">{category.icon}</div>
                  <div className="truncate">{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 하단 필터 그룹 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 연령대 필터 */}
            <div>
              <label htmlFor="age-group-select" className="text-sm font-medium text-gray-700 mb-2 block">
                아기 연령대
              </label>
              <select
                id="age-group-select"
                value={filters.ageGroup}
                onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ageGroups.map(group => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 정렬 옵션 */}
            <div>
              <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 mb-2 block">
                정렬 방식
              </label>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 필터 액션 */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-1" />
              모두 지우기
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsFilterOpen(false)}
            >
              완료
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}