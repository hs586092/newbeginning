'use client'

import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { ActivitySummary } from '@/components/social/activity-feed'
import { ProfileService } from '@/lib/services/profile-service'
import { useEffect, useState } from 'react'

interface LeftSidebarProps {
  className?: string
}

export function LeftSidebar({ className = '' }: LeftSidebarProps) {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserData()
    }
  }, [isAuthenticated, user?.id])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const [userProfile, recentNotifications, unreadNotificationCount] = await Promise.all([
        ProfileService.getCurrentUserProfile(),
        ProfileService.getRecentNotifications(user!.id, 2),
        ProfileService.getUnreadNotificationCount(user!.id)
      ])

      setProfile(userProfile)
      setNotifications(recentNotifications)
      setUnreadCount(unreadNotificationCount)
    } catch (error) {
      console.error('사용자 데이터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>

      {/* 병원 찾기 바로가기 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          🏥 우리 동네 소아과
        </h4>
        <p className="text-sm text-blue-50 mb-3 leading-relaxed">
          내 주변 소아과를 찾고 실제 엄마들의 리뷰를 확인하세요
        </p>
        <button
          onClick={() => window.location.href = '/hospital'}
          className="w-full bg-white text-blue-600 hover:bg-blue-50 text-sm py-2 px-4 rounded-md font-medium transition-colors"
        >
          병원 찾기
        </button>
      </div>

      {/* Phase 2: 새 메시지 알림 (로그인된 사용자만) */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              💬 메시지
            </h4>
            {unreadCount > 0 && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="bg-gray-200 rounded h-4 flex-1"></div>
              </div>
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="bg-gray-200 rounded h-4 flex-1"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={notification.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      index === 0 ? 'bg-blue-400' : 'bg-green-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-700 truncate">
                      {notification.title || notification.content}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  새로운 메시지가 없습니다
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => window.location.href = '/chat'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md font-medium transition-colors mt-3"
          >
            모든 메시지 보기
          </button>
        </div>
      )}

      {/* 활동 요약 (로그인된 사용자만) */}
      {isAuthenticated && (
        <ActivitySummary />
      )}

      {/* 처음 오셨나요? */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-2">👋 처음 오셨나요?</h4>
        <p className="text-sm text-blue-800 mb-3 leading-relaxed">
          첫돌까지는 초보엄마부터 베테랑맘까지 모든 육아맘들이 소통하는 공간이에요!
        </p>
        {isAuthenticated ? (
          <button
            onClick={() => window.location.href = '/write'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md font-medium transition-colors"
          >
            첫 글 써보기
          </button>
        ) : (
          <a href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md font-medium transition-colors text-center">
            로그인하고 시작하기
          </a>
        )}
      </div>
    </div>
  )
}