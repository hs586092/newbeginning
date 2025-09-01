'use client'

import { Users, Briefcase, MessageCircle, Star, ArrowUp } from 'lucide-react'

const STATS_DATA = [
  {
    id: 'posts',
    icon: <Briefcase className="w-6 h-6" />,
    label: '이번 주 신규 구인',
    value: '24',
    change: '+12%',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'jobseekers', 
    icon: <Users className="w-6 h-6" />,
    label: '활성 구직자',
    value: '156',
    change: '+8%',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    id: 'success-rate',
    icon: <Star className="w-6 h-6" />,
    label: '매칭 성공률',
    value: '78%',
    change: '+5%',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 'community',
    icon: <MessageCircle className="w-6 h-6" />,
    label: '전체 활동수',
    value: '92',
    change: '+15%',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  }
]

const QUICK_ACTIONS = [
  {
    id: 'job-post',
    label: '채용',
    subtitle: '모든 곳',
    count: '24개',
    icon: <Briefcase className="w-5 h-5" />,
    primary: true,
    bgColor: 'bg-blue-600',
    textColor: 'text-white'
  },
  {
    id: 'job-search',
    label: '구인',
    count: '24개',
    icon: <Briefcase className="w-5 h-5" />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
  },
  {
    id: 'community-search',
    label: '구직',
    count: '156개',
    icon: <Users className="w-5 h-5" />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
  },
  {
    id: 'community',
    label: '커뮤니티',
    count: '89개',
    icon: <MessageCircle className="w-5 h-5" />,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
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
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          BUDICONNECTS 커뮤니티
        </h2>
        <p className="text-gray-600">
          새로운 기회를 발견하고, 커뮤니티와 함께 성장하세요
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
          <button
            key={action.id}
            className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md transform hover:scale-105 ${
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
          </button>
        ))}
      </div>

      {/* Latest Activity Preview */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-semibold text-sm">H</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">hyeonsoo</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                구인
              </span>
              <span className="text-gray-500 text-sm">8월 31일 08:05</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">
              React 개발자 채용합니다 (경력 2-5년)
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              저희 스타트업에서 React 개발자를 모집합니다. 프론트엔드 개발 경험이 2-5년 있으신 분을 찾고 있으며, 
              TypeScript와 Next.js 경험이 있으시면 우대합니다.
            </p>
            
            {/* Job Details */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">(주)테크스타트업</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">서울 강남구</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">💰 연봉 4500-6500만원</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">📅 2/15까지</span>
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>♥️</span>
                <span>8</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>0</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>127</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}