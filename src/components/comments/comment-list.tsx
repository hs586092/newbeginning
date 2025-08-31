'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { deleteComment } from '@/lib/comments/actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { CommentWithProfile } from '@/types/database.types'

interface CommentListProps {
  comments: CommentWithProfile[]
  currentUserId?: string
  postId: string
}

export function CommentList({ comments, currentUserId, postId }: CommentListProps) {
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

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

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        첫 번째 댓글을 작성해보세요!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
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
          
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  )
}