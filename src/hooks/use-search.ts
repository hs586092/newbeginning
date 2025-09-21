/**
 * 검색 훅
 * 고급 검색 기능과 결과 관리
 */

'use client'

import { useCallback, useState, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
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

interface SearchResult {
  id: string
  content: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  baby_month?: number
  images?: string[]
  hugs: number
  views: number
  is_question: boolean
  tags?: string[]
  mood?: string
  created_at: string
  updated_at: string
  author: {
    id: string
    username: string
    avatar_url?: string
    baby_birth_date?: string
    baby_name?: string
    is_pregnant?: boolean
    pregnancy_week?: number
  }
  comments_count: number
  likes_count: number
  relevance_score?: number
}

interface SearchResponse {
  results: SearchResult[]
  hasMore: boolean
  nextCursor?: string
  totalCount: number
}

const POSTS_PER_PAGE = 10

export function useSearch(initialFilters: SearchFilters) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const supabase = createClient()

  // Build search query
  const buildSearchQuery = useCallback((filters: SearchFilters, pageParam = 0) => {
    logger.log('Building search query', { filters, pageParam })

    let query = supabase
      .from('posts')
      .select(`
        id,
        content,
        category_id,
        baby_month,
        images,
        hugs,
        views,
        is_question,
        tags,
        mood,
        created_at,
        updated_at,
        profiles!posts_author_id_fkey (
          id,
          username,
          avatar_url,
          baby_birth_date,
          baby_name,
          is_pregnant,
          pregnancy_week
        ),
        post_categories!posts_category_id_fkey (
          name,
          icon,
          color
        )
      `)
      .eq('published', true)

    // Text search
    if (filters.query.trim()) {
      query = query.textSearch('search_vector', filters.query.trim())
    }

    // Category filter
    if (filters.categories.length > 0) {
      query = query.in('category_id', filters.categories)
    }

    // Baby month filter
    if (filters.babyMonth !== undefined) {
      const minMonth = filters.babyMonth
      const maxMonth = filters.babyMonth === 12 ? 60 : filters.babyMonth + 3
      query = query.gte('baby_month', minMonth).lt('baby_month', maxMonth)
    }

    // Post type filter
    if (filters.postType !== 'all') {
      switch (filters.postType) {
        case 'question':
          query = query.eq('is_question', true)
          break
        case 'story':
          query = query.eq('is_question', false).not('mood', 'is', null)
          break
        case 'tip':
          query = query.contains('tags', ['팁'])
          break
      }
    }

    // Has images filter
    if (filters.hasImages) {
      query = query.not('images', 'is', null)
    }

    // Min likes filter
    if (filters.minLikes > 0) {
      query = query.gte('hugs', filters.minLikes)
    }

    // Date range filter
    if (filters.dateRange?.from) {
      query = query.gte('created_at', filters.dateRange.from.toISOString())
    }
    if (filters.dateRange?.to) {
      query = query.lte('created_at', filters.dateRange.to.toISOString())
    }

    // Tag filter (using array contains)
    if (filters.tags.length > 0) {
      // For Supabase, we need to check if any of the selected tags exist in the tags array
      filters.tags.forEach(tag => {
        query = query.contains('tags', [tag])
      })
    }

    // Sorting
    switch (filters.sortBy) {
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'popular':
        query = query.order('hugs', { ascending: false })
        break
      case 'trending':
        // Custom trending logic: recent posts with high engagement
        query = query
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('hugs', { ascending: false })
        break
      case 'relevance':
      default:
        if (filters.query.trim()) {
          // For text search, let Supabase handle relevance ranking
          query = query.order('created_at', { ascending: false })
        } else {
          query = query.order('created_at', { ascending: false })
        }
        break
    }

    // Pagination
    query = query.range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1)

    return query
  }, [supabase])

  // Search function
  const searchPosts = useCallback(async ({ pageParam = 0 }): Promise<SearchResponse> => {
    logger.time(`search-posts-page-${pageParam}`)

    try {
      const query = buildSearchQuery(filters, pageParam)
      const { data, error, count } = await query

      if (error) {
        logger.error('Search failed', error, { filters, pageParam })
        throw error
      }

      // Transform data
      const results: SearchResult[] = (data || []).map(post => ({
        ...post,
        author: post.profiles as any,
        category_name: post.post_categories?.name || 'General',
        category_icon: post.post_categories?.icon || '📝',
        category_color: post.post_categories?.color || '#6B7280',
        comments_count: 0, // TODO: Add real count
        likes_count: post.hugs || 0,
        relevance_score: filters.query.trim() ? Math.random() : undefined // TODO: Real relevance
      }))

      const hasMore = data ? data.length === POSTS_PER_PAGE : false

      logger.log('Search completed successfully', {
        pageParam,
        count: results.length,
        hasMore,
        filters: {
          query: filters.query,
          categories: filters.categories,
          tags: filters.tags,
          sortBy: filters.sortBy
        }
      })

      return {
        results,
        hasMore,
        nextCursor: hasMore ? String(pageParam + 1) : undefined,
        totalCount: count || 0
      }
    } finally {
      logger.timeEnd(`search-posts-page-${pageParam}`)
    }
  }, [buildSearchQuery, filters])

  // React Query infinite search
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['search', filters],
    queryFn: searchPosts,
    getNextPageParam: (lastPage) => lastPage.nextCursor ? parseInt(lastPage.nextCursor) : undefined,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 2, // 2 minutes (shorter for search)
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: filters.query.trim().length > 0 || filters.categories.length > 0 || filters.tags.length > 0,
  })

  // Flattened results
  const results = useMemo(() => {
    return data?.pages.flatMap(page => page.results) || []
  }, [data?.pages])

  // Total count
  const totalCount = useMemo(() => {
    return data?.pages[0]?.totalCount || 0
  }, [data?.pages])

  // Update filters
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters)

    // Add to search history
    if (newFilters.query.trim() && !searchHistory.includes(newFilters.query.trim())) {
      setSearchHistory(prev => [newFilters.query.trim(), ...prev.slice(0, 9)]) // Keep last 10
    }
  }, [searchHistory])

  // Clear search
  const clearSearch = useCallback(() => {
    setFilters({
      query: '',
      categories: [],
      tags: [],
      dateRange: null,
      babyMonth: undefined,
      sortBy: 'relevance',
      postType: 'all',
      hasImages: false,
      minLikes: 0
    })
  }, [])

  // Search suggestions based on history and popular terms
  const searchSuggestions = useMemo(() => {
    const popular = ['신생아', '수유', '수면교육', '이유식', '발달', '예방접종']
    return [...searchHistory, ...popular.filter(term => !searchHistory.includes(term))].slice(0, 8)
  }, [searchHistory])

  return {
    // Data
    results,
    totalCount,
    searchSuggestions,

    // State
    filters,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,

    // Actions
    updateFilters,
    fetchNextPage,
    refetch,
    clearSearch
  }
}