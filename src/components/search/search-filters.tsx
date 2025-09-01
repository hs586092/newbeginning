'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'job_offer', label: '구인' },
  { value: 'job_seek', label: '구직' },
  { value: 'community', label: '커뮤니티' }
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
  const hasActiveFilters = searchParams.has('category') || searchParams.has('location')

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

      <div className="space-y-4">
        {/* 카테고리 필터 */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            카테고리
          </Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => updateFilter('category', category.value)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  currentCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
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