'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded",
        className
      )}
    />
  )
}

// Post skeleton for feed
export function PostSkeleton() {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="w-8 h-8 rounded" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-8 rounded-full" />
          <Skeleton className="w-16 h-8 rounded-full" />
        </div>
        <Skeleton className="w-12 h-8 rounded" />
      </div>
    </div>
  )
}

// Comment skeleton
export function CommentSkeleton() {
  return (
    <div className="flex space-x-3 p-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-8" />
        </div>
      </div>
    </div>
  )
}

// Text skeleton for content
export function TextSkeleton({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}