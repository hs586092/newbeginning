import { Skeleton } from '@/components/ui/skeleton'

export function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>

      {/* Job Details Placeholder */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-2/3 h-4" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-16 h-4" />
      </div>
    </article>
  )
}