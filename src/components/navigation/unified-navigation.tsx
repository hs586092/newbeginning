/**
 * 통합 네비게이션 컴포넌트
 * 로그인 상태에 따라 기능 수준을 조정하지만 UI는 동일하게 유지
 */

'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Baby, Heart, MessageCircle, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { CommunityCategory } from '@/types/navigation'

interface UnifiedNavigationProps {
  isAuthenticated?: boolean
  activeTab?: string
  activeCategory?: string
  activeFilter?: string
  searchQuery?: string
  showSearch?: boolean
  showAdvancedFilters?: boolean
  resultCount?: number
  onTabChange?: (tab: string, category?: CommunityCategory) => void
  onCategoryChange?: (category: string) => void
  onFilterChange?: (filter: string) => void
  onSearchChange?: (query: string) => void
  onAuthRequired?: () => void
}

const COMMUNITY_TABS = [
  { 
    id: 'all', 
    name: '전체', 
    icon: '🌟', 
    description: '모든 게시글', 
    category: 'all' as CommunityCategory 
  },
  { 
    id: 'pregnancy', 
    name: '임신', 
    icon: '🤰', 
    description: '임신 관련 이야기', 
    category: 'pregnancy' as CommunityCategory 
  },
  { 
    id: 'newborn', 
    name: '신생아', 
    icon: '👶', 
    description: '0-3개월 아기', 
    category: 'newborn' as CommunityCategory 
  },
  { 
    id: 'infant', 
    name: '영아', 
    icon: '🍼', 
    description: '4-12개월 아기', 
    category: 'infant' as CommunityCategory 
  },
  { 
    id: 'babyfood', 
    name: '이유식', 
    icon: '🥄', 
    description: '이유식과 영양', 
    category: 'babyfood' as CommunityCategory 
  },
  { 
    id: 'health', 
    name: '건강', 
    icon: '🏥', 
    description: '건강과 의료 정보', 
    category: 'health' as CommunityCategory 
  }
]

const SMART_FILTERS = [
  { id: 'latest', name: '최신순', icon: '🔥' },
  { id: 'popular', name: '인기순', icon: '👍' },
  { id: 'discussed', name: '댓글많은순', icon: '💬' }
]

const BABY_MONTHS = [
  { id: 'all', name: '전체' },
  { id: '0', name: '신생아 (0개월)' },
  { id: '1', name: '1개월' },
  { id: '3', name: '3개월' },
  { id: '6', name: '6개월' },
  { id: '12', name: '12개월' }
]

export function UnifiedNavigation({
  isAuthenticated = false,
  activeTab = 'all',
  activeCategory = 'all',
  activeFilter = 'latest',
  searchQuery = '',
  showSearch = false,
  showAdvancedFilters = false,
  resultCount = 0,
  onTabChange,
  onCategoryChange,
  onFilterChange,
  onSearchChange,
  onAuthRequired
}: UnifiedNavigationProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(showSearch)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleAuthRequired = () => {
    if (onAuthRequired) {
      onAuthRequired()
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 메인 탭 네비게이션 */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {COMMUNITY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id, tab.category)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                title={tab.description}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {/* 검색 토글 */}
            {(isAuthenticated || showSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}

            {/* 필터 토글 */}
            {(isAuthenticated || showAdvancedFilters) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Filter className="w-4 h-4" />
                {isFiltersOpen && <Badge variant="secondary" className="ml-1">ON</Badge>}
              </Button>
            )}
          </div>
        </div>

        {/* 검색바 */}
        {isSearchOpen && (
          <div className="pb-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="게시글 검색..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200"
                  />
                </div>
                {resultCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {resultCount}개
                  </Badge>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-2">
                  검색 기능을 사용하려면 로그인이 필요합니다
                </p>
                <Button onClick={handleAuthRequired} size="sm">
                  로그인하기
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 고급 필터 */}
        {isFiltersOpen && (
          <div className="pb-4 border-t border-gray-100 pt-4">
            {isAuthenticated || showAdvancedFilters ? (
              <div className="space-y-4">
                {/* 스마트 필터 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">정렬</h4>
                  <div className="flex flex-wrap gap-2">
                    {SMART_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => onFilterChange?.(filter.id)}
                        className={`
                          flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${activeFilter === filter.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        <span>{filter.icon}</span>
                        <span>{filter.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 월령 필터 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">월령</h4>
                  <div className="flex flex-wrap gap-2">
                    {BABY_MONTHS.map((month) => (
                      <button
                        key={month.id}
                        onClick={() => onCategoryChange?.(month.id)}
                        className={`
                          flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${activeCategory === month.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        <Baby className="w-3 h-3" />
                        <span>{month.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-2">
                  고급 필터를 사용하려면 로그인이 필요합니다
                </p>
                <Button onClick={handleAuthRequired} size="sm">
                  로그인하기
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 빠른 액션 바 (인증된 사용자만) */}
        {isAuthenticated && (
          <div className="pb-4">
            <div className="flex items-center space-x-4 text-sm">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-pink-600 transition-colors">
                <Heart className="w-4 h-4" />
                <span>내가 좋아요한 글</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>내가 댓글단 글</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>북마크한 글</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default UnifiedNavigation