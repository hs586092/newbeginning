/**
 * 통합 왼쪽 사이드바 컴포넌트
 * 로그인 상태에 관계없이 일관된 레이아웃 제공
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  PenSquare,
  UserPlus,
  Search,
  Bell,
  Settings,
  LogIn,
  Crown,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UnifiedLeftSidebarProps {
  isAuthenticated: boolean
  user?: SupabaseUser | null
  className?: string
}

// 친구 목록 타입 정의
interface Friend {
  id: string
  username: string
  avatar_url?: string
  status: 'online' | 'away' | 'offline'
  baby_age?: string
  is_premium?: boolean
  last_active?: string
}

// 샘플 친구 데이터
const SAMPLE_FRIENDS: Friend[] = [
  {
    id: '1',
    username: '예비엄마22',
    status: 'online',
    baby_age: '20주차',
    is_premium: true,
    last_active: '방금 전'
  },
  {
    id: '2', 
    username: '아기사랑맘',
    status: 'online',
    baby_age: '5개월',
    last_active: '5분 전'
  },
  {
    id: '3',
    username: '신생아맘',
    status: 'away',
    baby_age: '2개월',
    last_active: '30분 전'
  },
  {
    id: '4',
    username: '첫육아중',
    status: 'offline',
    baby_age: '8개월',
    last_active: '2시간 전'
  }
]

const NAVIGATION_ITEMS = [
  { icon: Users, label: '커뮤니티', href: '/community', color: 'text-blue-600' },
  { icon: Heart, label: '임신 정보', href: '/pregnancy', color: 'text-pink-600' },
  { icon: MessageCircle, label: '신생아', href: '/newborn', color: 'text-purple-600' },
  { icon: Bookmark, label: '이유식', href: '/baby-food', color: 'text-green-600' }
]

const STATUS_COLORS = {
  online: 'bg-green-400',
  away: 'bg-yellow-400',
  offline: 'bg-gray-300'
}

export function UnifiedLeftSidebar({ 
  isAuthenticated, 
  user, 
  className 
}: UnifiedLeftSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [showAllFriends, setShowAllFriends] = useState(false)

  // 개발 환경에서는 로그인 상태 시뮬레이션
  const isDevelopment = process.env.NODE_ENV === 'development'
  const shouldShowFriends = isAuthenticated || (isDevelopment && process.env.NEXT_PUBLIC_SHOW_FRIENDS === 'true')

  // 디버깅을 위한 로깅
  useEffect(() => {
    console.log('🔍 UnifiedLeftSidebar 상태:', {
      isAuthenticated,
      isDevelopment,
      showFriendsEnv: process.env.NEXT_PUBLIC_SHOW_FRIENDS,
      shouldShowFriends,
      user: user?.email || 'No user'
    })
  }, [isAuthenticated, shouldShowFriends, user])

  useEffect(() => {
    setMounted(true)
    // 친구 데이터는 항상 로드 (로그인 시 표시용)
    setFriends(SAMPLE_FRIENDS)
  }, [])

  if (!mounted) return null

  const displayFriends = showAllFriends ? friends : friends.slice(0, 4)
  const onlineFriends = friends.filter(f => f.status === 'online')

  return (
    <aside className={cn("w-full space-y-4", className)}>
      {/* 친구 리스트는 항상 표시하고, 로그인 상태에 따라 내용 변경 */}
      <>
        {/* 친구 리스트 */}
        <Card variant="gradient" className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">
                  {isAuthenticated ? '친구들' : '커뮤니티'}
                </h3>
                {isAuthenticated && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {onlineFriends.length}
                  </Badge>
                )}
              </div>
              {isAuthenticated && (
                <Tooltip content="친구 찾기">
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isAuthenticated ? (
              /* 로그인 시: 실제 친구 리스트 */
              <div className="space-y-3">
                {displayFriends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    {/* 프로필 이미지 + 상태 */}
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {friend.username.slice(0, 2)}
                      </div>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                        STATUS_COLORS[friend.status]
                      )} />
                      {friend.is_premium && (
                        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                      )}
                    </div>

                    {/* 친구 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.username}
                        </p>
                        {friend.is_premium && (
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">{friend.baby_age}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400">{friend.last_active}</p>
                      </div>
                    </div>

                    {/* 메시지 버튼 */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-7 w-7"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {friends.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFriends(!showAllFriends)}
                    className="w-full text-xs text-gray-600 hover:bg-gray-100"
                  >
                    {showAllFriends ? '접기' : `${friends.length - 4}명 더 보기`}
                  </Button>
                )}
              </div>
            ) : (
              /* 로그아웃 시: 커뮤니티 미리보기 */
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    커
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">12,500명의 양육자들</p>
                    <p className="text-xs text-gray-500">실시간으로 활동 중</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 mb-1">친구들과 소통하세요</p>
                  <p className="text-xs text-gray-500 mb-3">로그인하고 같은 월령 엄마들과 친구가 되어보세요</p>
                  <Link href="/login">
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      로그인하기
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isAuthenticated ? (
        /* 로그인 상태: 친구 리스트 + 빠른 액세스 */
        <>
          {/* 친구 리스트 */}
          <Card variant="gradient" className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">친구들</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {onlineFriends.length}
                  </Badge>
                </div>
                <Tooltip content="친구 찾기">
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {displayFriends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    {/* 프로필 이미지 + 상태 */}
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {friend.username.slice(0, 2)}
                      </div>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                        STATUS_COLORS[friend.status]
                      )} />
                      {friend.is_premium && (
                        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                      )}
                    </div>

                    {/* 친구 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.username}
                        </p>
                        {friend.is_premium && (
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">{friend.baby_age}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400">{friend.last_active}</p>
                      </div>
                    </div>

                    {/* 메시지 버튼 */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-7 w-7"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {friends.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFriends(!showAllFriends)}
                    className="w-full text-xs text-gray-600 hover:bg-gray-100"
                  >
                    {showAllFriends ? '접기' : `${friends.length - 4}명 더 보기`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 빠른 액세스 */}
          <Card variant="interactive" className="overflow-hidden">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                빠른 액세스
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <Link href="/my-posts">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <PenSquare className="w-4 h-4 mr-3" />
                    내 게시글
                  </Button>
                </Link>
                <Link href="/liked">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Heart className="w-4 h-4 mr-3" />
                    좋아요한 글
                  </Button>
                </Link>
                <Link href="/bookmarks">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Bookmark className="w-4 h-4 mr-3" />
                    북마크
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Bell className="w-4 h-4 mr-3" />
                    알림
                    <Badge variant="destructive" className="ml-auto text-xs">3</Badge>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 프리미엄 업그레이드 (일반 사용자만) */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">프리미엄</h4>
                <p className="text-xs text-gray-600 mb-3">
                  전문의 상담, 맞춤 정보 제공
                </p>
                <Button size="sm" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  업그레이드
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* 비로그인 상태: 네비게이션 + 로그인 유도 */
        <>
          {/* 로그인 유도 카드 */}
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h3 className="font-bold text-lg mb-2">
                  12,500명과 함께하세요
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  따뜻한 양육자들의 커뮤니티에 참여하고 소중한 경험을 나누세요
                </p>
                <div className="space-y-2">
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                      <LogIn className="w-4 h-4 mr-2" />
                      무료 가입하기
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full text-blue-100 hover:bg-white/10">
                      이미 회원이신가요?
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주요 네비게이션 */}
          <Card variant="interactive">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Search className="w-4 h-4 mr-2 text-purple-600" />
                주요 카테고리
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {NAVIGATION_ITEMS.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm hover:bg-gray-50"
                    >
                      <item.icon className={cn("w-4 h-4 mr-3", item.color)} />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 최근 활동 (미리보기) */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-700 mb-1">실시간 활동</h4>
                <p className="text-xs text-gray-500 mb-3">
                  지금 이 순간에도 340개의 댓글이 달리고 있어요
                </p>
                <Badge variant="secondary" className="text-xs">
                  로그인하고 참여하기
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </aside>
  )
}

export default UnifiedLeftSidebar