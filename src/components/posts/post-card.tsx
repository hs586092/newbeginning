'use client'

import { useState, useOptimistic, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { formatDate, getCategoryLabel, getCategoryColor, truncateText, isEducationalContent, getCategoryIcon, formatReadTime, getTargetAudienceLabel } from '@/lib/utils'
import { toggleLike, deletePost } from '@/lib/posts/actions'
import { CommentForm } from '@/components/comments/comment-form'
import { CommentList } from '@/components/comments/comment-list'
import { Button } from '@/components/ui/button'
import type { PostWithDetails, CommentWithProfile } from '@/types/database.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: PostWithDetails
  currentUserId?: string
  isOwner?: boolean
  onDelete?: (postId: string) => void
}

export function PostCard({ post, currentUserId, isOwner, onDelete }: PostCardProps) {
  console.log('🚀 PostCard 컴포넌트 렌더링 시작! Post ID:', post.id, 'Title:', post.title.substring(0, 30))
  
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  
  console.log('🚀 PostCard 상태:', { 
    showComments, 
    commentsCount: comments.length, 
    isLoadingComments, 
    postId: post.id 
  })
  
  const isEducational = isEducationalContent(post.category)
  const metadata = post.educational_metadata
  
  const initialLiked = currentUserId ? 
    post.likes?.some(like => like.id === currentUserId) || false : 
    false
  
  const [optimisticLike, toggleOptimisticLike] = useOptimistic(
    { liked: initialLiked, count: post.likes?.length || 0 },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1
    })
  )

  const handleLike = async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    toggleOptimisticLike(null)
    
    const result = await toggleLike(post.id)
    if (result?.error) {
      toggleOptimisticLike(null) // Revert optimistic update
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    setIsDeleting(true)
    
    // Optimistic update - 즉시 UI에서 제거
    if (onDelete) {
      onDelete(post.id)
    }
    
    toast.success('게시글이 삭제되었습니다.')
    
    // 백그라운드에서 실제 삭제 실행
    try {
      const result = await deletePost(post.id)
      if (result?.error) {
        toast.error(result.error)
        // 실패 시 페이지 새로고침으로 원래 상태 복구
        window.location.reload()
      }
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.')
      window.location.reload()
    }
  }


  const loadComments = useCallback(async () => {
    setIsLoadingComments(true)
    try {
      // 클라이언트 Supabase 인스턴스 생성
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase 환경변수가 설정되지 않았습니다')
        console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
        console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '[설정됨]' : '[없음]')
        setComments([])
        return
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      console.log('댓글 로딩 중...', post.id)
      
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('post_id', post.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('댓글 로딩 오류:', error)
        setComments([])
      } else {
        console.log('댓글 로딩 성공:', comments?.length || 0, '개')
        setComments(comments || [])
      }
    } catch (error) {
      console.error('댓글 로딩 예외:', error)
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }, [post.id])

  const handleCommentToggle = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('🔄 댓글 토글 클릭됨! 현재 showComments:', showComments)
    try {
      if (!showComments) {
        console.log('📂 댓글 섹션 열기...')
        // 댓글 섹션을 먼저 열고 로딩 상태로 표시
        setShowComments(true)
        console.log('✅ showComments 상태를 true로 설정')
        // 댓글을 처음 열 때만 로드
        await loadComments()
        console.log('✅ 댓글 로딩 완료')
      } else {
        console.log('📁 댓글 섹션 닫기...')
        setShowComments(false)
        console.log('✅ showComments 상태를 false로 설정')
      }
    } catch (error) {
      console.error('❌ handleCommentToggle 오류:', error)
    }
  }, [showComments, loadComments])

  // 컴포넌트 마운트 시 댓글이 이미 열려있다면 로드
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments])

  return (
    <article className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
      isEducational 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
        : 'bg-white border-gray-200'
    }`} role="article" aria-labelledby={`post-title-${post.id}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center" role="img" aria-label={`${post.author_name} 프로필 사진`}>
            <span className="text-sm font-medium text-gray-700">
              {post.author_name[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author_name}</p>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(post.category)}`}>
            {isEducational && <span>{getCategoryIcon(post.category)}</span>}
            {getCategoryLabel(post.category)}
          </span>
          
          {isEducational && metadata?.expert_verified && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
              ✓ 전문가 검증
            </span>
          )}
          
          {isEducational && metadata?.is_featured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
              ⭐ 추천
            </span>
          )}
          
          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowActions(!showActions)}
                aria-label="게시글 옵션 메뉴"
                aria-expanded={showActions}
                aria-haspopup="true"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10" role="menu" aria-label="게시글 옵션">
                  <Link 
                    href={`/post/${post.id}/edit`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                    aria-label="게시글 삭제하기"
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block group" aria-label={`${post.title} 게시글 자세히 보기`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors" id={`post-title-${post.id}`}>
          {post.title}
        </h3>
        <p className="text-gray-700 mb-4 leading-relaxed">
          {truncateText(post.content, 200)}
        </p>

        
        {/* Educational Content Details */}
        {isEducational && metadata && (
          <div className="bg-white/70 rounded-lg p-3 mt-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {metadata.estimated_read_time && (
                <div className="flex items-center gap-1">
                  <span>🕒</span>
                  <span>{formatReadTime(metadata.estimated_read_time)}</span>
                </div>
              )}
              
              {metadata.target_audience && (
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{getTargetAudienceLabel(metadata.target_audience)}</span>
                </div>
              )}
              
              {metadata.difficulty_level && (
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span className="capitalize">{metadata.difficulty_level}</span>
                </div>
              )}
            </div>
            
            {metadata.keywords && metadata.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {metadata.keywords.slice(0, 4).map((keyword) => (
                  <span key={keyword} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              optimisticLike.liked 
                ? 'text-red-600' 
                : 'text-gray-500 hover:text-red-600'
            }`}
            aria-label={`게시글 ${optimisticLike.liked ? '좋아요 취소' : '좋아요'} - 현재 ${optimisticLike.count}개`}
          >
            <Heart className={`w-5 h-5 ${optimisticLike.liked ? 'fill-current' : ''}`} aria-hidden="true" />
            <span>{optimisticLike.count}</span>
          </button>
          
          <div
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🔥 DIV 마우스다운 핸들러 실행됨!')
              console.log('🔥 현재 showComments 상태:', showComments)
              
              // 강제로 상태 변경 시도
              console.log('🔥 setShowComments(!showComments) 호출')
              setShowComments(!showComments)
              
              // 댓글 로딩도 강제 실행
              if (!showComments) {
                console.log('🔥 loadComments() 강제 실행')
                loadComments()
              }
            }}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label={`댓글 ${showComments ? '숨기기' : '보기'} - 댓글 ${comments.length || post.comments?.length || 0}개`}
            aria-expanded={showComments}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                console.log('🔥 DIV 키보드 이벤트!')
                setShowComments(!showComments)
                if (!showComments) {
                  loadComments()
                }
              }
            }}
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>{comments.length || post.comments?.length || 0}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500" role="text" aria-label={`조회수 ${post.view_count}회`}>
            <Eye className="w-5 h-5" aria-hidden="true" />
            <span>{post.view_count}</span>
          </div>
        </div>

        <Link 
          href={`/post/${post.id}`}
          className={`text-sm font-medium flex items-center gap-1 ${
            isEducational 
              ? 'text-indigo-600 hover:text-indigo-500' 
              : 'text-blue-600 hover:text-blue-500'
          }`}
        >
          {isEducational ? '📚 정보 보기' : '자세히 보기'}
        </Link>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {isLoadingComments ? (
            <div className="text-center py-4 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2">댓글 로딩 중...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <CommentForm 
                postId={post.id} 
                isLoggedIn={!!currentUserId}
                onSuccess={() => {
                  loadComments() // 댓글 목록 새로고침
                  toast.success('댓글이 작성되었습니다.')
                }}
              />
              
              <CommentList
                comments={comments}
                currentUserId={currentUserId}
                postId={post.id}
                isLoggedIn={!!currentUserId}
              />
            </div>
          )}
        </div>
      )}
    </article>
  )
}