/**
 * 고급 검색 컴포넌트
 * 다중 필터, 카테고리, 날짜 범위 등 고급 검색 기능 제공
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Calendar, Tag, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/utils/logger'

interface SearchFilters {
  query: string
  categories: string[]
  tags: string[]
  dateRange: {
    from?: Date
    to?: Date
  } | null
  babyMonth?: number
  sortBy: 'relevance' | 'recent' | 'popular' | 'trending'
  postType: 'all' | 'question' | 'story' | 'tip'
  hasImages: boolean
  minLikes: number
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  className?: string
}

const CATEGORIES = [
  { id: 'pregnancy', name: '임신', icon: '🤰', color: 'bg-violet-100 text-violet-700' },
  { id: 'newborn', name: '신생아', icon: '👶', color: 'bg-pink-100 text-pink-700' },
  { id: 'development', name: '발달', icon: '🧠', color: 'bg-blue-100 text-blue-700' },
  { id: 'feeding', name: '수유', icon: '🍼', color: 'bg-green-100 text-green-700' },
  { id: 'sleep', name: '수면', icon: '😴', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'health', name: '건강', icon: '🏥', color: 'bg-red-100 text-red-700' },
  { id: 'play', name: '놀이', icon: '🎮', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'education', name: '교육', icon: '📚', color: 'bg-purple-100 text-purple-700' }
]

const BABY_MONTHS = [
  { value: 0, label: '0-3개월' },
  { value: 3, label: '3-6개월' },
  { value: 6, label: '6-9개월' },
  { value: 9, label: '9-12개월' },
  { value: 12, label: '12개월+' }
]

const POPULAR_TAGS = [
  '첫육아', '신생아', '모유수유', '분유', '이유식', '수면교육',
  '발달', '예방접종', '놀이', '교육', '건강', '안전', '병원',
  '임신', '출산', '산후조리', '육아용품', '가족여행'
]

export function AdvancedSearch({ onSearch, isLoading, className }: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get('q') || '',
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    dateRange: null,
    babyMonth: searchParams.get('babyMonth') ? parseInt(searchParams.get('babyMonth')!) : undefined,
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'relevance',
    postType: (searchParams.get('type') as SearchFilters['postType']) || 'all',
    hasImages: searchParams.get('images') === 'true',
    minLikes: parseInt(searchParams.get('minLikes') || '0')
  }))

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [customTag, setCustomTag] = useState('')

  // Update URL params when filters change
  const updateURL = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams()

    if (newFilters.query) params.set('q', newFilters.query)
    if (newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','))
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','))
    if (newFilters.babyMonth !== undefined) params.set('babyMonth', newFilters.babyMonth.toString())
    if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy)
    if (newFilters.postType !== 'all') params.set('type', newFilters.postType)
    if (newFilters.hasImages) params.set('images', 'true')
    if (newFilters.minLikes > 0) params.set('minLikes', newFilters.minLikes.toString())

    const url = params.toString() ? `?${params.toString()}` : ''
    router.replace(url, { scroll: false })
  }, [router])

  // Handle filter updates
  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    updateURL(newFilters)

    logger.log('Search filters updated', {
      updates,
      newFilters: {
        ...newFilters,
        activeFiltersCount: Object.values(newFilters).filter(v =>
          Array.isArray(v) ? v.length > 0 : v !== '' && v !== false && v !== 0 && v !== 'relevance' && v !== 'all'
        ).length
      }
    })
  }, [filters, updateURL])

  // Handle search execution
  const handleSearch = useCallback(() => {
    logger.time('advanced-search')
    onSearch(filters)
    logger.timeEnd('advanced-search')
  }, [filters, onSearch])

  // Handle category toggle
  const toggleCategory = useCallback((categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]

    updateFilters({ categories: newCategories })
  }, [filters.categories, updateFilters])

  // Handle tag management
  const addTag = useCallback((tag: string) => {
    if (!filters.tags.includes(tag) && tag.trim()) {
      updateFilters({ tags: [...filters.tags, tag.trim()] })
    }
  }, [filters.tags, updateFilters])

  const removeTag = useCallback((tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) })
  }, [filters.tags, updateFilters])

  const handleCustomTagAdd = useCallback(() => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }, [customTag, addTag])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      categories: [],
      tags: [],
      dateRange: null,
      babyMonth: undefined,
      sortBy: 'relevance',
      postType: 'all',
      hasImages: false,
      minLikes: 0
    }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
  }, [updateURL])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'query' || key === 'sortBy' || key === 'postType') return count
      if (Array.isArray(value)) return count + value.length
      if (key === 'hasImages') return count + (value ? 1 : 0)
      if (key === 'minLikes') return count + (value > 0 ? 1 : 0)
      if (key === 'babyMonth') return count + (value !== undefined ? 1 : 0)
      if (key === 'dateRange') return count + (value ? 1 : 0)
      return count
    }, 0)
  }, [filters])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" />
            고급 검색
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}개 필터 적용됨
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              필터
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="검색어를 입력하세요..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4"
          />
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">카테고리</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.categories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "text-xs h-8",
                      filters.categories.includes(category.id) ? category.color : ""
                    )}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">태그</h4>

              {/* Selected Tags */}
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Popular Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_TAGS.filter(tag => !filters.tags.includes(tag)).slice(0, 10).map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    onClick={() => addTag(tag)}
                    className="text-xs h-7 text-gray-500 hover:text-gray-700 border-dashed border"
                  >
                    +#{tag}
                  </Button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="직접 태그 추가"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomTagAdd()}
                  className="text-sm"
                />
                <Button onClick={handleCustomTagAdd} size="sm" disabled={!customTag.trim()}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Baby Month & Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baby Month */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">아기 개월 수</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.babyMonth === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ babyMonth: undefined })}
                    className="text-xs"
                  >
                    전체
                  </Button>
                  {BABY_MONTHS.map((month) => (
                    <Button
                      key={month.value}
                      variant={filters.babyMonth === month.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ babyMonth: month.value })}
                      className="text-xs"
                    >
                      {month.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">정렬</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'relevance', label: '관련도순' },
                    { value: 'recent', label: '최신순' },
                    { value: 'popular', label: '인기순' },
                    { value: 'trending', label: '트렌딩' }
                  ].map((sort) => (
                    <Button
                      key={sort.value}
                      variant={filters.sortBy === sort.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ sortBy: sort.value as SearchFilters['sortBy'] })}
                      className="text-xs"
                    >
                      {sort.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Post Type & Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Post Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">게시글 유형</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: '전체' },
                    { value: 'question', label: '질문' },
                    { value: 'story', label: '경험담' },
                    { value: 'tip', label: '팁' }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={filters.postType === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ postType: type.value as SearchFilters['postType'] })}
                      className="text-xs"
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">추가 옵션</h4>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasImages}
                    onChange={(e) => updateFilters({ hasImages: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">이미지 포함</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">최소 좋아요:</label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.minLikes}
                    onChange={(e) => updateFilters({ minLikes: parseInt(e.target.value) || 0 })}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            필터 초기화
          </Button>

          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            검색
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}