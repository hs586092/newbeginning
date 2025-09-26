'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function EmailCollection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('올바른 이메일 주소를 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // 🚀 Supabase waitlist 저장 (지연 로딩)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = await createClient()

      const { error } = await supabase
        .from('waitlist')
        .insert([{
          email: email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
          source: 'homepage'
        }])

      if (error) {
        // 중복 이메일 처리
        if (error.code === '23505') {
          toast.success('이미 알림 신청이 완료되었습니다! 📧')
        } else {
          throw error
        }
      } else {
        toast.success('오픈 알림을 보내드릴게요! 🎉')
      }

      setIsSubscribed(true)
      setEmail('')

    } catch (error: any) {
      console.error('Waitlist subscription error:', error)
      toast.error('잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          알림 신청 완료! ✨
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          서비스 오픈 시 가장 먼저 알려드리겠습니다.
        </p>

        {/* 바이럴 공유 버튼 추가 */}
        <div className="mt-4 pt-4 border-t border-pink-200">
          <p className="text-sm text-purple-700 font-medium mb-3">
            🎁 친구 초대하면 특별 혜택이 있어요!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                const shareText = '🍼 첫돌까지 육아맘들 커뮤니티가 곧 오픈합니다! 함께 성장하는 육아 커뮤니티에서 만나요 💕 https://fortheorlingas.com'
                navigator.clipboard.writeText(shareText)
                toast.success('링크가 복사되었습니다! 📋')
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
              📱 카톡으로 공유
            </button>
            <button
              onClick={() => {
                const instagramText = '🍼 첫돌까지 육아맘들 커뮤니티 오픈 예정!\n\n👶 0-12개월 맘들의 따뜻한 커뮤니티\n💕 함께 성장하는 육아 여정\n✨ 선착순 알림 신청 중\n\n👉 fortheorlingas.com'
                navigator.clipboard.writeText(instagramText)
                toast.success('인스타 텍스트가 복사되었어요! 📸')
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
              📸 인스타 공유
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="text-center mb-4">
        <Mail className="w-8 h-8 text-pink-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          오픈 알림 받기
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          서비스 준비가 완료되면 가장 먼저 알려드려요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isSubmitting}
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting || !email}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '알림받기'
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          스팸 메일은 절대 보내지 않습니다. 언제든 구독 해지 가능해요.
        </p>
      </form>
    </div>
  )
}