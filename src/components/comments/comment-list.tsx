'use client'

import { useState } from 'react'
import { Trash2, Reply, MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { deleteComment } from '@/lib/comments/actions'
import { Button } from '@/components/ui/button'
import { CommentForm } from './comment-form'
import { toast } from 'sonner'
import type { CommentWithProfile } from '@/types/database.types'

interface CommentListProps {
  comments: CommentWithProfile[]
  currentUserId?: string
  postId: string
  isLoggedIn: boolean
}

interface CommentItemProps {
  comment: CommentWithProfile
  currentUserId?: string
  postId: string
  isLoggedIn: boolean
  level?: number
  onReply?: (parentId: string) => void
}

function CommentItem({ 
  comment, 
  currentUserId, 
  postId, 
  isLoggedIn, 
  level = 0,
  onReply 
}: CommentItemProps) {
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const isReply = level > 0

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    
    setDeletingCommentId(commentId)
    
    const result = await deleteComment(commentId, postId)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('댓글이 삭제되었습니다.')
    }
    
    setDeletingCommentId(null)
  }

  const handleReply = () => {
    if (isLoggedIn) {
      setShowReplyForm(!showReplyForm)
    } else {
      toast.error('로그인이 필요합니다.')
    }
  }

  const handleReplySuccess = () => {
    setShowReplyForm(false)
    toast.success('답글이 작성되었습니다.')
  }

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} space-y-3`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {comment.author_name[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{comment.author_name}</p>
              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {!isReply && isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:text-blue-600"
                onClick={handleReply}
              >
                <Reply className="h-3 w-3" />
              </Button>
            )}
            
            {currentUserId === comment.user_id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:text-red-600"
                onClick={() => handleDelete(comment.id)}
                disabled={deletingCommentId === comment.id}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-2">
          {comment.content}
        </p>

        {!isReply && (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{comment.replies?.length || 0}개 답글</span>
            </span>
          </div>
        )}
      </div>

      {showReplyForm && !isReply && (
        <div className="ml-8">
          <CommentForm 
            postId={postId} 
            parentCommentId={comment.id}
            isLoggedIn={isLoggedIn}
            onSuccess={handleReplySuccess}
            placeholder="답글을 입력하세요..."
            buttonText="답글 작성"
          />
        </div>
      )}
    </div>
  )
}

export function CommentList({ comments, currentUserId, postId, isLoggedIn }: CommentListProps) {
  // 댓글을 계층구조로 정리
  const organizeComments = (comments: CommentWithProfile[]) => {
    const topLevel: CommentWithProfile[] = []
    const replies: { [key: string]: CommentWithProfile[] } = {}
    
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        if (!replies[comment.parent_comment_id]) {
          replies[comment.parent_comment_id] = []
        }
        replies[comment.parent_comment_id].push(comment)
      } else {
        topLevel.push({
          ...comment,
          replies: []
        })
      }
    })
    
    // 최상위 댓글에 답글 연결
    topLevel.forEach(comment => {
      comment.replies = replies[comment.id] || []
    })
    
    return topLevel
  }
  
  const organizedComments = organizeComments(comments)

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        첫 번째 댓글을 작성해보세요!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {organizedComments.map((comment) => (
        <div key={comment.id} className="space-y-4">
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            postId={postId}
            isLoggedIn={isLoggedIn}
            level={0}
          />
          
          {/* 답글 렌더링 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  postId={postId}
                  isLoggedIn={isLoggedIn}
                  level={1}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}