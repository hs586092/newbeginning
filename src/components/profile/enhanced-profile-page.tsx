'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserProfileCard } from '@/components/social/user-profile-card'
import { ActivityFeed } from '@/components/social/activity-feed'
import { FollowService } from '@/lib/services/follow-service'
import { ActivityService } from '@/lib/services/activity-service'
import { UserProfile, FollowWithProfile } from '@/types/database.types'
import {
  MapPin, Calendar, Baby, Heart, MessageCircle, FileText,
  Users, Activity, Settings, Edit
} from 'lucide-react'
import { formatDate } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

interface EnhancedProfilePageProps {
  userId: string
  isOwnProfile?: boolean
}

const parentingStageLabels = {
  expecting: '임신 중',
  newborn: '신생아',
  infant: '영아',
  toddler: '유아',
  preschool: '학령전기',
  school_age: '학령기',
  teen: '청소년',
  adult_child: '성인 자녀'
}

const parentingRoleLabels = {
  mother: '엄마',
  father: '아빠',
  guardian: '보호자',
  caregiver: '돌봄이',
  grandparent: '조부모',
  expecting_parent: '예비 부모'
}

export function EnhancedProfilePage({ userId, isOwnProfile = false }: EnhancedProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [followers, setFollowers] = useState<FollowWithProfile[]>([])
  const [following, setFollowing] = useState<FollowWithProfile[]>([])
  const [activityStats, setActivityStats] = useState({
    total: 0,
    posts_created: 0,
    comments_added: 0,
    posts_liked: 0,
    users_followed: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    try {
      setLoading(true)

      // 프로필 정보 로드
      const profileData = await FollowService.getUserProfile(userId)
      setProfile(profileData)

      // 팔로워/팔로잉 목록 로드
      const [followersData, followingData] = await Promise.all([
        FollowService.getFollowers(userId, 10, 0),
        FollowService.getFollowing(userId, 10, 0)
      ])

      setFollowers(followersData)
      setFollowing(followingData)

      // 활동 통계 로드
      const stats = await ActivityService.getActivityStats(userId)
      setActivityStats(stats)
    } catch (error) {
      console.error('프로필 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-16" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 프로필 헤더 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* 프로필 이미지 */}
              <div className="relative">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${profile.full_name || profile.username} 프로필`}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(profile.full_name || profile.username)?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {profile.full_name || profile.username}
                    </h1>
                    {profile.full_name && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isOwnProfile && profile && (
                      <UserProfileCard
                        profile={profile}
                        showFollowButton={true}
                        compact={false}
                      />
                    )}
                    {isOwnProfile && (
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        프로필 수정
                      </Button>
                    )}
                  </div>
                </div>

                {/* 육아 정보 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.parenting_stage && (
                    <Badge variant="secondary">
                      <Baby className="w-3 h-3 mr-1" />
                      {parentingStageLabels[profile.parenting_stage]}
                    </Badge>
                  )}
                  {profile.parenting_role && (
                    <Badge variant="outline">
                      <Heart className="w-3 h-3 mr-1" />
                      {parentingRoleLabels[profile.parenting_role]}
                    </Badge>
                  )}
                </div>

                {/* 위치 및 가입일 */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(new Date(profile.created_at), 'yyyy년 MM월 가입', { locale: ko })}</span>
                  </div>
                </div>

                {/* 팔로우 수 */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setActiveTab('followers')}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-foreground">{profile.followers_count}</span>
                    <span className="text-muted-foreground ml-1">팔로워</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('following')}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-foreground">{profile.following_count}</span>
                    <span className="text-muted-foreground ml-1">팔로잉</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              개요
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              활동
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              팔로워 ({profile.followers_count})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              팔로잉 ({profile.following_count})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 활동 통계 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">활동 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">작성한 게시글</span>
                      </div>
                      <Badge variant="secondary">{activityStats.posts_created}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">작성한 댓글</span>
                      </div>
                      <Badge variant="secondary">{activityStats.comments_added}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">받은 좋아요</span>
                      </div>
                      <Badge variant="secondary">{activityStats.posts_liked}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">팔로우한 사용자</span>
                      </div>
                      <Badge variant="secondary">{activityStats.users_followed}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 육아 정보 상세 */}
              {profile.baby_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">육아 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.baby_info.child_count && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">자녀 수</span>
                          <Badge variant="outline">{profile.baby_info.child_count}명</Badge>
                        </div>
                      )}
                      {profile.baby_info.due_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">예정일</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(new Date(profile.baby_info.due_date), 'yyyy.MM.dd')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <ActivityFeed variant="public" maxHeight="600px" />
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            {followers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>팔로워가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followers.map((follow) => (
                  <UserProfileCard
                    key={follow.id}
                    profile={{
                      ...follow.follower_profile,
                      id: follow.follower_id,
                      created_at: follow.created_at,
                      followers_count: 0,
                      following_count: 0,
                      is_following: false
                    }}
                    compact={false}
                    showFollowButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {following.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>팔로잉하는 사용자가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {following.map((follow) => (
                  <UserProfileCard
                    key={follow.id}
                    profile={{
                      ...follow.following_profile,
                      id: follow.following_id,
                      created_at: follow.created_at,
                      followers_count: 0,
                      following_count: 0,
                      is_following: true
                    }}
                    compact={false}
                    showFollowButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}