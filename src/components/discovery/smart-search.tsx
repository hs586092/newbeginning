'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecommendationsService } from '@/lib/services/recommendations-service'
import { Profile, Post, GroupWithDetails } from '@/types/database.types'
import {
  Search,
  X,
  Users,
  FileText,
  Group,
  Clock,
  TrendingUp,
  Filter,
  MapPin,
  Calendar,
  Heart,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

interface SmartSearchProps {
  className?: string
  placeholder?: string
  onResultSelect?: (result: Profile | Post | GroupWithDetails, type: string) => void
}

export function SmartSearch({
  className = '',
  placeholder = '사용자, 게시글, 그룹 검색...',
  onResultSelect
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    posts: [] as Post[],
    users: [] as Profile[],
    groups: [] as GroupWithDetails[]
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load recent searches:', error)
      }
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults({ posts: [], users: [], groups: [] })
        setShowResults(false)
        return
      }

      setLoading(true)
      setShowResults(true)

      try {
        const searchResults = await RecommendationsService.smartSearch(searchQuery, {
          type: activeTab === 'all' ? 'all' : activeTab as 'posts' | 'users' | 'groups',
          limit: 15
        })

        setResults(searchResults)
      } catch (error) {
        console.error('검색 오류:', error)
        toast.error('검색에 실패했습니다')
      } finally {
        setLoading(false)
      }
    },
    [activeTab]
  )

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, debouncedSearch])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)

    // Save to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      const updated = [searchQuery, ...recentSearches.slice(0, 9)]
      setRecentSearches(updated)
      localStorage.setItem('recent-searches', JSON.stringify(updated))
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    setResults({ posts: [], users: [], groups: [] })
    setShowResults(false)
  }

  const handleResultClick = (result: Profile | Post | GroupWithDetails, type: string) => {
    onResultSelect?.(result, type)
    setShowResults(false)
  }

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
    debouncedSearch(recentQuery)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-searches')
  }

  const totalResults = results.posts.length + results.users.length + results.groups.length

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full pl-10 pr-10 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowResults(false)}
          />

          {/* Results Panel */}
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 shadow-lg">
            <CardContent className="p-0">
              {/* No query - show recent searches */}
              {!query.trim() && (
                <div className="p-4">
                  {recentSearches.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          최근 검색
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs"
                        >
                          전체 삭제
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((recent, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(recent)}
                            className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                          >
                            {recent}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">검색어를 입력해보세요</p>
                    </div>
                  )}
                </div>
              )}

              {/* Loading */}
              {query.trim() && loading && (
                <div className="p-4">
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-gray-200 rounded-lg mb-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {query.trim() && !loading && (
                <div>
                  {totalResults === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">검색 결과가 없습니다</p>
                      <p className="text-xs mt-1">다른 검색어를 시도해보세요</p>
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <div className="border-b px-4 pt-3">
                        <TabsList className="h-8">
                          <TabsTrigger value="all" className="text-xs">
                            전체 ({totalResults})
                          </TabsTrigger>
                          <TabsTrigger value="users" className="text-xs">
                            사용자 ({results.users.length})
                          </TabsTrigger>
                          <TabsTrigger value="posts" className="text-xs">
                            게시글 ({results.posts.length})
                          </TabsTrigger>
                          <TabsTrigger value="groups" className="text-xs">
                            그룹 ({results.groups.length})
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        <TabsContent value="all" className="mt-0">
                          <div className="p-2 space-y-1">
                            {/* Users */}
                            {results.users.slice(0, 3).map(user => (
                              <button
                                key={`user-${user.id}`}
                                onClick={() => handleResultClick(user, 'user')}
                                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                  {user.avatar_url ? (
                                    <Image
                                      src={user.avatar_url}
                                      alt={user.full_name || user.username}
                                      width={32}
                                      height={32}
                                      className="rounded-full object-cover"
                                    />
                                  ) : (
                                    <span>{(user.full_name || user.username).charAt(0)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {user.full_name || user.username}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {user.parenting_stage && `${user.parenting_stage} 단계`}
                                  </div>
                                </div>
                                <Users className="w-3 h-3 text-muted-foreground" />
                              </button>
                            ))}

                            {/* Posts */}
                            {results.posts.slice(0, 3).map(post => (
                              <button
                                key={`post-${post.id}`}
                                onClick={() => handleResultClick(post, 'post')}
                                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium line-clamp-1">
                                    {post.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {post.profiles?.full_name || post.profiles?.username}
                                  </div>
                                </div>
                                <FileText className="w-3 h-3 text-muted-foreground" />
                              </button>
                            ))}

                            {/* Groups */}
                            {results.groups.slice(0, 3).map(group => (
                              <button
                                key={`group-${group.id}`}
                                onClick={() => handleResultClick(group, 'group')}
                                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                                  <Group className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {group.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    멤버 {group.member_count}명
                                  </div>
                                </div>
                                <Group className="w-3 h-3 text-muted-foreground" />
                              </button>
                            ))}

                            {totalResults > 9 && (
                              <div className="text-center py-2">
                                <p className="text-xs text-muted-foreground">
                                  {totalResults - 9}개 결과 더보기
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="users" className="mt-0">
                          <div className="p-2 space-y-1">
                            {results.users.map(user => (
                              <button
                                key={user.id}
                                onClick={() => handleResultClick(user, 'user')}
                                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                                  {user.avatar_url ? (
                                    <Image
                                      src={user.avatar_url}
                                      alt={user.full_name || user.username}
                                      width={40}
                                      height={40}
                                      className="rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm">
                                      {(user.full_name || user.username).charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">
                                    {user.full_name || user.username}
                                  </div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {user.bio || '자기소개가 없습니다'}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {user.parenting_stage && (
                                      <Badge variant="outline" className="text-xs">
                                        {user.parenting_stage}
                                      </Badge>
                                    )}
                                    {user.location && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {user.location}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="posts" className="mt-0">
                          <div className="p-2 space-y-1">
                            {results.posts.map(post => (
                              <button
                                key={post.id}
                                onClick={() => handleResultClick(post, 'post')}
                                className="w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                    {post.profiles?.avatar_url ? (
                                      <Image
                                        src={post.profiles.avatar_url}
                                        alt={post.profiles.full_name || post.profiles.username}
                                        width={32}
                                        height={32}
                                        className="rounded-full object-cover"
                                      />
                                    ) : (
                                      <span>
                                        {(post.profiles?.full_name || post.profiles?.username || 'U').charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium line-clamp-2 mb-1">
                                      {post.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>
                                        {post.profiles?.full_name || post.profiles?.username}
                                      </span>
                                      <span>
                                        {formatDistanceToNow(new Date(post.created_at), {
                                          addSuffix: true,
                                          locale: ko
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="groups" className="mt-0">
                          <div className="p-2 space-y-1">
                            {results.groups.map(group => (
                              <button
                                key={group.id}
                                onClick={() => handleResultClick(group, 'group')}
                                className="w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                                    {group.cover_image ? (
                                      <Image
                                        src={group.cover_image}
                                        alt={group.name}
                                        width={40}
                                        height={40}
                                        className="rounded-lg object-cover"
                                      />
                                    ) : (
                                      <Group className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium mb-1">
                                      {group.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                      {group.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {group.member_count}명
                                      </div>
                                      {group.recent_activity > 0 && (
                                        <div className="flex items-center gap-1">
                                          <TrendingUp className="w-3 h-3" />
                                          최근 활동
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}