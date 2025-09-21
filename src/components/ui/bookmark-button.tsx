'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface BookmarkButtonProps {
  postId: string
  isBookmarked?: boolean
  onToggle?: (postId: string, isBookmarked: boolean) => Promise<void>
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  showLabel?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 p-1',
  md: 'h-9 w-9 p-2',
  lg: 'h-10 w-10 p-2'
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function BookmarkButton({
  postId,
  isBookmarked = false,
  onToggle,
  size = 'md',
  variant = 'ghost',
  showLabel = false,
  className
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleBookmarkToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    const previousState = bookmarked

    // Optimistic update
    setBookmarked(!bookmarked)

    try {
      if (onToggle) {
        await onToggle(postId, !bookmarked)
      }

      // Show success toast
      toast.success(
        !bookmarked ? '북마크에 저장했습니다' : '북마크에서 제거했습니다',
        {
          duration: 2000,
          position: 'bottom-center'
        }
      )
    } catch (error) {
      // Revert optimistic update on error
      setBookmarked(previousState)
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
      console.error('Bookmark toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const IconComponent = bookmarked ? BookmarkCheck : Bookmark

  return (
    <Button
      variant={variant}
      size={showLabel ? 'sm' : undefined}
      className={cn(
        !showLabel && sizeClasses[size],
        bookmarked && 'text-blue-600 hover:text-blue-700',
        'transition-colors duration-200',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      aria-label={bookmarked ? '북마크에서 제거' : '북마크에 저장'}
      title={bookmarked ? '북마크에서 제거' : '북마크에 저장'}
    >
      <IconComponent
        className={cn(
          iconSizes[size],
          bookmarked && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="ml-1 text-sm">
          {bookmarked ? '저장됨' : '저장'}
        </span>
      )}
    </Button>
  )
}