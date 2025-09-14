'use client'

import { useState } from 'react'
import { Trash2, Reply, MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { deleteComment } from '@/lib/comments/actions'
import { Button } from '@/components/ui/button'
import { CommentForm } from './comment-form'
import { CommentFilter, CommentSortType, CommentFilterType } from './comment-filter'
import { CommentModeration, ReportModal } from './comment-moderation'
import { CommentEdit } from './comment-edit'
import { MentionText } from '@/hooks/use-mention'
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
  const [isEditing, setIsEditing] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
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

  // 댓글 편집
  const handleEditSave = async (newContent: string) => {
    try {
      // TODO: 댓글 업데이트 API 호출
      // const result = await updateComment(comment.id, newContent)
      // if (result?.error) {
      //   throw new Error(result.error)
      // }

      toast.success('댓글이 수정되었습니다.')
      setIsEditing(false)
      window.location.reload() // 임시: 새로고침으로 업데이트
    } catch (error) {
      console.error('댓글 수정 오류:', error)
      throw error
    }
  }

  // 댓글 신고
  const handleReport = async (reason: string, details: string) => {
    setIsSubmittingReport(true)
    try {
      // TODO: 신고 API 호출
      // const result = await reportComment(comment.id, reason, details)
      // if (result?.error) {
      //   throw new Error(result.error)
      // }

      toast.success('신고가 접수되었습니다. 검토 후 조치하겠습니다.')
      setShowReportModal(false)
    } catch (error) {
      console.error('신고 처리 오류:', error)
      toast.error('신고 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  return (
    <div className={`${isReply ? 'ml-4 sm:ml-8 relative' : ''} space-y-3`}>
      {/* 스레드 연결선 */}
      {isReply && (
        <div className="absolute -left-2 sm:-left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200 rounded-full"></div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200 group">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm`}>
              <span className="text-xs font-semibold text-white">
                {comment.author_name[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                {isReply && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    답글
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(comment.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 댓글 모더레이션 메뉴 */}
            <CommentModeration
              commentId={comment.id}
              isOwner={currentUserId === comment.user_id}
              isLoggedIn={isLoggedIn}
              onEdit={() => setIsEditing(true)}
              onDelete={() => handleDelete(comment.id)}
              onReport={() => setShowReportModal(true)}
              commentContent={comment.content}
              commentUrl={`/posts/${postId}#comment-${comment.id}`}
            />
          </div>
        </div>

        <div className="pl-0 sm:pl-12">
          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-3">
            <MentionText text={comment.content} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={handleReply}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  답글달기
                </Button>
              )}
            </div>

            {!isReply && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MessageCircle className="h-3 w-3" />
                <span>{comment.replies?.length || 0}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 편집 */}
      {isEditing && (
        <div className="mt-3">
          <CommentEdit
            commentId={comment.id}
            initialContent={comment.content}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="ml-4 sm:ml-12 mt-3">
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            isLoggedIn={isLoggedIn}
            onSuccess={handleReplySuccess}
            placeholder={`@${comment.author_name}님에게 답글...`}
            buttonText="답글 작성"
          />
        </div>
      )}

      {/* 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        isSubmitting={isSubmittingReport}
      />
    </div>
  )
}

export function CommentList({ comments, currentUserId, postId, isLoggedIn }: CommentListProps) {
  const [sortBy, setSortBy] = useState<CommentSortType>('newest')
  const [filterBy, setFilterBy] = useState<CommentFilterType>('all')

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

  // 정렬 함수
  const sortComments = (comments: CommentWithProfile[], sortType: CommentSortType) => {
    const sorted = [...comments]

    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'most_liked':
        return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      case 'most_replies':
        return sorted.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0))
      default:
        return sorted
    }
  }

  // 필터 함수
  const filterComments = (comments: CommentWithProfile[], filterType: CommentFilterType) => {
    switch (filterType) {
      case 'all':
        return comments
      case 'my_comments':
        return comments.filter(comment => comment.user_id === currentUserId)
      case 'with_replies':
        return comments.filter(comment => comment.replies && comment.replies.length > 0)
      default:
        return comments
    }
  }

  const organizedComments = organizeComments(comments)
  const filteredComments = filterComments(organizedComments, filterBy)
  const sortedComments = sortComments(filteredComments, sortBy)

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        첫 번째 댓글을 작성해보세요!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 댓글 필터 및 정렬 */}
      <CommentFilter
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        totalComments={comments.length}
        isLoggedIn={isLoggedIn}
      />

      {/* 필터링된 댓글이 없는 경우 */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filterBy === 'my_comments' ? '작성한 댓글이 없습니다.' :
           filterBy === 'with_replies' ? '답글이 있는 댓글이 없습니다.' :
           '댓글이 없습니다.'}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedComments.map((comment) => (
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
      )}
    </div>
  )
}