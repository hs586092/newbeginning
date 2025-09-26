'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Heart, Baby, Clock, User, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Question {
  id: string
  question: string
  nickname: string
  category: 'newborn' | 'feeding' | 'sleep' | 'development' | 'health' | 'general'
  created_at: string
  likes: number
  replies: number
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    question: '신생아 수유텀이 너무 짧아서 힘들어요. 2시간마다 먹는게 정상인가요?',
    nickname: '토끼 엄마',
    category: 'feeding',
    created_at: '2024-01-15T10:30:00Z',
    likes: 12,
    replies: 8
  },
  {
    id: '2',
    question: '생후 3주차인데 밤에 자주 깨요. 언제쯤 길게 잘 수 있을까요?',
    nickname: '코알라 엄마',
    category: 'sleep',
    created_at: '2024-01-14T20:15:00Z',
    likes: 15,
    replies: 6
  },
  {
    id: '3',
    question: '첫 이유식 언제 시작하는게 좋을까요? 5개월? 6개월?',
    nickname: '판다 엄마',
    category: 'feeding',
    created_at: '2024-01-14T15:45:00Z',
    likes: 23,
    replies: 12
  },
]

const ANIMAL_NAMES = ['토끼', '코알라', '판다', '고양이', '강아지', '햄스터', '다람쥐', '여우', '사슴', '펭귄']
const CATEGORIES = [
  { id: 'newborn', name: '신생아', emoji: '👶', color: 'bg-pink-100 text-pink-800' },
  { id: 'feeding', name: '수유/이유식', emoji: '🍼', color: 'bg-blue-100 text-blue-800' },
  { id: 'sleep', name: '수면', emoji: '😴', color: 'bg-purple-100 text-purple-800' },
  { id: 'development', name: '발달', emoji: '🧸', color: 'bg-green-100 text-green-800' },
  { id: 'health', name: '건강', emoji: '🏥', color: 'bg-red-100 text-red-800' },
  { id: 'general', name: '일반', emoji: '💭', color: 'bg-gray-100 text-gray-800' }
]

export default function AnonymousQA() {
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS)
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [nickname] = useState(() => `${ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)]} 엄마`)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return

    setIsSubmitting(true)

    // In real implementation, this would save to database
    const question: Question = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      nickname,
      category: selectedCategory as any,
      created_at: new Date().toISOString(),
      likes: 0,
      replies: 0
    }

    setQuestions([question, ...questions])
    setNewQuestion('')

    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return `${Math.floor(diffInMinutes / 1440)}일 전`
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[5]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤗 익명 육아 고민 나누기
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            혼자서 고민하지 마세요. 익명으로 편하게 질문하고 따뜻한 답변을 받아보세요.
            <br />
            <span className="text-sm text-purple-600 font-medium">
              현재 베타 버전 • 정식 오픈 시 더 많은 기능이 추가됩니다
            </span>
          </p>
        </div>

        {/* Question Form */}
        <Card className="mb-8 bg-gradient-to-br from-white to-pink-50/50 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-600" />
              질문하기
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                {nickname}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === category.id
                        ? category.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.emoji} {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="궁금한 것이 있으시면 익명으로 편하게 질문해주세요. 선배맘들이 따뜻하게 답변해드릴게요."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {newQuestion.length}/500
              </div>
            </div>

            <Button
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  등록 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  질문 등록하기
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            최근 질문들
            <Badge variant="secondary">{questions.length}</Badge>
          </h2>

          {questions.map((question) => {
            const categoryInfo = getCategoryInfo(question.category)
            return (
              <Card key={question.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{question.nickname}</span>
                        <Badge className={categoryInfo.color}>
                          {categoryInfo.emoji} {categoryInfo.name}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(question.created_at)}
                        </div>
                      </div>

                      <p className="text-gray-800 leading-relaxed mb-4">
                        {question.question}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                          <Heart className="w-4 h-4" />
                          {question.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          답변 {question.replies}개
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Coming Soon Notice */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="text-center py-8">
            <Baby className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              더 많은 기능이 곧 추가됩니다!
            </h3>
            <p className="text-purple-700 text-sm mb-4">
              • 전문가 답변 • 실시간 채팅 • 월령별 가이드 • 맘카페 게시판
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              📧 오픈 알림 받기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}