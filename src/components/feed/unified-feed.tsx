/**
 * 통합 피드 컴포넌트
 * 로그인 상태와 무관하게 일관된 UI를 제공하면서 기능은 조건부로 활성화
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { PostInteractionsV3 } from '@/components/posts/post-interactions-v3'
import { GlobalCommentSystem } from '@/components/comments/global-comment-system'
import { GlobalLikeSystem } from '@/components/likes/global-like-system'
import { PostListSkeleton } from '@/components/ui/loading'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback, generateInitials } from '@/components/ui/avatar'
import { MoreVertical, Baby, Clock, Lock, Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface PostAuthor {
  id: string
  username: string
  avatar_url?: string
  baby_birth_date?: string
  baby_name?: string
  is_pregnant?: boolean
  pregnancy_week?: number
}

interface UnifiedPost {
  id: string
  content: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  baby_month?: number
  images?: string[]
  poll?: {
    question: string
    options: Array<{
      text: string
      votes: number
    }>
  }
  hugs: number
  views: number
  is_question: boolean
  tags?: string[]
  mood?: string
  created_at: string
  author: PostAuthor
  is_hugged_by_me: boolean
  is_bookmarked_by_me: boolean
  comments_count?: number
}

interface UnifiedFeedProps {
  posts: UnifiedPost[]
  isLoading?: boolean
  isAuthenticated?: boolean
  currentUserId?: string
  variant?: 'landing' | 'dashboard'
  selectedCategory?: string
  selectedBabyMonth?: number
  activeFilter?: string
  smartFilter?: string
  showSearch?: boolean
  showAdvancedFilters?: boolean
  onAuthRequired?: () => void
}

const CATEGORY_COLORS = {
  pregnancy: 'bg-violet-100 text-violet-700',
  newborn: 'bg-pink-100 text-pink-700',
  infant: 'bg-blue-100 text-blue-700',
  babyfood: 'bg-blue-100 text-blue-700',
  sleep: 'bg-violet-100 text-violet-700',
  health: 'bg-pink-100 text-pink-700',
  daily: 'bg-gray-100 text-gray-700',
  emergency: 'bg-pink-100 text-pink-700'
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diff = now.getTime() - postTime.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  return `${days}일 전`
}

export function UnifiedFeed({ 
  posts = [],
  isLoading = false,
  isAuthenticated = false,
  currentUserId,
  variant = 'landing',
  selectedCategory = 'all',
  selectedBabyMonth,
  activeFilter = 'all',
  smartFilter = 'latest',
  showSearch = false,
  showAdvancedFilters = false,
  onAuthRequired
}: UnifiedFeedProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 필터링된 게시물 계산
  const filteredPosts = useMemo(() => {
    let filtered = posts
    
    // 카테고리 필터
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id === selectedCategory)
    }
    
    // 월령 필터
    if (selectedBabyMonth !== undefined && selectedBabyMonth !== null) {
      filtered = filtered.filter(post => post.baby_month === selectedBabyMonth)
    }
    
    // 스마트 필터 적용 (정렬)
    if (smartFilter === 'latest') {
      filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (smartFilter === 'popular') {
      filtered = filtered.sort((a, b) => (b.hugs + b.views) - (a.hugs + a.views))
    } else if (smartFilter === 'discussed') {
      filtered = filtered.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
    }
    
    return filtered
  }, [posts, selectedCategory, selectedBabyMonth, smartFilter])
  
  // 인증 필요 액션 핸들러
  const handleAuthRequired = () => {
    if (onAuthRequired) {
      onAuthRequired()
    } else {
      // 기본 동작: 로그인 페이지로 이동
      window.location.href = '/login'
    }
  }
  
  if (!mounted) return null
  
  if (isLoading) {
    return <PostListSkeleton />
  }

  if (filteredPosts.length === 0) {
    return (
      <Card variant="default" className="text-center py-12">
        <Baby className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-600 mb-2">
          {selectedCategory !== 'all' ? '해당 카테고리에' : '아직'} 게시글이 없습니다
        </p>
        <p className="text-gray-500 text-sm mb-6">
          첫 번째 게시글을 작성해보세요!
        </p>
        {isAuthenticated ? (
          <Link href="/write">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700">
              글쓰기
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={handleAuthRequired}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            로그인하고 글쓰기
          </Button>
        )}
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <Card 
            key={post.id}
            variant="interactive"
            className="overflow-hidden"
            role="article"
          >
            {/* 게시글 헤더 */}
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  {/* 프로필 이미지 */}
                  <Avatar size="default" variant="colorful">
                    {post.author.avatar_url ? (
                      <AvatarImage 
                        src={post.author.avatar_url} 
                        alt={`${post.author.username} 프로필`}
                      />
                    ) : (
                      <AvatarFallback variant="colorful">
                        {generateInitials(post.author.username || '?')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {/* 작성자 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {post.author.username}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        CATEGORY_COLORS[post.category_id as keyof typeof CATEGORY_COLORS] || 'bg-gray-100 text-gray-700'
                      }`}>
                        <span className="mr-1">{post.category_icon}</span>
                        {post.category_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {post.author.is_pregnant && post.author.pregnancy_week && (
                        <span className="flex items-center">
                          <Baby className="w-3 h-3 mr-1" />
                          임신 {post.author.pregnancy_week}주
                        </span>
                      )}
                      {post.baby_month !== undefined && (
                        <span className="flex items-center">
                          <Baby className="w-3 h-3 mr-1" />
                          {post.baby_month}개월
                        </span>
                      )}
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 더보기 메뉴 (인증된 사용자만) */}
                {isAuthenticated && (
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              {/* 게시글 내용 */}
              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {/* 태그 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 이미지 갤러리 */}
              {post.images && post.images.length > 0 && (
                <div className={`mb-4 ${
                  post.images.length === 1 
                    ? 'aspect-video' 
                    : 'grid grid-cols-2 gap-2'
                }`}>
                  {post.images.map((image, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg bg-gray-100">
                      <Image 
                        src={image} 
                        alt={`게시글 이미지 ${index + 1}`}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* 투표 */}
              {post.poll && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    {post.poll.question}
                  </h4>
                  <div className="space-y-2">
                    {post.poll.options.map((option, index) => (
                      <button
                        key={index}
                        className="w-full p-3 text-left bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!isAuthenticated}
                        onClick={!isAuthenticated ? handleAuthRequired : undefined}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800">{option.text}</span>
                          <span className="text-sm text-blue-600 font-medium">
                            {option.votes}표
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      투표하려면 로그인이 필요합니다
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* 상호작용 버튼들 */}
            {isAuthenticated ? (
              <PostInteractionsV3
                postId={post.id}
                initialLiked={post.is_hugged_by_me}
                initialBookmarked={post.is_bookmarked_by_me}
                likesCount={post.hugs}
                commentsCount={post.comments_count || 0}
                viewsCount={post.views}
                isLoggedIn={true}
                currentUserId={currentUserId}
                variant="full"
                showLikesModal={true}
              />
            ) : (
              /* 비인증 사용자용 상호작용 표시 */
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={handleAuthRequired}
                    className="flex items-center space-x-2 text-gray-500 hover:text-pink-600 transition-colors"
                    title="로그인하고 좋아요 누르기"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.hugs}</span>
                  </button>
                  
                  <button 
                    onClick={handleAuthRequired}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="로그인하고 댓글 달기"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments_count || 0}</span>
                  </button>
                </div>
                
                <div className="text-xs text-gray-400">
                  조회 {post.views.toLocaleString()}
                </div>
                
                {/* 로그인 필요 안내 */}
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  <Lock className="w-3 h-3 inline mr-1" />
                  로그인 필요
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {/* 전역 시스템들 (인증된 사용자만) */}
      {isAuthenticated && (
        <>
          <GlobalCommentSystem currentUserId={currentUserId} />
          <GlobalLikeSystem currentUserId={currentUserId} />
        </>
      )}
    </>
  )
}

// 성능 최적화를 위한 메모이제이션
export default UnifiedFeed