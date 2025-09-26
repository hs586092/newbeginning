'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Mail, Share2, Clock, Target } from 'lucide-react'

interface GrowthStats {
  total_signups: number
  last_24h: number
  last_7days: number
  last_30days: number
  weekly_growth_rate: number
  referral_rate: number
  from_landing: number
  from_social: number
  from_referral: number
  avg_clicks: number
  avg_opens: number
}

interface HourlyStats {
  hour: string
  signups: number
  unique_sources: number
}

interface TopReferrer {
  referrer_email: string
  referral_code: string
  total_referred: number
  referred_emails: string[]
  last_referral_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<GrowthStats | null>(null)
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([])
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()

    // Refresh every 30 seconds for real-time feeling
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = await createClient()

      // Load growth stats
      const { data: growthData, error: growthError } = await supabase
        .from('waitlist_growth_stats')
        .select('*')
        .single()

      if (growthError) {
        console.error('Growth stats error:', growthError)
        // If views don't exist, load basic stats
        const { data: basicStats, error: basicError } = await supabase
          .from('waitlist')
          .select('id')

        if (basicError) {
          throw new Error('Cannot connect to waitlist table. Please create it first.')
        }

        // Fallback basic stats
        setStats({
          total_signups: basicStats?.length || 0,
          last_24h: 0,
          last_7days: 0,
          last_30days: 0,
          weekly_growth_rate: 0,
          referral_rate: 0,
          from_landing: 0,
          from_social: 0,
          from_referral: 0,
          avg_clicks: 0,
          avg_opens: 0
        })
      } else {
        setStats(growthData)
      }

      // Load hourly stats
      const { data: hourlyData } = await supabase
        .from('waitlist_hourly_stats')
        .select('*')
        .limit(24)

      if (hourlyData) {
        setHourlyStats(hourlyData)
      }

      // Load top referrers
      const { data: referrerData } = await supabase
        .from('waitlist_top_referrers')
        .select('*')
        .limit(10)

      if (referrerData) {
        setTopReferrers(referrerData)
      }

      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Dashboard loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">실시간 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ 데이터베이스 설정 필요</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-gray-50 p-4 rounded text-sm text-left">
            <p className="font-semibold mb-2">해결 방법:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Supabase 대시보드 접속</li>
              <li>SQL Editor 열기</li>
              <li>enhanced-waitlist-table.sql 실행</li>
              <li>페이지 새로고침</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  const conversionRate = stats ?
    ((stats.total_signups / Math.max(1, stats.total_signups * 10)) * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 첫돌까지 Growth Dashboard
          </h1>
          <p className="text-gray-600">
            실시간 사용자 확보 현황 • 마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            title="총 가입자"
            value={stats?.total_signups || 0}
            change={`+${stats?.last_24h || 0} (24시간)`}
            trend="up"
            color="blue"
          />

          <MetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="주간 성장률"
            value={`${stats?.weekly_growth_rate || 0}%`}
            change={`${stats?.last_7days || 0}명 (7일)`}
            trend={stats?.weekly_growth_rate && stats.weekly_growth_rate > 0 ? "up" : "down"}
            color="green"
          />

          <MetricCard
            icon={<Share2 className="w-5 h-5" />}
            title="추천 전환율"
            value={`${stats?.referral_rate || 0}%`}
            change={`${stats?.from_referral || 0}명 추천가입`}
            trend="up"
            color="purple"
          />

          <MetricCard
            icon={<Target className="w-5 h-5" />}
            title="예상 전환율"
            value={`${conversionRate}%`}
            change={`평균 ${stats?.avg_clicks || 0} 클릭`}
            trend="up"
            color="pink"
          />
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                가입 경로 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SourceBar
                  label="랜딩 페이지"
                  count={stats?.from_landing || 0}
                  total={stats?.total_signups || 1}
                  color="bg-blue-500"
                />
                <SourceBar
                  label="소셜 공유"
                  count={stats?.from_social || 0}
                  total={stats?.total_signups || 1}
                  color="bg-green-500"
                />
                <SourceBar
                  label="추천링크"
                  count={stats?.from_referral || 0}
                  total={stats?.total_signups || 1}
                  color="bg-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                시간별 가입 현황 (24시간)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {hourlyStats.length > 0 ? (
                  hourlyStats.map((hour) => (
                    <div key={hour.hour} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">
                        {new Date(hour.hour).toLocaleString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <Badge variant="secondary">
                        {hour.signups}명
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">아직 데이터가 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Referrers */}
        {topReferrers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🏆 Top Referrers (추천 리더보드)</CardTitle>
              <CardDescription>
                가장 많은 사람을 초대한 사용자들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReferrers.map((referrer, index) => (
                  <div key={referrer.referral_code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{referrer.referrer_email}</p>
                        <p className="text-sm text-gray-500">코드: {referrer.referral_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        {referrer.total_referred}명 초대
                      </p>
                      <p className="text-sm text-gray-500">
                        마지막: {new Date(referrer.last_referral_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Items */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 다음 단계 액션 아이템</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📧 이메일 마케팅</h3>
                <p className="text-sm text-blue-700">
                  {stats?.total_signups || 0}명에게 런칭 소식 발송 준비
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">📱 소셜 확산</h3>
                <p className="text-sm text-green-700">
                  추천 기능으로 {stats?.referral_rate || 0}% 바이럴 달성
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">🎯 전환 최적화</h3>
                <p className="text-sm text-purple-700">
                  A/B 테스트로 {conversionRate}% → 5% 목표
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  color: 'blue' | 'green' | 'purple' | 'pink'
}

function MetricCard({ icon, title, value, change, trend, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    pink: 'text-pink-600 bg-pink-50 border-pink-200'
  }

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <Badge variant={trend === 'up' ? 'default' : 'secondary'}>
            {trend === 'up' ? '↗️' : '↘️'}
          </Badge>
        </div>
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-sm text-gray-500">{change}</p>
      </CardContent>
    </Card>
  )
}

interface SourceBarProps {
  label: string
  count: number
  total: number
  color: string
}

function SourceBar({ label, count, total, color }: SourceBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500">{count}명 ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  )
}