'use client'

import { useState, useEffect } from 'react'
import { HospitalFinder } from './hospital-finder'
import { Search, MapPin, Star, Clock, Shield, Award, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HospitalHomepage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - Hospital Focused */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                우리 아이를 위한
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                  믿을 수 있는 소아과
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
                실제 엄마들의 리뷰로 찾는, 우리 동네 최고의 소아과
              </p>
            </div>

            {/* Quick Search */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-3">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-gray-400 ml-3" />
                  <input
                    type="text"
                    placeholder="우리 동네 소아과 찾기..."
                    className="flex-1 py-4 text-lg focus:outline-none"
                    onFocus={(e) => {
                      e.target.blur()
                      window.scrollTo({ top: 600, behavior: 'smooth' })
                    }}
                  />
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl text-lg font-semibold">
                    검색
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-sm text-blue-100">등록된 병원</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">1,234</div>
                <div className="text-sm text-blue-100">엄마들의 리뷰</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">4.8★</div>
                <div className="text-sm text-blue-100">평균 만족도</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm text-blue-100">응급 정보</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            왜 우리동네 육아병원일까요?
          </h2>
          <p className="text-lg text-gray-600">
            엄마들이 직접 검증한, 믿을 수 있는 정보
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">위치 기반 검색</h3>
            <p className="text-gray-600 leading-relaxed">
              우리 집에서 가장 가까운 소아과를 실시간으로 찾아드립니다. 거리, 진료시간, 주차 가능 여부까지!
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">실제 엄마들의 리뷰</h3>
            <p className="text-gray-600 leading-relaxed">
              광고가 아닌, 실제로 방문한 엄마들의 솔직한 리뷰. 장점과 단점을 모두 확인하세요.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 영업 정보</h3>
            <p className="text-gray-600 leading-relaxed">
              지금 진료 중인 병원만 골라서 보기. 야간진료, 주말진료 정보까지 한눈에!
            </p>
          </div>
        </div>
      </div>

      {/* Main Hospital Finder */}
      <div className="bg-white py-16" id="hospital-finder">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금 바로 찾아보세요
            </h2>
            <p className="text-lg text-gray-600">
              우리 동네 최고의 소아과를 찾아드립니다
            </p>
          </div>

          <HospitalFinder />
        </div>
      </div>

      {/* Trust Signals */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">검증된 정보</h3>
              <p className="text-blue-100">실제 방문 후기만 게재됩니다</p>
            </div>
            <div>
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">신뢰할 수 있는 평가</h3>
              <p className="text-blue-100">조작 없는 리얼 별점 시스템</p>
            </div>
            <div>
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">엄마들의 커뮤니티</h3>
              <p className="text-blue-100">함께 키우는 육아 정보 공유</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            우리 아이 건강, 이제 안심하세요
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            지금 바로 가입하고 더 많은 혜택을 받아보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/community">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                커뮤니티 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
