'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FollowButton, FollowCount } from './follow-button'
import { UserProfile } from '@/types/database.types'
import { MapPin, Baby, Heart } from 'lucide-react'

interface UserProfileCardProps {
  profile: UserProfile
  onFollowersClick?: () => void
  onFollowingClick?: () => void
  showFollowButton?: boolean
  compact?: boolean
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

export function UserProfileCard({
  profile,
  onFollowersClick,
  onFollowingClick,
  showFollowButton = true,
  compact = false
}: UserProfileCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleFollowCountClick = (type: 'followers' | 'following') => {
    if (type === 'followers') {
      onFollowersClick?.()
    } else {
      onFollowingClick?.()
    }
  }

  return (
    <Card className={`transition-shadow hover:shadow-md ${compact ? 'p-3' : 'p-4'}`}>
      <CardContent className="p-0">
        <div className="flex items-start gap-4">
          {/* 프로필 이미지 */}
          <div className={`relative ${compact ? 'w-12 h-12' : 'w-16 h-16'} flex-shrink-0`}>
            {profile.avatar_url && !imageError ? (
              <Image
                src={profile.avatar_url}
                alt={`${profile.full_name || profile.username} 프로필`}
                fill
                className="rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`
                ${compact ? 'w-12 h-12' : 'w-16 h-16'}
                rounded-full bg-gradient-to-br from-blue-400 to-purple-500
                flex items-center justify-center text-white font-semibold
                ${compact ? 'text-sm' : 'text-lg'}
              `}>
                {(profile.full_name || profile.username)?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-foreground truncate ${compact ? 'text-sm' : 'text-base'}`}>
                  {profile.full_name || profile.username}
                </h3>
                {profile.full_name && (
                  <p className={`text-muted-foreground truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                    @{profile.username}
                  </p>
                )}
              </div>

              {showFollowButton && (
                <FollowButton
                  targetUserId={profile.id}
                  targetUsername={profile.username}
                  initialFollowState={profile.is_following}
                  size={compact ? 'sm' : 'md'}
                  showText={!compact}
                />
              )}
            </div>

            {!compact && (
              <>
                {/* 육아 정보 배지 */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.parenting_stage && (
                    <Badge variant="secondary" className="text-xs">
                      <Baby className="w-3 h-3 mr-1" />
                      {parentingStageLabels[profile.parenting_stage]}
                    </Badge>
                  )}
                  {profile.parenting_role && (
                    <Badge variant="outline" className="text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      {parentingRoleLabels[profile.parenting_role]}
                    </Badge>
                  )}
                </div>

                {/* 위치 정보 */}
                {profile.location && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* 팔로우 수 */}
                <div className="mt-3">
                  <FollowCount
                    followersCount={profile.followers_count}
                    followingCount={profile.following_count}
                    onClick={handleFollowCountClick}
                  />
                </div>
              </>
            )}

            {compact && (
              <div className="flex items-center gap-2 mt-1">
                {profile.parenting_stage && (
                  <Badge variant="secondary" className="text-xs">
                    {parentingStageLabels[profile.parenting_stage]}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  팔로워 {profile.followers_count}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}