'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message?: string
  title?: string
  retry?: () => void
  className?: string
  variant?: 'default' | 'minimal'
}

export function ErrorMessage({
  message = '문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  title = '오류가 발생했습니다',
  retry,
  className,
  variant = 'default'
}: ErrorMessageProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center text-red-600 text-sm", className)}>
        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <div className={cn("bg-red-50 border border-red-200 rounded-lg p-4 mb-4", className)}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium text-sm mb-1">
            {title}
          </h3>
          <p className="text-red-700 text-sm leading-5">
            {message}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="mt-3 inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label="다시 시도"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  )
}