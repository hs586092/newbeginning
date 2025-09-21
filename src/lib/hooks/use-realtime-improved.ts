'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { realtimeManager } from '@/lib/realtime/connection-manager'
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
    // Only subscribe if user is authenticated
    if (!user?.id) {
      console.log('User not authenticated, skipping realtime subscriptions')
      return
    }

    const setupRealtimeSubscriptions = async () => {
      try {
        console.log('Setting up realtime subscriptions for user:', user.id)

        // Subscribe to posts changes
        const postsChannel = await realtimeManager.createChannel('posts-changes')
        if (!postsChannel) {
          console.warn('Failed to create posts channel')
          return
        }

        postsChannel
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
          .subscribe((status) => {
            console.log('Posts channel status:', status)
          })

        // Subscribe to comments changes
        const commentsChannel = await realtimeManager.createChannel('comments-changes')
        if (!commentsChannel) {
          console.warn('Failed to create comments channel')
          return
        }

        commentsChannel
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
                try {
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
                } catch (error) {
                  console.error('Error processing comment notification:', error)
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
          .subscribe((status) => {
            console.log('Comments channel status:', status)
          })

        // Subscribe to likes changes
        const likesChannel = await realtimeManager.createChannel('likes-changes')
        if (!likesChannel) {
          console.warn('Failed to create likes channel')
          return
        }

        likesChannel
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
                try {
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
                } catch (error) {
                  console.error('Error processing like notification:', error)
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
          .subscribe((status) => {
            console.log('Likes channel status:', status)
          })

        console.log('All realtime subscriptions set up successfully')

      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error)
      }
    }

    setupRealtimeSubscriptions()

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscriptions')
      realtimeManager.removeChannel('posts-changes')
      realtimeManager.removeChannel('comments-changes')
      realtimeManager.removeChannel('likes-changes')
    }
  }, [router, user, addNotification, showToast, updatePostCounts])
}

export function usePostRealtime(postId: string) {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id || !postId) {
      return
    }

    const setupPostRealtime = async () => {
      try {
        const channelName = `post-${postId}`
        const channel = await realtimeManager.createChannel(channelName)

        if (!channel) {
          console.warn(`Failed to create channel for post ${postId}`)
          return
        }

        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'comments',
              filter: `post_id=eq.${postId}`
            },
            () => {
              console.log(`Comments changed for post ${postId}`)
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
              console.log(`Likes changed for post ${postId}`)
              router.refresh()
            }
          )
          .subscribe((status) => {
            console.log(`Post ${postId} channel status:`, status)
          })

      } catch (error) {
        console.error(`Error setting up realtime for post ${postId}:`, error)
      }
    }

    setupPostRealtime()

    return () => {
      realtimeManager.removeChannel(`post-${postId}`)
    }
  }, [postId, router, user])
}