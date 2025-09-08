'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading'
import { createPost, updatePost } from '@/lib/posts/actions'
import { AlertCircle, CheckCircle, Hash, Baby, HelpCircle, Image, Calendar } from 'lucide-react'
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
  const [isQuestion, setIsQuestion] = useState<boolean>(post?.is_question || false)
  const [babyMonth, setBabyMonth] = useState<number | undefined>(post?.baby_month || undefined)
  const [tags, setTags] = useState<string>(post?.tags ? post.tags.join(', ') : '')
  const [mood, setMood] = useState<string>(post?.mood || '')
  const [titleLength, setTitleLength] = useState(post?.title?.length || 0)
  const [contentLength, setContentLength] = useState(post?.content?.length || 0)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess('')
    
    // Process tags
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    
    // Add additional fields to form data
    if (isQuestion) formData.append('is_question', 'true')
    if (babyMonth !== undefined) formData.append('baby_month', babyMonth.toString())
    if (tagArray.length > 0) formData.append('tags', JSON.stringify(tagArray))
    if (mood) formData.append('mood', mood)
    
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

          {/* Question Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_question"
                checked={isQuestion}
                onChange={(e) => setIsQuestion(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <Label htmlFor="is_question" className="text-blue-800 font-medium cursor-pointer">
                질문글로 작성하기
              </Label>
            </div>
            {isQuestion && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                💬 다른 양육자들의 도움을 받을 수 있어요
              </span>
            )}
          </div>

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
              <option value="expecting">🤰 예비양육자 (임신~출산)</option>
              <option value="newborn">👶 신생아 양육자 (0-6개월)</option>
              <option value="toddler">🧒 성장기 양육자 (7개월-5세)</option>
              <option value="expert">👩‍👧‍👦 선배 양육자 (경험공유)</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">제목</Label>
              <span className={`text-sm ${
                titleLength > 200 ? 'text-red-500' : titleLength > 180 ? 'text-orange-500' : 'text-gray-500'
              }`}>
                {titleLength}/200
              </span>
            </div>
            <Input
              id="title"
              name="title"
              placeholder={isQuestion ? "어떤 것이 궁금하신가요?" : "제목을 입력하세요"}
              defaultValue={post?.title}
              onChange={(e) => setTitleLength(e.target.value.length)}
              maxLength={200}
              required
              className={titleLength > 200 ? 'border-red-300 focus:border-red-500' : ''}
            />
          </div>

          {/* Baby Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="baby_month" className="flex items-center space-x-2">
              <Baby className="w-4 h-4" />
              <span>아이 개월수 (선택사항)</span>
            </Label>
            <select
              id="baby_month"
              value={babyMonth || ''}
              onChange={(e) => setBabyMonth(e.target.value ? parseInt(e.target.value) : undefined)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">개월수 선택 안함</option>
              <option value="0">임신 중</option>
              {Array.from({ length: 25 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '신생아 (0개월)' : `${i}개월`}
                </option>
              ))}
            </select>
            {babyMonth !== undefined && (
              <p className="text-xs text-gray-600">
                💡 개월수를 입력하면 비슷한 시기의 양육자들이 더 쉽게 찾을 수 있어요
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>태그 (선택사항)</span>
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 이유식, 수면교육, 발달 (쉼표로 구분)"
              className=""
            />
            <p className="text-xs text-gray-600">
              🏷️ 태그를 추가하면 관련 글을 더 쉽게 찾을 수 있어요 (최대 5개)
            </p>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <Label htmlFor="mood">현재 기분 (선택사항)</Label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">기분 선택 안함</option>
              <option value="happy">😊 기쁨</option>
              <option value="worried">😟 걱정</option>
              <option value="tired">😴 피곤</option>
              <option value="grateful">🙏 감사</option>
              <option value="confused">😕 고민</option>
              <option value="excited">🤗 설렘</option>
              <option value="peaceful">😌 평온</option>
            </select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">내용</Label>
              <span className={`text-sm ${
                contentLength > 10000 ? 'text-red-500' : contentLength > 8000 ? 'text-orange-500' : 'text-gray-500'
              }`}>
                {contentLength.toLocaleString()}자
              </span>
            </div>
            <textarea
              id="content"
              name="content"
              rows={10}
              placeholder={isQuestion ? 
                "궁금한 점을 자세히 설명해주세요.\n\n예:\n• 현재 상황은 어떤가요?\n• 어떤 부분이 가장 궁금하신가요?\n• 시도해본 방법이 있나요?" :
                "내용을 입력하세요...\n\n💡 팁:\n• 구체적인 상황을 설명해주세요\n• 사진을 첨부하면 더 생생한 소통이 가능해요\n• 다른 양육자들에게 도움이 될 만한 정보를 공유해주세요"
              }
              defaultValue={post?.content}
              onChange={(e) => setContentLength(e.target.value.length)}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical min-h-[250px]"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>💡 따뜻하고 정중한 언어로 소통해주세요</span>
              <span>{contentLength < 10 ? '내용을 더 자세히 작성해주세요' : '✓'}</span>
            </div>
          </div>


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