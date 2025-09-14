'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useMention, MentionText } from '@/hooks/use-mention'
import { MentionDropdown } from './mention-dropdown'

interface CommentEditProps {
  commentId: string
  initialContent: string
  onSave: (content: string) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CommentEdit({
  commentId,
  initialContent,
  onSave,
  onCancel,
  isSubmitting = false
}: CommentEditProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 멘션 기능
  const {
    suggestions,
    selectedIndex,
    isOpen: isMentionOpen,
    detectMention,
    handleKeyDown: handleMentionKeyDown,
    replaceMention,
    closeSuggestions,
    selectUser
  } = useMention({
    onMention: (user) => {
      if (!textareaRef.current) return

      const { newText, newCaretPos } = replaceMention(content, user)
      setContent(newText)

      // 캐럿 위치 설정
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCaretPos, newCaretPos)
          textareaRef.current.focus()
        }
      }, 0)
    }
  })

  // 텍스트 변경 처리
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // 멘션 감지
    const caretPos = e.target.selectionStart
    detectMention(newContent, caretPos)
  }, [detectMention])

  // 키다운 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 멘션 드롭다운이 열려있으면 먼저 처리
    if (isMentionOpen && handleMentionKeyDown(e.nativeEvent)) {
      return
    }

    // Ctrl+Enter로 저장
    if (e.key === 'Enter' && e.ctrlKey && !isMentionOpen) {
      e.preventDefault()
      handleSave()
    }

    // Escape으로 취소
    if (e.key === 'Escape' && !isMentionOpen) {
      e.preventDefault()
      onCancel()
    }
  }, [isMentionOpen, handleMentionKeyDown, content, isSubmitting])

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('댓글 내용을 입력해주세요.')
      return
    }

    if (content.length > 500) {
      toast.error('댓글은 500자를 초과할 수 없습니다.')
      return
    }

    try {
      await onSave(content.trim())
    } catch (error) {
      console.error('댓글 수정 오류:', error)
      toast.error('댓글 수정에 실패했습니다.')
    }
  }

  return (
    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-yellow-700 font-medium">댓글 수정 중</span>
        <span className="text-xs text-gray-500">
          • @ 멘션 • Ctrl+Enter 저장 • Esc 취소
        </span>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none transition-all duration-200 bg-white text-sm"
          disabled={isSubmitting}
          placeholder="댓글을 수정해주세요..."
        />

        {/* 멘션 드롭다운 */}
        <MentionDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSelect={selectUser}
          isOpen={isMentionOpen}
          className="mt-2"
        />
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${content.length > 450 ? 'text-red-500' : content.length > 400 ? 'text-yellow-600' : 'text-gray-500'}`}>
            {content.length}/500자
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-600 hover:text-gray-800 px-3 h-8"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !content.trim() || content.length > 500}
            size="sm"
            className="px-4 h-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>저장중...</span>
              </div>
            ) : (
              '수정 완료'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}