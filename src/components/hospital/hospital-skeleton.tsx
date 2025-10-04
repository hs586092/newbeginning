'use client'

export function HospitalCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Hospital Name */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

          {/* Rating and Distance */}
          <div className="flex items-center space-x-4 mb-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Address */}
          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>

          {/* Opening Hours */}
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Review Summary Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  )
}

export function HospitalListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <HospitalCardSkeleton key={i} />
      ))}
    </div>
  )
}
