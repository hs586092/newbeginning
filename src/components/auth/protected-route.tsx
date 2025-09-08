'use client'

import { useAuth } from '@/contexts/auth-context'
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
  const { isAuthenticated, isLoading, hasRole, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while still loading or initializing
    if (!initialized || isLoading) return

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Check role requirement
    if (requiredRole && (!isAuthenticated || !hasRole(requiredRole))) {
      router.push('/unauthorized')
      return
    }
  }, [
    isAuthenticated, 
    isLoading, 
    initialized, 
    router, 
    requireAuth, 
    redirectTo, 
    requiredRole, 
    hasRole
  ])

  // Show loading state
  if (!initialized || isLoading) {
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

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    return null // Will redirect in useEffect
  }

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
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return fallback || null
  }

  return isAuthenticated ? <>{children}</> : (fallback || null)
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
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return fallback || null
  }

  return !isAuthenticated ? <>{children}</> : (fallback || null)
}

/**
 * Role-based access control component
 */
export function RoleGuard({ 
  role, 
  children, 
  fallback 
}: { 
  role: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { hasRole, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return fallback || null
  }

  if (!isAuthenticated || !hasRole(role)) {
    return fallback || null
  }

  return <>{children}</>
}