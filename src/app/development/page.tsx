import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar, Target, Users } from 'lucide-react'

export default function DevelopmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-indigo-100 px-4 py-2 rounded-full text-indigo-700 font-medium mb-6">
            <TrendingUp className="w-5 h-5" />
            <span>📈 발달정보</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            우리 아기 성장하는
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
              모든 순간이 특별해요
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            신생아부터 첫돌까지, 월령별・단계별 발달 지표와 놀이법을 통해 
            우리 아기만의 성장 속도를 응원하고 지켜봐요.
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            월령별 발달 가이드를 준비하고 있어요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            신체・인지・언어・사회성 발달 단계별 체크포인트, 월령에 맞는 놀이와 자극법, 
            <br />
            발달 지연 체크 및 전문가 상담 가이드까지 제공할 예정입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-indigo-50 rounded-xl">
              <Calendar className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">월령별 체크리스트</h3>
              <p className="text-sm text-gray-600">0-12개월 발달 이정표와 놀이법</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">발달 상담 커뮤니티</h3>
              <p className="text-sm text-gray-600">또래 아기 발달 경험 나누기</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/community">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                <Users className="w-5 h-5 mr-2" />
                발달 이야기 나누기
              </Button>
            </Link>
            <Link href="https://newbeginning-seven.vercel.app/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* Temporary Quick Links */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">아기 돌봄의 다른 단계들도 살펴보세요</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newborn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              🍼 신생아
            </Link>
            <Link href="/baby-food" className="text-green-600 hover:text-green-700 text-sm font-medium">
              🥄 이유식
            </Link>
            <Link href="/emergency" className="text-red-600 hover:text-red-700 text-sm font-medium">
              🚨 응급
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}