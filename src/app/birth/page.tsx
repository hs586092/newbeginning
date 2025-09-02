import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Hospital, Heart, CheckCircle, Users } from 'lucide-react'

export default function BirthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full text-purple-700 font-medium mb-6">
            <Hospital className="w-5 h-5" />
            <span>🏥 출산 준비</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            소중한 생명과의 만남을 위한
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
              완벽한 준비
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            분만 방법 선택부터 산후조리까지, 안전하고 행복한 출산을 위한 
            모든 준비 과정을 차근차근 함께해요.
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-purple-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            출산 준비 가이드를 준비하고 있어요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            병원 선택 기준, 분만 방법별 장단점, 출산용품 리스트, 
            <br />
            진통 대처법, 산후조리 팁까지 출산의 모든 과정을 안내해드릴게요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-purple-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">출산 체크리스트</h3>
              <p className="text-sm text-gray-600">임신 후기부터 출산 후까지 필수 준비사항</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-xl">
              <Users className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">출산 후기 공유</h3>
              <p className="text-sm text-gray-600">선배맘들의 생생한 출산 경험담</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/community">
              <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                <Users className="w-5 h-5 mr-2" />
                출산 준비 대화하기
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
          <p className="text-gray-500 text-sm mb-4">출산 전후 단계별 정보를 확인해보세요</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pregnancy" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              🤰 임신
            </Link>
            <Link href="/newborn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              🍼 신생아
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