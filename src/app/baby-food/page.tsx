import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Utensils, Clock, Star, Users } from 'lucide-react'

export default function BabyFoodPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full text-green-700 font-medium mb-6">
            <Utensils className="w-5 h-5" />
            <span>🥄 이유식 가이드</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            우리 아기 첫 한숟가락,
            <br />
            <span className="bg-gradient-to-r from-green-500 to-yellow-500 text-transparent bg-clip-text">
              함께 시작해요
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            4개월부터 12개월까지, 초기・중기・후기・완료기 단계별 이유식 가이드와 
            검증된 레시피로 건강한 식습관의 기초를 만들어가요.
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            단계별 이유식 가이드를 준비하고 있어요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            월령별 맞춤 레시피, 식재료 도입 순서, 알레르기 대응법, 
            <br />
            편식 예방 노하우까지 체계적인 이유식 정보를 제공할 예정입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-green-50 rounded-xl">
              <Clock className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">월령별 레시피</h3>
              <p className="text-sm text-gray-600">4개월부터 완료기까지 150여 가지</p>
            </div>
            <div className="p-6 bg-yellow-50 rounded-xl">
              <Users className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">이유식 고민 상담</h3>
              <p className="text-sm text-gray-600">편식, 알레르기 등 실전 노하우 공유</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/community">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                <Users className="w-5 h-5 mr-2" />
                이유식 고민 나누기
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* Temporary Quick Links */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">아기 성장 단계별 정보를 미리 확인해보세요</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newborn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              🍼 신생아
            </Link>
            <Link href="/development" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              📈 발달정보
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