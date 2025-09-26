'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark, getBookmarkStatus } from '@/lib/actions/bookmarks'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UseBookmarkProps {
  postId: string
  initialIsBookmarked?: boolean
}

interface UseBookmarkReturn {
  isBookmarked: boolean
  isLoading: boolean
  toggleBookmark: () => Promise<void>
}

export function useBookmark({ postId, initialIsBookmarked = false }: UseBookmarkProps): UseBookmarkReturn {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isPending, startTransition] = useTransition()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleToggleBookmark = async () => {
    // 로그인 체크
    if (!isAuthenticated) {
      toast.error('로그인이 필요한 기능입니다.', {
        duration: 3000,
        action: {
          label: '로그인',
          onClick: () => router.push('/login')
        }
      })
      return
    }

    const previousState = isBookmarked

    // Optimistic update
    setIsBookmarked(!isBookmarked)

    startTransition(async () => {
      try {
        const result = await toggleBookmark(postId)

        if (result.success && typeof result.isBookmarked === 'boolean') {
          setIsBookmarked(result.isBookmarked)

          // Success feedback
          const message = result.isBookmarked
            ? '북마크에 저장되었습니다 📚'
            : '북마크에서 제거되었습니다'

          toast.success(message, {
            duration: 2000,
            position: 'bottom-center'
          })
        } else {
          // Revert on error
          setIsBookmarked(previousState)
          toast.error(result.error || '오류가 발생했습니다. 다시 시도해주세요.')
        }
      } catch (error) {
        // Revert on error
        setIsBookmarked(previousState)
        toast.error('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
        console.error('Bookmark toggle error:', error)
      }
    })
  }

  return {
    isBookmarked,
    isLoading: isPending,
    toggleBookmark: handleToggleBookmark
  }
}