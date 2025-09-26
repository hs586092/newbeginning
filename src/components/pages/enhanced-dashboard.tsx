'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/simple-auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Gamification components
import { PointsDisplay } from '@/components/gamification/points-display'
import { BadgesCollection } from '@/components/gamification/badges-collection'
import { Leaderboard } from '@/components/gamification/leaderboard'

// Messaging components
import { ConversationList } from '@/components/messaging/conversation-list'
import { ChatWindow } from '@/components/messaging/chat-window'

// Groups components
import { GroupsDirectory } from '@/components/groups/groups-directory'

// Social sharing components
import { BookmarkManager } from '@/components/social/bookmark-manager'

// Existing components
import { UnifiedFeed } from '@/components/feed/unified-feed'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { ActivityFeed } from '@/components/social/activity-feed'
import { RecommendedUsersSection } from '@/components/social/recommended-users-section'

import { ConversationWithDetails } from '@/types/database.types'
import {
  Trophy,
  MessageCircle,
  Users,
  Bookmark,
  TrendingUp,
  Settings,
  Bell,
  Star,
  Award,
  Activity
} from 'lucide-react'

export function EnhancedDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-4">대시보드를 이용하려면 로그인해주세요.</p>
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-muted-foreground">
              안녕하세요, {user.user_metadata?.full_name || '사용자'}님! 👋
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Settings className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-foreground" />
          </div>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">개요</span>
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">게임화</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">메시지</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">그룹</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">북마크</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">피드</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PointsDisplay userId={user.id} compact />
                  <BadgesCollection userId={user.id} compact showProgress={false} />
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">새 메시지</span>
                      </div>
                      <div className="text-2xl font-bold">3</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent activity feed */}
                <ActivityFeed variant="following" className="h-96" />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Mini leaderboard */}
                <Leaderboard limit={5} currentUserId={user.id} />

                {/* Recommended users */}
                <RecommendedUsersSection />

                {/* Quick actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">빠른 액세스</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      onClick={() => setActiveTab('messaging')}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      새 메시지 작성
                    </button>
                    <button
                      onClick={() => setActiveTab('groups')}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      그룹 둘러보기
                    </button>
                    <button
                      onClick={() => setActiveTab('bookmarks')}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4" />
                      저장된 게시글
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PointsDisplay userId={user.id} />
                <BadgesCollection userId={user.id} />
              </div>
              <div>
                <Leaderboard currentUserId={user.id} limit={20} />
              </div>
            </div>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <ConversationList
                  onSelectConversation={setSelectedConversation}
                  selectedConversationId={selectedConversation?.id}
                  currentUserId={user.id}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    currentUserId={user.id}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        대화를 선택하세요
                      </h3>
                      <p className="text-muted-foreground">
                        왼쪽에서 대화를 선택하거나 새 대화를 시작해보세요.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="mt-6">
            <div className="space-y-6">
              {/* My groups */}
              <GroupsDirectory showMyGroups currentUserId={user.id} />

              {/* All groups */}
              <GroupsDirectory currentUserId={user.id} />
            </div>
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="mt-6">
            <BookmarkManager />
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <UnifiedFeed
                  posts={[]} // This will be loaded by the component
                  isLoading={false}
                  isAuthenticated={true}
                  currentUserId={user.id}
                  variant="dashboard"
                  selectedCategory="all"
                  activeFilter="all"
                  smartFilter="latest"
                />
              </div>
              <div className="space-y-6">
                <ActivityFeed variant="public" />
                <RecommendedUsersSection />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}