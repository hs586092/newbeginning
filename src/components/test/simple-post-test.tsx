'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SimplePostTest() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    console.log('Simple test form submission started')
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    
    console.log('Form data:', { title, content })
    
    startTransition(async () => {
      try {
        const response = await fetch('/api/test-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            category: 'community'
          })
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Response data:', data)
        
        setResult(`성공! 게시글 ID: ${data.id}`)
      } catch (error) {
        console.error('Test error:', error)
        setResult(`오류: ${error instanceof Error ? error.message : String(error)}`)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">📝 게시글 작성 테스트</h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input 
            id="title" 
            name="title" 
            placeholder="테스트 제목을 입력하세요" 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="content">내용</Label>
          <textarea
            id="content"
            name="content"
            placeholder="테스트 내용을 입력하세요"
            rows={4}
            required
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? '테스트 중...' : '🧪 테스트 제출'}
        </Button>
      </form>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md ${
          result.startsWith('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {result}
        </div>
      )}
    </div>
  )
}