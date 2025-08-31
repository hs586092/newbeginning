'use client'

import { PostCard } from './post-card'
import type { PostWithDetails } from '@/types/database.types'

interface PostListProps {
  posts: PostWithDetails[]
  currentUserId?: string
  emptyMessage?: string
}

export function PostList({ posts, currentUserId, emptyMessage = "아직 게시글이 없습니다." }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">{emptyMessage}</div>
        <p className="text-gray-400 mt-2">첫 번째 게시글을 작성해보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isOwner={currentUserId === post.user_id}
        />
      ))}
    </div>
  )
}