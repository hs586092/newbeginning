'use client'

import { Users, Heart, MessageCircle, Star, ArrowUp, Baby, Calendar } from 'lucide-react'
import Link from 'next/link'

const STATS_DATA = [
  {
    id: 'posts',
    icon: <Heart className="w-6 h-6" />,
    label: '이번 주 새로운 이야기',
    value: '48',
    change: '+15%',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  {
    id: 'moms', 
    icon: <Users className="w-6 h-6" />,
    label: '활동중인 엄마들',
    value: '2,847',
    change: '+23%',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'satisfaction',
    icon: <Star className="w-6 h-6" />,
    label: '도움이 되었어요',
    value: '94%',
    change: '+8%',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 'community',
    icon: <MessageCircle className="w-6 h-6" />,
    label: '월간 소통',
    value: '1,234',
    change: '+18%',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  }
]

const QUICK_ACTIONS = [
  {
    id: 'write-post',
    label: '글쓰기',
    subtitle: '경험 공유',
    count: '새로운 이야기',
    icon: <Heart className="w-5 h-5" />,
    primary: true,
    bgColor: 'bg-pink-600',
    textColor: 'text-white',
    href: '/write'
  },
  {
    id: 'pregnancy',
    label: '임신 정보',
    count: '주차별 가이드',
    icon: <Baby className="w-5 h-5" />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    href: '/pregnancy'
  },
  {
    id: 'newborn',
    label: '신생아 케어',
    count: '월령별 정보',
    icon: <Users className="w-5 h-5" />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    href: '/newborn'
  },
  {
    id: 'community',
    label: '커뮤니티',
    count: '엄마들의 소통',
    icon: <MessageCircle className="w-5 h-5" />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    href: '/community'
  }
]

interface DashboardStatsProps {
  className?: string
}

export function DashboardStats({ className = '' }: DashboardStatsProps) {
  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text mb-2">
          첫돌까지 함께하는 여정
        </h2>
        <p className="text-gray-600">
          소중한 21개월을 따뜻한 엄마들과 함께 걸어가세요
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS_DATA.map((stat) => (
          <div
            key={stat.id}
            className="relative p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Background Icon */}
            <div className={`absolute top-4 left-4 p-3 ${stat.bgColor} rounded-xl`}>
              <div className={stat.textColor}>
                {stat.icon}
              </div>
            </div>

            {/* Change Indicator */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                <ArrowUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="mt-16">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>

            {/* Gradient Border Effect */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${stat.color} p-[1px]`}>
              <div className="h-full w-full bg-white rounded-2xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {QUICK_ACTIONS.map((action) => (
          <Link 
            key={action.id}
            href={action.href}
            className={`block p-4 rounded-xl transition-all duration-300 hover:shadow-md transform hover:scale-105 ${
              action.primary 
                ? `${action.bgColor} ${action.textColor}` 
                : `${action.bgColor} ${action.textColor} hover:bg-gray-200`
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${action.primary ? 'bg-white/20' : 'bg-white'}`}>
                <div className={action.primary ? 'text-white' : 'text-gray-600'}>
                  {action.icon}
                </div>
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {action.label}
                </div>
                <div className={`text-sm ${action.primary ? 'text-white/80' : 'text-gray-500'}`}>
                  {action.subtitle || action.count}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Latest Activity Preview */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-pink-700 font-semibold text-sm">민</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">민지맘</span>
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                신생아맘
              </span>
              <span className="text-gray-500 text-sm">9월 1일 14:25</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">
              신생아 수유텀 조절 성공 후기 ✨
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              생후 2개월 우리 아기가 드디어 3시간 텀으로 수유하게 되었어요! 처음엔 정말 힘들었는데 
              선배맘들의 조언 덕분에 차근차근 해낼 수 있었답니다. 같은 고민하시는 분들께 도움이 되길 바라며 경험을 공유해요.
            </p>
            
            {/* Baby Info */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Baby className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">생후 2개월 17일</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">7월 15일 출생</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">🍼 모유+분유 혼합</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">😴 밤잠 5시간</span>
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>💖</span>
                <span>24</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>8</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>156</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}