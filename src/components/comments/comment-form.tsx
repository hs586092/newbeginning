'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { createComment } from '@/lib/comments/actions'
import { toast } from 'sonner'
import { useMention } from '@/hooks/use-mention'
import { MentionDropdown } from './mention-dropdown'

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  isLoggedIn: boolean
  onSuccess?: () => void
  placeholder?: string
  buttonText?: string
}

export function CommentForm({
  postId,
  parentCommentId,
  isLoggedIn,
  onSuccess,
  placeholder = '댓글을 입력하세요...',
  buttonText = '댓글 작성'
}: CommentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  async function handleSubmit(formData: FormData) {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      return
    }

    startTransition(async () => {
      const result = await createComment(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        setContent('')
        if (onSuccess) {
          onSuccess()
        } else {
          toast.success('댓글이 작성되었습니다.')
        }
      }
    })
  }

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

    // Shift+Enter는 줄바꿈, Enter는 제출
    if (e.key === 'Enter' && !e.shiftKey && !isMentionOpen) {
      e.preventDefault()
      if (content.trim() && !isPending) {
        const form = e.currentTarget.form
        if (form) {
          const formData = new FormData(form)
          handleSubmit(formData)
        }
      }
    }
  }, [isMentionOpen, handleMentionKeyDown, content, isPending])

  // 클릭으로 멘션 드롭다운 닫기
  const handleTextareaClick = useCallback(() => {
    if (isMentionOpen) {
      closeSuggestions()
    }
  }, [isMentionOpen, closeSuggestions])

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">댓글을 작성하려면 로그인하세요.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
      <form action={handleSubmit} className="space-y-3">
        <input type="hidden" name="postId" value={postId} />
        {parentCommentId && (
          <input type="hidden" name="parentCommentId" value={parentCommentId} />
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onClick={handleTextareaClick}
            placeholder={placeholder}
            rows={3}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-white text-sm"
            disabled={isPending}
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

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${content.length > 450 ? 'text-red-500' : content.length > 400 ? 'text-yellow-500' : 'text-gray-500'}`}>
              {content.length}/500자
            </span>
            <span className="text-xs text-gray-400">
              • @ 멘션 • Shift+Enter 줄바꿈
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {content.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setContent('')}
                className="text-gray-500 hover:text-gray-700 px-2 h-8"
                disabled={isPending}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending || !content.trim() || content.length > 500}
              size="sm"
              className="px-4 h-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              {isPending ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>작성중...</span>
                </div>
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}