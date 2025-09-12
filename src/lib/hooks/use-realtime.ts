'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client' // Use Realtime-enabled client

export function useRealtimeSubscription() {
  const router = useRouter()

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
        (payload) => {
          console.log('New post created:', payload.new)
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
        (payload) => {
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
        (payload) => {
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
        (payload) => {
          console.log('New comment created:', payload.new)
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
        (payload) => {
          console.log('Comment deleted:', payload.old)
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
        (payload) => {
          console.log('Like added:', payload.new)
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
        (payload) => {
          console.log('Like removed:', payload.old)
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
  }, [router])
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