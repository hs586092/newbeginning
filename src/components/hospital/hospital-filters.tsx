'use client'

import { HospitalFilters as FiltersType } from './hospital-finder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

interface HospitalFiltersProps {
  filters: FiltersType
  onFilterChange: (filters: Partial<FiltersType>) => void
}

export function HospitalFilters({ filters, onFilterChange }: HospitalFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'all', label: '전체' },
    { value: '소아과', label: '소아과' },
    { value: '소아청소년과', label: '소아청소년과' }
  ]

  const sortOptions = [
    { value: 'distance', label: '가까운순' },
    { value: 'rating', label: '별점순' },
    { value: 'reviewCount', label: '리뷰많은순' }
  ]

  const featureOptions = [
    '야간진료',
    '주말진료',
    '공휴일진료',
    '주차가능',
    '예약가능',
    '영유아검진',
    '예방접종'
  ]

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature]
    onFilterChange({ features: newFeatures })
  }

  const clearFilters = () => {
    onFilterChange({
      category: 'all',
      isOpen: false,
      sortBy: 'distance',
      features: []
    })
  }

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.isOpen ||
    filters.sortBy !== 'distance' ||
    filters.features.length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-900 font-medium"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>필터</span>
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1">
              {filters.features.length + (filters.category !== 'all' ? 1 : 0) + (filters.isOpen ? 1 : 0)}
            </Badge>
          )}
        </button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            초기화
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => onFilterChange({ category: category.value })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.category === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange({ sortBy: option.value as any })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Open Now Filter */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isOpen}
                onChange={(e) => onFilterChange({ isOpen: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">현재 영업중만 보기</span>
            </label>
          </div>

          {/* Feature Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특징
            </label>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((feature) => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.features.includes(feature)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
