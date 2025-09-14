'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client' // Use Realtime-enabled client
import { useNotifications } from '@/contexts/notification-context'
import { useAuth } from '@/contexts/auth-context'

export function useRealtimeSubscription() {
  const router = useRouter()
  const { addNotification, showToast, updateRealtimeCount } = useNotifications()
  const { user } = useAuth()

  // 게시글 카운트 업데이트 함수
  const updatePostCounts = useCallback(async (postId: string) => {
    try {
      // 댓글 수 조회
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      // 좋아요 수 조회
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      if (commentsCount !== null) {
        updateRealtimeCount(postId, 'comments', commentsCount)
      }
      if (likesCount !== null) {
        updateRealtimeCount(postId, 'likes', likesCount)
      }
    } catch (error) {
      console.error('Error updating post counts:', error)
    }
  }, [updateRealtimeCount])

  useEffect(() => {
    // Subscribe to posts changes
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          console.log('New post created:', payload.new)

          // 자신의 게시글이 아닌 경우에만 알림
          if (user?.id && payload.new.user_id !== user.id) {
            addNotification({
              type: 'post',
              title: '새 게시글',
              message: `${payload.new.title || '새 게시글이 작성되었습니다'}`,
              actionUrl: `/posts/${payload.new.id}`,
              data: {
                postId: payload.new.id,
                userId: payload.new.user_id
              }
            })

            showToast({
              type: 'info',
              title: '새 게시글',
              message: payload.new.title || '새 게시글이 작성되었습니다',
              duration: 4000
            })
          }

          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          console.log('Post updated:', payload.new)
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          console.log('Post deleted:', payload.old)
          router.refresh()
        }
      )
      .subscribe()

    // Subscribe to comments changes
    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        async (payload: any) => {
          console.log('New comment created:', payload.new)

          // 댓글 카운트 업데이트
          await updatePostCounts(payload.new.post_id)

          // 자신의 댓글이 아닌 경우에만 알림
          if (user?.id && payload.new.user_id !== user.id) {
            // 게시글 정보 가져오기
            const { data: post } = await supabase
              .from('posts')
              .select('title, user_id')
              .eq('id', payload.new.post_id)
              .single()

            // 자신의 게시글에 댓글이 달린 경우 알림
            if (post && post.user_id === user.id) {
              addNotification({
                type: 'comment',
                title: '새 댓글',
                message: '내 게시글에 댓글이 달렸습니다',
                actionUrl: `/posts/${payload.new.post_id}#comment-${payload.new.id}`,
                data: {
                  postId: payload.new.post_id,
                  commentId: payload.new.id,
                  userId: payload.new.user_id
                }
              })

              showToast({
                type: 'success',
                title: '새 댓글',
                message: '내 게시글에 댓글이 달렸습니다',
                duration: 5000
              })
            }
          }

          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments'
        },
        async (payload: any) => {
          console.log('Comment deleted:', payload.old)

          // 댓글 카운트 업데이트
          await updatePostCounts(payload.old.post_id)

          router.refresh()
        }
      )
      .subscribe()

    // Subscribe to likes changes
    const likesChannel = supabase
      .channel('likes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes'
        },
        async (payload: any) => {
          console.log('Like added:', payload.new)

          // 좋아요 카운트 업데이트
          await updatePostCounts(payload.new.post_id)

          // 자신의 좋아요가 아닌 경우에만 알림
          if (user?.id && payload.new.user_id !== user.id) {
            // 게시글 정보 가져오기
            const { data: post } = await supabase
              .from('posts')
              .select('title, user_id')
              .eq('id', payload.new.post_id)
              .single()

            // 자신의 게시글에 좋아요가 눌린 경우 알림
            if (post && post.user_id === user.id) {
              addNotification({
                type: 'like',
                title: '좋아요',
                message: '내 게시글을 좋아합니다',
                actionUrl: `/posts/${payload.new.post_id}`,
                data: {
                  postId: payload.new.post_id,
                  userId: payload.new.user_id
                }
              })

              showToast({
                type: 'success',
                title: '👍 좋아요',
                message: '내 게시글을 좋아합니다',
                duration: 3000
              })
            }
          }

          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'likes'
        },
        async (payload: any) => {
          console.log('Like removed:', payload.old)

          // 좋아요 카운트 업데이트
          await updatePostCounts(payload.old.post_id)

          router.refresh()
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(postsChannel)
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(likesChannel)
    }
  }, [router, user, addNotification, showToast, updatePostCounts])
}

export function usePostRealtime(postId: string) {
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel(`post-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, router])
}