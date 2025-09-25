'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecommendationsService } from '@/lib/services/recommendations-service'
import { Profile, Post, GroupWithDetails } from '@/types/database.types'
import {
  Users,
  FileText,
  Group,
  TrendingUp,
  Star,
  MessageCircle,
  Heart,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

interface SmartRecommendationsProps {
  className?: string
  compact?: boolean
}

export function SmartRecommendations({
  className = '',
  compact = false
}: SmartRecommendationsProps) {
  const [recommendedUsers, setRecommendedUsers] = useState<Profile[]>([])
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])
  const [recommendedGroups, setRecommendedGroups] = useState<GroupWithDetails[]>([])
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const [users, posts, groups, trending] = await Promise.all([
        RecommendationsService.getRecommendedUsers(compact ? 5 : 10),
        RecommendationsService.getRecommendedPosts(compact ? 5 : 10),
        RecommendationsService.getRecommendedGroups(compact ? 5 : 8),
        RecommendationsService.getTrendingContent('week', compact ? 5 : 10)
      ])

      setRecommendedUsers(users)
      setRecommendedPosts(posts)
      setRecommendedGroups(groups)
      setTrendingPosts(trending)
    } catch (error) {
      console.error('추천 콘텐츠 로드 오류:', error)
      toast.error('추천 콘텐츠를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRecommendations()
    setRefreshing(false)
    toast.success('추천 콘텐츠가 새로고침되었습니다')
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            스마트 추천
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="w-4 h-4" />
              추천 사용자
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recommendedUsers.slice(0, 3).map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name || user.username}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {(user.full_name || user.username).charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.parenting_stage && (
                      <span>{user.parenting_stage} 단계</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            스마트 추천
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              사용자
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-1 text-xs">
              <FileText className="w-3 h-3" />
              게시글
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1 text-xs">
              <Group className="w-3 h-3" />
              그룹
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              트렌딩
            </TabsTrigger>
          </TabsList>

          {/* Recommended Users */}
          <TabsContent value="users" className="mt-4">
            <div className="space-y-3">
              {recommendedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>추천할 사용자가 없습니다</p>
                </div>
              ) : (
                recommendedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name || user.username}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-medium">
                          {(user.full_name || user.username).charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {user.full_name || user.username}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {user.bio || '자기소개가 없습니다'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {user.parenting_stage && (
                          <Badge variant="outline" className="text-xs">
                            {user.parenting_stage}
                          </Badge>
                        )}
                        {user.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {user.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      팔로우
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Recommended Posts */}
          <TabsContent value="posts" className="mt-4">
            <div className="space-y-3">
              {recommendedPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>추천할 게시글이 없습니다</p>
                </div>
              ) : (
                recommendedPosts.map(post => (
                  <div key={post.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                        {post.profiles?.avatar_url ? (
                          <Image
                            src={post.profiles.avatar_url}
                            alt={post.profiles.full_name || post.profiles.username}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span>
                            {(post.profiles?.full_name || post.profiles?.username || 'U').charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {post.profiles?.full_name || post.profiles?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-2">
                          {post.title}
                        </h4>
                        {post.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {post.content}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {(post as any).post_reactions?.length || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {(post as any).post_comments?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Recommended Groups */}
          <TabsContent value="groups" className="mt-4">
            <div className="space-y-3">
              {recommendedGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Group className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>추천할 그룹이 없습니다</p>
                </div>
              ) : (
                recommendedGroups.map(group => (
                  <div key={group.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                        {group.cover_image ? (
                          <Image
                            src={group.cover_image}
                            alt={group.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Group className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {group.name}
                          </h4>
                          <Button size="sm" variant="outline">
                            가입
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {group.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.member_count}명
                          </div>
                          {group.recent_activity > 0 && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              최근 활동 {group.recent_activity}건
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Trending Posts */}
          <TabsContent value="trending" className="mt-4">
            <div className="space-y-3">
              {trendingPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>트렌딩 콘텐츠가 없습니다</p>
                </div>
              ) : (
                trendingPosts.map(post => (
                  <div key={post.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        HOT
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">
                            {post.profiles?.full_name || post.profiles?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {(post as any).recent_reactions || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {(post as any).recent_comments || 0}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            트렌딩 점수: {Math.round((post as any).trending_score || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}