'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { PostWithDetails } from '@/types/database.types'
import { useCallback, useEffect, useState } from 'react'

export function RealtimeTest() {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const loadPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading posts:', error)
        setMessage('Error loading posts: ' + error.message)
      } else {
        setPosts(data || [])
        setMessage(`Loaded ${data?.length || 0} posts`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setMessage('Unexpected error loading posts')
    }
  }, [supabase])

  useEffect(() => {
    // Load initial posts
    loadPosts()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('posts-realtime-test')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('New post detected:', payload.new)
          setMessage(`New post created: ${(payload.new as any).title}`)
          // Reload posts to get the latest data
          loadPosts()
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
          setMessage(`Post updated: ${(payload.new as any).title}`)
          loadPosts()
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
          setMessage(`Post deleted: ${(payload.old as any).title}`)
          loadPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadPosts])

  const createTestPost = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          author_name: '테스트사용자',
          title: `테스트 게시글 ${Date.now()}`,
          content: `이것은 실시간 테스트를 위한 게시글입니다. 생성 시간: ${new Date().toLocaleString()}`,
          category: 'community'
        } as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating post:', error)
        setMessage('Error creating post: ' + error.message)
      } else {
        setMessage('Test post created successfully!')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setMessage('Unexpected error creating post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Real-time Feed Test</h3>

      <div className="mb-4">
        <Button
          onClick={createTestPost}
          disabled={isLoading}
          className="mr-2"
        >
          {isLoading ? 'Creating...' : 'Create Test Post'}
        </Button>
        <Button onClick={loadPosts} variant="outline">
          Refresh Posts
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium">Posts ({posts.length})</h4>
        {posts.map((post) => (
          <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">{post.title}</div>
            <div className="text-sm text-gray-600">{post.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {post.author_name} • {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
