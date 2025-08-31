'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { createComment } from '@/lib/comments/actions'
import { toast } from 'sonner'

interface CommentFormProps {
  postId: string
  isLoggedIn: boolean
}

export function CommentForm({ postId, isLoggedIn }: CommentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState('')

  async function handleSubmit(formData: FormData) {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      return
    }

    startTransition(async () => {
      const result = await createComment(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        setContent('')
        toast.success('댓글이 작성되었습니다.')
      }
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">댓글을 작성하려면 로그인하세요.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="postId" value={postId} />
        
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          rows={3}
          required
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
        />
        
        <div className="flex justify-end">
          <Button type="submit" loading={isPending} disabled={!content.trim()}>
            댓글 작성
          </Button>
        </div>
      </form>
    </div>
  )
}