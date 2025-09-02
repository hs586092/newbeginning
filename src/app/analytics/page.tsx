'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, Briefcase, 
  DollarSign, MapPin, Clock, Filter, Download, RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface TrendData {
  category: string
  current: number
  previous: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

const MARKET_TRENDS: TrendData[] = [
  {
    category: 'React Developer',
    current: 2847,
    previous: 2650,
    change: 7.4,
    trend: 'up'
  },
  {
    category: 'Node.js Developer', 
    current: 1923,
    previous: 1876,
    change: 2.5,
    trend: 'up'
  },
  {
    category: 'Python Developer',
    current: 1654,
    previous: 1720,
    change: -3.8,
    trend: 'down'
  },
  {
    category: 'DevOps Engineer',
    current: 892,
    previous: 825,
    change: 8.1,
    trend: 'up'
  }
]

const SALARY_RANGES = [
  { position: 'Junior Developer (0-2년)', min: 3000, max: 4500, avg: 3750, change: 5.2 },
  { position: 'Mid-level Developer (2-5년)', min: 4500, max: 7000, avg: 5750, change: 7.1 },
  { position: 'Senior Developer (5년+)', min: 6500, max: 10000, avg: 8250, change: 8.3 },
  { position: 'Tech Lead', min: 8000, max: 12000, avg: 10000, change: 6.8 }
]

const REGIONAL_DATA = [
  { region: '서울', jobs: 3240, avgSalary: 6800, growth: 12.3 },
  { region: '경기', jobs: 1850, avgSalary: 5900, growth: 8.7 },
  { region: '부산', jobs: 420, avgSalary: 4800, growth: 15.2 },
  { region: '대구', jobs: 280, avgSalary: 4500, growth: 9.1 },
  { region: '기타', jobs: 650, avgSalary: 4200, growth: 6.4 }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      default: return <div className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
                <span>홈으로</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">실시간 시장 분석</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>새로고침</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>다운로드</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">총 채용공고</p>
                <p className="text-3xl font-bold text-gray-900">6,442</p>
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">활성 구직자</p>
                <p className="text-3xl font-bold text-gray-900">15,628</p>
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+8.7%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">평균 연봉</p>
                <p className="text-3xl font-bold text-gray-900">5,940</p>
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+6.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">매칭 성공률</p>
                <p className="text-3xl font-bold text-gray-900">78.5%</p>
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">분석 필터</h3>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">최근 1주</option>
                <option value="month">최근 1개월</option>
                <option value="quarter">최근 3개월</option>
                <option value="year">최근 1년</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직군</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="frontend">프론트엔드</option>
                <option value="backend">백엔드</option>
                <option value="fullstack">풀스택</option>
                <option value="devops">DevOps</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">전국</option>
                <option value="seoul">서울</option>
                <option value="gyeonggi">경기</option>
                <option value="busan">부산</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Market Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-6">인기 직무 트렌드</h3>
            <div className="space-y-4">
              {MARKET_TRENDS.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{trend.category}</span>
                      <div className={`flex items-center space-x-1 ${getTrendColor(trend.trend)}`}>
                        {getTrendIcon(trend.trend)}
                        <span className="text-sm font-medium">
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <span>현재: {trend.current.toLocaleString()}개</span>
                      <span>이전: {trend.previous.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Analysis */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-6">지역별 분석</h3>
            <div className="space-y-4">
              {REGIONAL_DATA.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">{region.region}</span>
                      <div className="text-sm text-gray-600">
                        {region.jobs.toLocaleString()}개 채용공고
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{region.avgSalary.toLocaleString()}만원</div>
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{region.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Analysis */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-6">연봉 분석</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SALARY_RANGES.map((salary, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 text-sm">{salary.position}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">최소</span>
                    <span className="font-medium">{salary.min.toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">평균</span>
                    <span className="font-bold text-blue-600">{salary.avg.toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">최대</span>
                    <span className="font-medium">{salary.max.toLocaleString()}만원</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 text-sm pt-2 border-t">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{salary.change}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">💡 시장 인사이트</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium">성장세 직군</span>
              </div>
              <p className="text-sm text-gray-600">
                DevOps Engineer와 React Developer의 수요가 크게 증가하고 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium">연봉 상승</span>
              </div>
              <p className="text-sm text-gray-600">
                전체 직군에서 평균 6.2% 연봉 상승폭을 보이고 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium">채용 속도</span>
              </div>
              <p className="text-sm text-gray-600">
                평균 채용 기간이 3주로 단축되어 빠른 채용이 이루어지고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}