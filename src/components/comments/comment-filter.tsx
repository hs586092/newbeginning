'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Clock, TrendingUp, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CommentSortType = 'newest' | 'oldest' | 'most_liked' | 'most_replies'
export type CommentFilterType = 'all' | 'my_comments' | 'with_replies'

interface CommentFilterProps {
  sortBy: CommentSortType
  filterBy: CommentFilterType
  onSortChange: (sort: CommentSortType) => void
  onFilterChange: (filter: CommentFilterType) => void
  totalComments: number
  isLoggedIn: boolean
  className?: string
}

const sortOptions: { value: CommentSortType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'newest',
    label: '최신순',
    icon: <Clock className="w-4 h-4" />,
    desc: '최근 작성된 댓글부터'
  },
  {
    value: 'oldest',
    label: '등록순',
    icon: <Clock className="w-4 h-4 rotate-180" />,
    desc: '먼저 작성된 댓글부터'
  },
  {
    value: 'most_liked',
    label: '인기순',
    icon: <TrendingUp className="w-4 h-4" />,
    desc: '좋아요가 많은 댓글부터'
  },
  {
    value: 'most_replies',
    label: '답글많은순',
    icon: <MessageCircle className="w-4 h-4" />,
    desc: '답글이 많은 댓글부터'
  }
]

const filterOptions: { value: CommentFilterType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'all',
    label: '전체 댓글',
    icon: <MessageCircle className="w-4 h-4" />,
    desc: '모든 댓글 보기'
  },
  {
    value: 'my_comments',
    label: '내 댓글',
    icon: <User className="w-4 h-4" />,
    desc: '내가 작성한 댓글만'
  },
  {
    value: 'with_replies',
    label: '답글있는 댓글',
    icon: <MessageCircle className="w-4 h-4" />,
    desc: '답글이 달린 댓글만'
  }
]

export function CommentFilter({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
  totalComments,
  isLoggedIn,
  className
}: CommentFilterProps) {
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  const currentSort = sortOptions.find(option => option.value === sortBy)
  const currentFilter = filterOptions.find(option => option.value === filterBy)

  // 로그인 상태가 아니면 내 댓글 필터 제거
  const availableFilters = isLoggedIn ? filterOptions : filterOptions.filter(f => f.value !== 'my_comments')

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          댓글 {totalComments.toLocaleString()}개
        </span>
        {totalComments > 0 && (
          <span className="text-xs text-gray-500">
            • {currentFilter?.label} • {currentSort?.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* 필터 드롭다운 */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className="h-8 px-3 text-xs border-gray-300"
          >
            {currentFilter?.icon}
            <span className="ml-1 hidden sm:inline">{currentFilter?.label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          {showFilterOptions && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-1">
                {availableFilters.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(option.value)
                      setShowFilterOptions(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md transition-colors',
                      filterBy === option.value
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {option.icon}
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                    {filterBy === option.value && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="h-8 px-3 text-xs border-gray-300"
          >
            {currentSort?.icon}
            <span className="ml-1 hidden sm:inline">{currentSort?.label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          {showSortOptions && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setShowSortOptions(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md transition-colors',
                      sortBy === option.value
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {option.icon}
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                    {sortBy === option.value && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 외부 클릭 감지를 위한 오버레이 */}
      {(showSortOptions || showFilterOptions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSortOptions(false)
            setShowFilterOptions(false)
          }}
        />
      )}
    </div>
  )
}