'use client'

import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { RecommendedUsersSection } from '@/components/social/recommended-users-section'
import { ActivityFeed } from '@/components/social/activity-feed'
import { CategoryService } from '@/lib/services/category-service'
import { GroupService } from '@/lib/services/group-service'
import { useEffect, useState } from 'react'

interface RightSidebarProps {
  className?: string
  dataState: {
    posts: any[]
    isLoading: boolean
    error?: string
    source: 'database' | 'fallback'
    connectionStatus: 'connected' | 'disconnected' | 'checking'
  }
}

export function RightSidebar({ className = '', dataState }: RightSidebarProps) {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [hotCategories, recommendedGroups] = await Promise.all([
        CategoryService.getHotCategories(),
        GroupService.getRecommendedGroups()
      ])

      setCategories(hotCategories)
      setGroups(recommendedGroups)
    } catch (error) {
      console.error('사이드바 데이터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 추천 사용자 섹션 (로그인된 사용자만) */}
      {isAuthenticated && (
        <RecommendedUsersSection />
      )}

      {/* Phase 2: 추천 그룹 (로그인된 사용자만) */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            👥 추천 그룹
          </h4>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="animate-pulse border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded h-4 mb-1"></div>
                      <div className="bg-gray-200 rounded h-3 w-16"></div>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded h-6 w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 4).map((group) => {
                const getColorClass = (color: string) => {
                  const colorMap: { [key: string]: { bg: string; hover: string } } = {
                    purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700' },
                    green: { bg: 'bg-green-600', hover: 'hover:bg-green-700' },
                    blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700' },
                    orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700' },
                  }
                  return colorMap[color] || { bg: 'bg-gray-600', hover: 'hover:bg-gray-700' }
                }

                const colors = getColorClass(group.color)

                return (
                  <div key={group.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center text-white text-sm`}>
                        {group.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{group.name}</h5>
                        <p className="text-xs text-gray-500">{group.member_count}명 · 공개</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await GroupService.joinGroup(group.id)
                          // 토스트 알림 표시
                          const toast = document.createElement('div');
                          toast.className = `fixed top-4 right-4 ${colors.bg} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity`;
                          toast.textContent = `${group.name}에 가입 요청을 보냈습니다!`;
                          document.body.appendChild(toast);
                          setTimeout(() => {
                            toast.style.opacity = '0';
                            setTimeout(() => document.body.removeChild(toast), 300);
                          }, 3000);
                        } catch (error) {
                          console.error('그룹 가입 오류:', error);
                        }
                      }}
                      className={`w-full ${colors.bg} ${colors.hover} text-white text-xs py-1 px-3 rounded font-medium transition-colors`}
                    >
                      가입하기
                    </button>
                  </div>
                )
              })}
              {groups.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  추천 그룹이 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 활동 피드 (로그인된 사용자만) */}
      {isAuthenticated && (
        <ActivityFeed variant="following" className="lg:block hidden" />
      )}

      {/* 지금 뜬 카테고리 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-bold text-gray-900 mb-3">🔥 지금 뜬 카테고리</h4>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="bg-gray-200 rounded h-4 flex-1 mr-4"></div>
                <div className="bg-gray-200 rounded h-3 w-8"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={category.id} className="flex items-center justify-between">
                <span className={`text-sm ${category.is_hot ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                  {index + 1}. {category.icon && `${category.icon} `}{category.name}
                  {category.is_hot && <span className="text-red-500 ml-1">HOT</span>}
                </span>
                <span className="text-xs text-gray-500">{category.post_count}</span>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                카테고리가 없습니다
              </div>
            )}
          </div>
        )}
      </div>

      {/* 시스템 상태 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-bold text-gray-900 mb-3">📊 시스템 상태</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">데이터 소스:</span>
            <span className={`font-medium ${
              dataState.source === 'database' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {dataState.source === 'database' ? '데이터베이스' : '임시 데이터'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">게시글 수:</span>
            <span className="font-medium text-gray-900">{dataState.posts.length}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">연결 상태:</span>
            <span className={`font-medium ${
              dataState.connectionStatus === 'connected' ? 'text-green-600' :
              dataState.connectionStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {dataState.connectionStatus === 'connected' ? '정상' :
               dataState.connectionStatus === 'disconnected' ? '연결 불가' : '확인 중'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}