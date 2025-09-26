'use client'

import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  requiredRole?: string
  fallback?: React.ReactNode
}

/**
 * Route protection component with flexible access control
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const isAuthenticated = !!user
  const isLoading = loading
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
    requireAuth,
    redirectTo
  ])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect in useEffect
  }

  // Note: Role checking removed for simplicity

  return <>{children}</>
}

/**
 * Component to show content only when user is authenticated
 */
export function AuthenticatedOnly({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return fallback || null
  }

  return user ? <>{children}</> : (fallback || null)
}

/**
 * Component to show content only when user is NOT authenticated
 */
export function UnauthenticatedOnly({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return fallback || null
  }

  return !user ? <>{children}</> : (fallback || null)
}