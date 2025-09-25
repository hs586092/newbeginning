'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, MessageCircle, Clock, Phone } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const categories = [
    '회원가입 문제',
    '서비스 이용 문의',
    '기술적 오류',
    '계정 관련',
    '신고/건의',
    '기타'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 실제 구현에서는 여기서 API 호출
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                문의가 접수되었습니다
              </h2>
              <p className="text-gray-600 mb-6">
                소중한 의견 감사합니다.<br/>
                빠른 시일 내에 답변드리겠습니다.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-pink-500 hover:bg-pink-600"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              문의하기
            </h1>
            <p className="text-gray-600">
              궁금한 점이나 건의사항이 있으시면 언제든지 연락해주세요
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 문의 정보 */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  문의 정보
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-pink-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">이메일</p>
                      <p className="text-gray-600 text-sm">support@firstbaby.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-pink-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">채팅 상담</p>
                      <p className="text-gray-600 text-sm">실시간 채팅으로 빠른 답변</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-pink-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">운영시간</p>
                      <p className="text-gray-600 text-sm">
                        평일 09:00 - 18:00<br/>
                        (주말 및 공휴일 제외)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-pink-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">응답 시간</p>
                      <p className="text-gray-600 text-sm">
                        일반 문의: 24시간 이내<br/>
                        기술 문의: 48시간 이내
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  자주 묻는 질문
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  문의하기 전에 FAQ를 확인해보세요.
                  빠른 답변을 받으실 수 있습니다.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/faq'}
                  className="w-full"
                >
                  FAQ 보기
                </Button>
              </div>
            </div>

            {/* 문의 폼 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="이름을 입력해주세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="이메일을 입력해주세요"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      문의 유형 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">문의 유형을 선택해주세요</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="문의 제목을 입력해주세요"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      placeholder="문의 내용을 자세히 작성해주세요&#10;&#10;- 문제가 발생한 상황&#10;- 기대했던 결과&#10;- 실제 결과&#10;- 오류 메시지 (있는 경우)"
                      maxLength={2000}
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {formData.message.length}/2000자
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 text-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>전송 중...</span>
                        </div>
                      ) : (
                        '문의하기'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}