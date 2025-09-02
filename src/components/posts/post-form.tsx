'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading'
import { createPost, updatePost } from '@/lib/posts/actions'
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

interface PostFormProps {
  post?: Post
  mode: 'create' | 'edit'
}

export function PostForm({ post, mode }: PostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [category, setCategory] = useState<string>(post?.category || 'community')

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess('')
    
    startTransition(async () => {
      try {
        const action = mode === 'create' ? createPost : updatePost
        const result = await action(formData)
        
        if (result?.error) {
          setError(result.error)
        } else {
          setSuccess(mode === 'create' ? '게시글이 성공적으로 작성되었습니다!' : '게시글이 성공적으로 수정되었습니다!')
          setTimeout(() => {
            router.push('/')
          }, 1500)
        }
      } catch (err) {
        setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
        console.error('Form submission error:', err)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6">
          {mode === 'create' ? '새 게시글 작성' : '게시글 수정'}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">오류가 발생했습니다</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-green-800">
              <p className="font-medium">성공!</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {mode === 'edit' && post && (
            <input type="hidden" name="id" value={post.id} />
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="community">커뮤니티</option>
              <option value="job_offer">구인</option>
              <option value="job_seek">구직</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              placeholder="제목을 입력하세요"
              defaultValue={post?.title}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <textarea
              id="content"
              name="content"
              rows={8}
              placeholder="내용을 입력하세요"
              defaultValue={post?.content}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical min-h-[200px]"
            />
          </div>

          {/* Job-specific fields */}
          {(category === 'job_offer' || category === 'job_seek') && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">
                {category === 'job_offer' ? '구인 정보' : '구직 정보'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">
                    {category === 'job_offer' ? '회사명' : '희망 회사/분야'}
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder={category === 'job_offer' ? '회사명' : '희망 회사나 분야'}
                    defaultValue={post?.company || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">지역</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="근무 지역"
                    defaultValue={post?.location || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">
                    {category === 'job_offer' ? '급여' : '희망 급여'}
                  </Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="연봉 또는 시급"
                    defaultValue={post?.salary || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">연락처</Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="이메일 또는 전화번호"
                    defaultValue={post?.contact || ''}
                  />
                </div>
              </div>

              {category === 'job_offer' && (
                <div className="space-y-2">
                  <Label htmlFor="deadline">마감일</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    defaultValue={post?.deadline || ''}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending || !!success}>
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {mode === 'create' ? '게시 중...' : '수정 중...'}
                </>
              ) : (
                mode === 'create' ? '게시하기' : '수정하기'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}