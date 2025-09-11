'use client'

import { useState, useOptimistic } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { formatDate, getCategoryLabel, getCategoryColor, truncateText, isEducationalContent, getCategoryIcon, formatReadTime, getTargetAudienceLabel } from '@/lib/utils'
import { toggleLike, deletePost } from '@/lib/posts/actions'
import { Button } from '@/components/ui/button'
import { useComments } from '@/contexts/comment-context'
import type { PostWithDetails } from '@/types/database.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PostCardV2Props {
  post: PostWithDetails
  currentUserId?: string
  isOwner?: boolean
  onDelete?: (postId: string) => void
}

export function PostCardV2({ post, currentUserId, isOwner, onDelete }: PostCardV2Props) {
  console.log('🚀 PostCardV2 렌더링! Post ID:', post.id)
  
  const router = useRouter()
  const { toggleComments, getCommentsCount, isCommentsOpen } = useComments()
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
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

  const handleCommentClick = async () => {
    console.log('🔥 PostCardV2: 댓글 버튼 클릭됨!', post.id)
    try {
      await toggleComments(post.id)
      console.log('✅ PostCardV2: 댓글 토글 완료')
    } catch (error) {
      console.error('❌ PostCardV2: 댓글 토글 오류', error)
      toast.error('댓글을 불러오는데 실패했습니다.')
    }
  }

  const commentsCount = getCommentsCount(post.id) || post.comments?.length || 0
  const commentsOpen = isCommentsOpen(post.id)

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
          
          <button
            onClick={handleCommentClick}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              commentsOpen 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-600'
            } px-2 py-1 rounded-md`}
            aria-label={`댓글 ${commentsOpen ? '닫기' : '열기'} - 댓글 ${commentsCount}개`}
            title={`댓글 ${commentsOpen ? '닫기' : '열기'}`}
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>{commentsCount}</span>
            {commentsOpen && <span className="text-xs ml-1">열림</span>}
          </button>
          
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
    </article>
  )
}