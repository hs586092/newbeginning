'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Edit3, Trash2, Flag, MessageCircle, Copy, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CommentModerationProps {
  commentId: string
  isOwner: boolean
  isLoggedIn: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  commentContent: string
  commentUrl?: string
  className?: string
}

export function CommentModeration({
  commentId,
  isOwner,
  isLoggedIn,
  onEdit,
  onDelete,
  onReport,
  commentContent,
  commentUrl,
  className
}: CommentModerationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commentContent)
      toast.success('댓글이 클립보드에 복사되었습니다.')
      setIsOpen(false)
    } catch (error) {
      toast.error('복사에 실패했습니다.')
    }
  }

  const handleShare = async () => {
    if (commentUrl) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: '댓글 공유',
            url: commentUrl
          })
        } else {
          await navigator.clipboard.writeText(commentUrl)
          toast.success('댓글 링크가 클립보드에 복사되었습니다.')
        }
        setIsOpen(false)
      } catch (error) {
        toast.error('공유에 실패했습니다.')
      }
    }
  }

  const handleEdit = () => {
    onEdit?.()
    setIsOpen(false)
  }

  const handleDelete = () => {
    onDelete?.()
    setIsOpen(false)
  }

  const handleReport = () => {
    onReport?.()
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="댓글 옵션"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* 복사 */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              댓글 복사
            </button>

            {/* 공유 */}
            {commentUrl && (
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share className="w-4 h-4" />
                댓글 공유
              </button>
            )}

            {/* 구분선 */}
            {(isOwner || isLoggedIn) && (
              <hr className="my-1 border-gray-100" />
            )}

            {/* 소유자 전용 메뉴 */}
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  댓글 수정
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  댓글 삭제
                </button>
              </>
            )}

            {/* 신고 (로그인한 사용자만, 자신의 댓글이 아닌 경우) */}
            {isLoggedIn && !isOwner && (
              <button
                onClick={handleReport}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Flag className="w-4 h-4" />
                댓글 신고
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 신고 모달 컴포넌트
interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, details: string) => void
  isSubmitting?: boolean
}

export function ReportModal({ isOpen, onClose, onSubmit, isSubmitting = false }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const reportReasons = [
    { value: 'spam', label: '스팸/광고' },
    { value: 'harassment', label: '괴롭힘/악플' },
    { value: 'inappropriate', label: '부적절한 내용' },
    { value: 'misinformation', label: '허위정보' },
    { value: 'copyright', label: '저작권 침해' },
    { value: 'other', label: '기타' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason) {
      onSubmit(reason, details)
      setReason('')
      setDetails('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">댓글 신고</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 사유
            </label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label key={reportReason.value} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason.value}
                    checked={reason === reportReason.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{reportReason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 (선택사항)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="신고 사유에 대해 더 자세히 설명해주세요..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!reason || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? '신고중...' : '신고하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}