import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Phone, Shield, Users } from 'lucide-react'

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full text-red-700 font-medium mb-6">
            <AlertTriangle className="w-5 h-5" />
            <span>🚨 응급상황 대처</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            우리 아이 안전을 위한
            <br />
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
              응급처치 가이드
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            신생아・영유아 응급상황 판단 기준과 대처법, 병원 방문 타이밍까지
            당황하지 않고 침착하게 대응할 수 있도록 도와드려요.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-12">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                응급상황 시 즉시 연락처
              </h3>
              <div className="text-red-700 space-y-1">
                <div className="font-semibold">📞 응급의료정보센터: 1339</div>
                <div className="font-semibold">🚑 응급실: 119</div>
                <div className="text-sm">위급한 상황에서는 망설이지 말고 즉시 전문의료진의 도움을 받으세요.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            응급처치 가이드를 준비하고 있어요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            열경기・구토・설사・기도폐쇄 등 주요 응급상황별 대처법, 
            <br />
            병원 방문 기준과 응급처치 동영상까지 체계적으로 정리해드릴게요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-red-50 rounded-xl">
              <Phone className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">응급상황 체크리스트</h3>
              <p className="text-sm text-gray-600">상황별 대처법과 병원 연락 기준</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <Users className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">응급처치 경험담</h3>
              <p className="text-sm text-gray-600">다른 부모들의 대처 경험 공유</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/community">
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                <Users className="w-5 h-5 mr-2" />
                안전 정보 공유하기
              </Button>
            </Link>
            <Link href="https://newbeginning-seven.vercel.app/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* Important Safety Reminder */}
        <div className="bg-orange-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">안전 수칙 reminder</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            응급상황에서는 당황하지 마시고, 아이의 상태를 정확히 파악한 후 
            전문의료진의 지시에 따라 행동하는 것이 가장 중요합니다.
          </p>
        </div>

        {/* Temporary Quick Links */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm mb-4">평상시 아기 돌봄 정보도 함께 확인하세요</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newborn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              🍼 신생아
            </Link>
            <Link href="/development" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              📈 발달정보
            </Link>
            <Link href="/baby-food" className="text-green-600 hover:text-green-700 text-sm font-medium">
              🥄 이유식
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}