'use client'

import { useState, useOptimistic, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { formatDate, getCategoryLabel, getCategoryColor, truncateText, isEducationalContent, getCategoryIcon, formatReadTime, getTargetAudienceLabel } from '@/lib/utils'
import { toggleLike, deletePost, createComment, getComments, toggleCommentLike, getCommentLikes } from '@/lib/posts/actions'
import { formatUserName, generateCulturallyAppropriateResponse, isAppropriateLanguage, type LanguagePreference, type FamilyRole, type AddressStyle } from '@/lib/korean-culture'
import { Button } from '@/components/ui/button'
import type { PostWithDetails } from '@/types/database.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: PostWithDetails
  currentUserId?: string
  isOwner?: boolean
  onDelete?: (postId: string) => void
}

export function PostCard({ post, currentUserId, isOwner, onDelete }: PostCardProps) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentLikes, setCommentLikes] = useState<{[key: string]: {liked: boolean, count: number}}>({})
  const [languageSuggestion, setLanguageSuggestion] = useState<string | null>(null)
  
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

  const handleCommentTextChange = (value: string) => {
    setNewComment(value)
    
    // Check language appropriateness (assuming post author prefers formal language)
    if (value.trim().length > 10) {
      const validation = isAppropriateLanguage(value, 'formal' as LanguagePreference)
      setLanguageSuggestion(validation.appropriate ? null : validation.suggestion || null)
    } else {
      setLanguageSuggestion(null)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      router.push('/login')
      return
    }
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    
    try {
      const result = await createComment(post.id, newComment)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('댓글이 작성되었습니다!')
        setNewComment('')
        // 댓글 목록 새로고침
        loadComments()
      }
    } catch (error) {
      toast.error('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      const result = await getComments(post.id)
      if (result.success) {
        setComments(result.comments)
        
        // Initialize comment likes with default values for better performance
        if (result.comments.length > 0) {
          const likesData: {[key: string]: {liked: boolean, count: number}} = {}
          result.comments.forEach((comment: any) => {
            likesData[comment.id] = { liked: false, count: 0 }
          })
          setCommentLikes(likesData)
        }
      } else if (result.error) {
        console.error('Comments loading error:', result.error)
        setComments([])
      }
    } catch (error) {
      console.error('Comments loading error:', error)
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    // Load current like data if not loaded yet
    if (!commentLikes[commentId]) {
      try {
        const likesResult = await getCommentLikes(commentId)
        if (likesResult.success) {
          setCommentLikes(prev => ({
            ...prev,
            [commentId]: {
              liked: likesResult.userLiked || false,
              count: likesResult.count || 0
            }
          }))
        }
      } catch (error) {
        console.error('Error loading comment likes:', error)
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: { liked: false, count: 0 }
        }))
      }
      // Wait a moment for the state to update
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Optimistic update
    const currentLikeData = commentLikes[commentId] || { liked: false, count: 0 }
    const newLiked = !currentLikeData.liked
    const newCount = newLiked ? currentLikeData.count + 1 : Math.max(0, currentLikeData.count - 1)

    setCommentLikes(prev => ({
      ...prev,
      [commentId]: {
        liked: newLiked,
        count: newCount
      }
    }))

    try {
      const result = await toggleCommentLike(commentId)
      if (result.error) {
        // Revert optimistic update on error
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: currentLikeData
        }))
        toast.error(result.error)
      } else {
        // Update with actual result from server
        if (result.success && result.data) {
          setCommentLikes(prev => ({
            ...prev,
            [commentId]: {
              liked: result.data.userLiked || false,
              count: result.data.count || 0
            }
          }))
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: currentLikeData
      }))
      toast.error('좋아요 처리 중 오류가 발생했습니다.')
    }
  }

  const handleCommentToggle = async () => {
    if (!showComments) {
      // 댓글을 처음 열 때만 로드
      await loadComments()
    }
    setShowComments(!showComments)
  }

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
          
          <button
            onClick={handleCommentToggle}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            aria-label={`댓글 ${showComments ? '숨기기' : '보기'} - 댓글 ${comments.length || post.comments?.length || 0}개`}
            aria-expanded={showComments}
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>{comments.length || post.comments?.length || 0}</span>
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

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-4">
            {/* Comment Form */}
            {currentUserId ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">
                    {currentUserId.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => handleCommentTextChange(e.target.value)}
                      placeholder="댓글을 작성해주세요... (정중한 언어로 작성해주시면 감사하겠습니다)"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="댓글 작성용 텍스트 영역"
                    />
                    {languageSuggestion && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg">
                        <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
                        <span className="text-xs text-blue-700 dark:text-blue-300">{languageSuggestion}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingComment ? '작성 중...' : '댓글 달기'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  로그인
                </button>
                하고 댓글을 작성해보세요.
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center py-4 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2">댓글을 불러오는 중...</span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-blue-700">
                        {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {comment.author_name || '익명'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {comment.content}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all duration-200 ${
                              commentLikes[comment.id]?.liked
                                ? 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                                : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                            }`}
                            aria-label={`댓글 ${commentLikes[comment.id]?.liked ? '좋아요 취소' : '좋아요'} - 현재 ${commentLikes[comment.id]?.count || 0}개`}
                          >
                            <Heart 
                              className={`w-4 h-4 transition-all duration-200 ${
                                commentLikes[comment.id]?.liked 
                                  ? 'fill-pink-500 text-pink-500 scale-110' 
                                  : 'hover:scale-105'
                              }`}
                              aria-hidden="true"
                            />
                            <span className={`text-sm font-medium ${
                              commentLikes[comment.id]?.liked 
                                ? 'text-pink-600' 
                                : 'text-gray-500'
                            }`}>
                              {commentLikes[comment.id]?.count > 0 
                                ? commentLikes[comment.id].count 
                                : '좋아요'
                              }
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              showComments && !isLoadingComments && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </article>
  )
}