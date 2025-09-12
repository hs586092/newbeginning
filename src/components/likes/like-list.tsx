/**
 * 좋아요 목록 컴포넌트
 * 좋아요를 누른 사용자들의 목록을 표시
 */

'use client'

import { PostLikeWithProfile } from '@/types/database.types'
import { Heart, Clock, User } from 'lucide-react'

interface LikeListProps {
  likes: PostLikeWithProfile[]
  currentUserId?: string
  postId: string
}

export function LikeList({ likes, currentUserId, postId }: LikeListProps) {
  // 좋아요를 시간순으로 정렬 (최신순)
  const sortedLikes = [...likes].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  // 현재 사용자의 좋아요와 다른 사용자들의 좋아요 분리
  const currentUserLike = sortedLikes.find(like => like.user_id === currentUserId)
  const otherLikes = sortedLikes.filter(like => like.user_id !== currentUserId)
  
  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`
    }
  }
  
  const renderLikeItem = (like: PostLikeWithProfile, isCurrentUser = false) => (
    <div 
      key={like.id} 
      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
        isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* 프로필 이미지 */}
        <div className="relative">
          {like.profiles.avatar_url ? (
            <img
              src={like.profiles.avatar_url}
              alt={like.profiles.username || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          {/* 좋아요 아이콘 오버레이 */}
          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
            <Heart className="w-3 h-3 text-white fill-current" />
          </div>
        </div>
        
        {/* 사용자 정보 */}
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">
              {like.profiles.username || 'Anonymous'}
            </h4>
            {isCurrentUser && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                나
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-500">
              {formatRelativeTime(like.created_at)}
            </span>
          </div>
        </div>
      </div>
      
      {/* 추가 정보 */}
      <div className="text-right">
        <div className="text-xs text-gray-400">
          좋아요
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="divide-y divide-gray-100">
      {/* 현재 사용자의 좋아요 (있다면 맨 위에 표시) */}
      {currentUserLike && (
        <>
          {renderLikeItem(currentUserLike, true)}
          {otherLikes.length > 0 && <div className="border-t border-gray-200"></div>}
        </>
      )}
      
      {/* 다른 사용자들의 좋아요 */}
      {otherLikes.map(like => renderLikeItem(like, false))}
      
      {/* 좋아요가 없는 경우 */}
      {likes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">아직 좋아요가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">첫 번째 좋아요를 눌러보세요!</p>
        </div>
      )}
      
      {/* 통계 정보 */}
      {likes.length > 0 && (
        <div className="p-4 bg-gray-50 text-center border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">{likes.length}</div>
              <div className="text-sm text-gray-500">총 좋아요</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {new Set(likes.map(like => like.user_id)).size}
              </div>
              <div className="text-sm text-gray-500">고유 사용자</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}