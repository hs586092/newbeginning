'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  text = '로딩 중...',
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn("flex items-center justify-center min-h-32", className)}>
      <div
        className={cn(
          "animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full",
          sizeClasses[size]
        )}
        role="status"
        aria-label="로딩 중"
      />
      {text && (
        <span className="ml-2 text-gray-600 text-sm font-medium">
          {text}
        </span>
      )}
    </div>
  )
}