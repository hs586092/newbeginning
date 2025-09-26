'use client'

import { useState } from 'react'
import { X, Mail, Bell } from 'lucide-react'
import { EmailCollection } from '@/components/email/email-collection'

export function ServiceReadyBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [showEmailForm, setShowEmailForm] = useState(false)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 animate-bounce" />
            <div className="text-sm">
              <span className="font-medium">🚀 서비스 준비 중!</span>
              <span className="ml-2">완료되면 가장 먼저 알려드릴게요</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded-full transition-colors"
            >
              📧 알림받기
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="배너 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 이메일 수집 폼 (토글) */}
      {showEmailForm && (
        <div className="bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-md mx-auto p-4">
            <EmailCollection />
          </div>
        </div>
      )}
    </div>
  )
}