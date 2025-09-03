'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PenSquare, 
  BarChart3, 
  Bookmark, 
  User, 
  Heart,
  MessageCircle,
  FileText,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  joinedDaysAgo: number
}

interface PersonalSidebarProps {
  user: SupabaseUser
  className?: string
}

export default function PersonalSidebar({ user, className = '' }: PersonalSidebarProps) {
  const [profile, setProfile] = useState<{ username: string; avatar_url?: string } | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        // 프로필 정보 로드
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url, created_at')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          
          // 가입 후 경과 일수 계산
          const joinedDate = new Date((profileData as any).created_at)
          const today = new Date()
          const daysDiff = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))
          
          // 사용자 활동 통계 로드 (간단한 방식)
          const [postsResult, commentsResult] = await Promise.all([
            // 내 글 수
            supabase
              .from('posts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id),
            
            // 내가 쓴 댓글 수
            supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
          ])

          // 내 글들이 받은 좋아요 수는 별도로 계산
          const { data: myPosts } = await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id)

          let totalLikes = 0
          if (myPosts && myPosts.length > 0) {
            const { count: likesCount } = await supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .in('post_id', (myPosts as any[]).map(p => p.id))
            
            totalLikes = likesCount || 0
          }

          setStats({
            totalPosts: postsResult.count || 0,
            totalLikes: totalLikes,
            totalComments: commentsResult.count || 0,
            joinedDaysAgo: daysDiff
          })
        }
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user.id, supabase])

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 사용자 프로필 카드 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {profile?.username || '사용자'}
            </h3>
            <p className="text-sm text-gray-600">
              가입 {stats?.joinedDaysAgo}일째
            </p>
          </div>
        </div>
        
        {/* 활동 통계 */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{stats?.totalPosts || 0}</div>
            <div className="text-xs text-gray-600">작성 글</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-lg font-bold text-red-500">{stats?.totalLikes || 0}</div>
            <div className="text-xs text-gray-600">받은 ❤️</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-lg font-bold text-green-600">{stats?.totalComments || 0}</div>
            <div className="text-xs text-gray-600">댓글</div>
          </div>
        </div>
      </div>

      {/* 빠른 액션들 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          빠른 액션
        </h4>
        
        <div className="space-y-3">
          {/* 새글 쓰기 */}
          <Link href="/write">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <PenSquare className="w-4 h-4 mr-3" />
              새 글 작성하기
            </Button>
          </Link>
          
          {/* 내 글 관리 */}
          <Link href="/my-posts">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-3" />
              내 글 관리 ({stats?.totalPosts || 0})
            </Button>
          </Link>
          
          {/* 정보센터 */}
          <Link href="/educational">
            <Button variant="outline" className="w-full justify-start">
              <Bookmark className="w-4 h-4 mr-3" />
              정보센터 둘러보기
            </Button>
          </Link>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
          활동 요약
        </h4>
        
        <div className="space-y-4">
          {stats?.totalPosts === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <PenSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">아직 작성한 글이 없습니다</p>
              <p className="text-xs text-gray-400">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  총 작성 글
                </span>
                <span className="font-semibold text-blue-600">{stats?.totalPosts || 0}개</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Heart className="w-4 h-4 mr-2" />
                  받은 좋아요
                </span>
                <span className="font-semibold text-red-500">{stats?.totalLikes || 0}개</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  작성한 댓글
                </span>
                <span className="font-semibold text-green-600">{stats?.totalComments || 0}개</span>
              </div>

              {/* 활동 레벨 표시 */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">활동 레벨</span>
                  <span className="text-xs text-blue-600">
                    {getActivityLevel((stats?.totalPosts || 0) + (stats?.totalComments || 0))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (((stats?.totalPosts || 0) + (stats?.totalComments || 0)) / 20) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 개인화 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-500" />
          개인 설정
        </h4>
        
        <div className="space-y-3">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <User className="w-4 h-4 mr-3" />
              프로필 수정
            </Button>
          </Link>
          
          <Button variant="outline" size="sm" className="w-full justify-start" disabled>
            <Calendar className="w-4 h-4 mr-3" />
            <span className="text-gray-400">육아 달력 (준비 중)</span>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start" disabled>
            <Bookmark className="w-4 h-4 mr-3" />
            <span className="text-gray-400">북마크 (준비 중)</span>
          </Button>
        </div>
      </div>

      {/* 육아 팁 */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          💡 오늘의 육아 팁
        </h4>
        <div className="text-sm text-gray-700 leading-relaxed">
          <p className="mb-2">🤱 <strong>신생아 수면 패턴</strong></p>
          <p className="text-gray-600">
            신생아는 하루 14-17시간을 잡니다. 2-4시간 간격으로 수유하며 자연스러운 패턴입니다.
          </p>
          <Link href="/educational?category=parenting_guide" className="text-blue-600 text-xs hover:underline mt-2 inline-block">
            더 많은 정보 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}

// 활동 레벨 계산 함수
function getActivityLevel(totalActivity: number): string {
  if (totalActivity === 0) return '새싹 🌱'
  if (totalActivity < 5) return '성장중 🌿' 
  if (totalActivity < 15) return '활발함 🌳'
  if (totalActivity < 30) return '베테랑 🏆'
  return '전문가 👑'
}