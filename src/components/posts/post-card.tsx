'use client'

import { useState, useOptimistic } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { formatDate, getCategoryLabel, getCategoryColor, truncateText, isEducationalContent, getCategoryIcon, formatReadTime, getTargetAudienceLabel } from '@/lib/utils'
import { toggleLike, deletePost } from '@/lib/posts/actions'
import { Button } from '@/components/ui/button'
import type { PostWithDetails } from '@/types/database.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: PostWithDetails
  currentUserId?: string
  isOwner?: boolean
}

export function PostCard({ post, currentUserId, isOwner }: PostCardProps) {
  const router = useRouter()
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
    const result = await deletePost(post.id)
    
    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
    } else {
      toast.success('게시글이 삭제되었습니다.')
      router.refresh()
    }
  }

  return (
    <article className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
      isEducational 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
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
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
                  <Link 
                    href={`/post/${post.id}/edit`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block group">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-700 mb-4 leading-relaxed">
          {truncateText(post.content, 200)}
        </p>

        {/* Job Details */}
        {(post.category === 'job_offer' || post.category === 'job_seek') && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {post.company && (
                <div>
                  <span className="font-medium text-gray-600">회사:</span> {post.company}
                </div>
              )}
              {post.location && (
                <div>
                  <span className="font-medium text-gray-600">지역:</span> {post.location}
                </div>
              )}
              {post.salary && (
                <div>
                  <span className="font-medium text-gray-600">급여:</span> {post.salary}
                </div>
              )}
              {post.contact && (
                <div>
                  <span className="font-medium text-gray-600">연락처:</span> {post.contact}
                </div>
              )}
            </div>
            {post.deadline && (
              <div className="mt-2 text-sm">
                <span className="font-medium text-gray-600">마감일:</span> 
                <span className="text-red-600 ml-1">{post.deadline}</span>
              </div>
            )}
          </div>
        )}
        
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
          >
            <Heart className={`w-5 h-5 ${optimisticLike.liked ? 'fill-current' : ''}`} />
            <span>{optimisticLike.count}</span>
          </button>
          
          <Link 
            href={`/post/${post.id}`}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments?.length || 0}</span>
          </Link>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Eye className="w-5 h-5" />
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