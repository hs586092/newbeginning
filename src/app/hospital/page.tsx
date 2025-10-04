'use client'

import { useState, useEffect } from 'react'
import { HospitalFinder } from '@/components/hospital/hospital-finder'
import { MapPin, Stethoscope, Clock, Star } from 'lucide-react'

export default function HospitalPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">병원 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Stethoscope className="w-10 h-10" />
            <h1 className="text-3xl font-bold">우리 동네 소아과 찾기</h1>
          </div>
          <p className="text-blue-100 text-lg">
            내 주변 소아과 병원을 찾고, 실제 엄마들의 리뷰를 확인하세요
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm text-blue-100">위치 기반</span>
              </div>
              <p className="text-2xl font-bold">실시간</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm text-blue-100">엄마들의</span>
              </div>
              <p className="text-2xl font-bold">진짜 리뷰</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm text-blue-100">진료시간</span>
              </div>
              <p className="text-2xl font-bold">한눈에</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HospitalFinder />
      </div>
    </div>
  )
}
