'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FollowService } from '@/lib/services/follow-service'
import { toast } from 'sonner'
import { UserPlus, UserMinus } from 'lucide-react'

interface FollowButtonProps {
  targetUserId: string
  targetUsername: string
  initialFollowState?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showText?: boolean
}

export function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowState = false,
  size = 'sm',
  variant = 'default',
  showText = true
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowState)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkFollowStatus()
  }, [targetUserId])

  const checkFollowStatus = async () => {
    try {
      const status = await FollowService.checkFollowStatus(targetUserId)
      setIsFollowing(status)
    } catch (error) {
      console.error('팔로우 상태 확인 오류:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      if (isFollowing) {
        const result = await FollowService.unfollowUser(targetUserId)
        if (result.success) {
          setIsFollowing(false)
          toast.success(`${targetUsername}님 팔로우를 취소했습니다.`)
        } else {
          toast.error(result.message)
        }
      } else {
        const result = await FollowService.followUser(targetUserId)
        if (result.success) {
          setIsFollowing(true)
          toast.success(`${targetUsername}님을 팔로우했습니다.`)
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.')
      console.error('팔로우 토글 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      size={size}
      variant={isFollowing ? 'outline' : variant}
      className={`
        ${isFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : ''}
        transition-all duration-200
      `}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {isFollowing ? (
            <>
              <UserMinus className="w-4 h-4 mr-1" />
              {showText && '팔로잉'}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              {showText && '팔로우'}
            </>
          )}
        </>
      )}
    </Button>
  )
}

// 팔로우 수 표시 컴포넌트
interface FollowCountProps {
  followersCount: number
  followingCount: number
  onClick?: (type: 'followers' | 'following') => void
}

export function FollowCount({ followersCount, followingCount, onClick }: FollowCountProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <button
        onClick={() => onClick?.('followers')}
        className="hover:text-foreground transition-colors"
      >
        <span className="font-semibold text-foreground">{followersCount}</span> 팔로워
      </button>
      <button
        onClick={() => onClick?.('following')}
        className="hover:text-foreground transition-colors"
      >
        <span className="font-semibold text-foreground">{followingCount}</span> 팔로잉
      </button>
    </div>
  )
}