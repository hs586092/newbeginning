'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GroupsService } from '@/lib/services/groups-service'
import { GroupWithDetails } from '@/types/database.types'
import { Users, MapPin, Search, Plus, Filter, Star } from 'lucide-react'
import Image from 'next/image'

interface GroupsDirectoryProps {
  className?: string
  showMyGroups?: boolean
  currentUserId?: string
}

const categoryLabels = {
  'parenting_stage': '육아 단계별',
  'topic_based': '주제별',
  'location': '지역별',
  'special_interest': '특별 관심사'
}

const privacyLabels = {
  'public': '공개',
  'private': '비공개',
  'invite_only': '초대 전용'
}

export function GroupsDirectory({ className = '', showMyGroups = false, currentUserId }: GroupsDirectoryProps) {
  const [groups, setGroups] = useState<GroupWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [showMyGroups, selectedCategory])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const result = await GroupsService.getGroups({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery,
        userGroups: showMyGroups
      })
      setGroups(result)
    } catch (error) {
      console.error('그룹 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    const success = await GroupsService.joinGroup(groupId)
    if (success) {
      loadGroups() // Reload to update membership status
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    const success = await GroupsService.leaveGroup(groupId)
    if (success) {
      loadGroups()
    }
  }

  const handleSearch = () => {
    loadGroups()
  }

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'parenting_stage', name: '육아 단계별' },
    { id: 'topic_based', name: '주제별' },
    { id: 'location', name: '지역별' },
    { id: 'special_interest', name: '특별 관심사' }
  ]

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {showMyGroups ? '내 그룹' : '그룹 둘러보기'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
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
            <Users className="w-5 h-5" />
            {showMyGroups ? '내 그룹' : '그룹 둘러보기'}
          </CardTitle>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 그룹 만들기
          </Button>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="그룹 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showMyGroups ? '가입한 그룹이 없습니다' : '그룹을 찾을 수 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {showMyGroups
                ? '관심있는 그룹에 가입해보세요'
                : '다른 검색어나 필터를 시도해보세요'
              }
            </p>
            {!showMyGroups && (
              <Button onClick={() => setShowCreateModal(true)}>
                새 그룹 만들기
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div
                key={group.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Group header */}
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 relative">
                  {group.cover_image ? (
                    <Image
                      src={group.cover_image}
                      alt={group.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Users className="w-12 h-12 text-white/70" />
                    </div>
                  )}

                  {/* Privacy badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90">
                      {privacyLabels[group.privacy]}
                    </Badge>
                  </div>
                </div>

                {/* Group info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {group.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count}명</span>
                    </div>
                    {group.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{group.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags and category */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs mb-2">
                      {categoryLabels[group.category]}
                    </Badge>

                    {group.tags && group.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {group.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Join/Leave button */}
                  <div className="flex items-center justify-between">
                    {group.user_membership ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={group.user_membership.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {group.user_membership.status === 'active' ? '멤버' :
                           group.user_membership.status === 'pending' ? '승인 대기' : '비활성'}
                        </Badge>
                        {group.user_membership.role !== 'member' && (
                          <Badge variant="outline" className="text-xs">
                            {group.user_membership.role}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.privacy === 'invite_only'}
                      >
                        {group.privacy === 'invite_only' ? '초대 전용' : '가입'}
                      </Button>
                    )}

                    {/* Leave button for members */}
                    {group.user_membership?.status === 'active' && group.user_membership.role !== 'owner' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLeaveGroup(group.id)}
                      >
                        나가기
                      </Button>
                    )}
                  </div>

                  {/* Recent posts preview */}
                  {group.recent_posts && group.recent_posts.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">최근 게시글</div>
                      <div className="space-y-1">
                        {group.recent_posts.slice(0, 2).map(groupPost => (
                          <div key={groupPost.post_id} className="text-xs">
                            <span className="font-medium line-clamp-1">
                              {groupPost.posts.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}