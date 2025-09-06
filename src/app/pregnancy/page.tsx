import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Calendar, Baby, Users } from 'lucide-react'

export default function PregnancyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full text-pink-700 font-medium mb-6">
            <Heart className="w-5 h-5" />
            <span>🤰 임신 정보</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            소중한 생명과 함께하는 
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              특별한 시작
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            임신 순간부터 출산까지, 주차별 맞춤 정보와 전문가 조언을 통해 
            건강하고 행복한 임신 여정을 함께하겠습니다.
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Baby className="w-10 h-10 text-pink-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            더 자세한 임신 가이드를 준비하고 있어요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            임신 주차별 체크리스트, 태아 발달 정보, 산전검사 일정, 
            <br />
            영양 관리 가이드 등 알찬 콘텐츠를 곧 만나보실 수 있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-pink-50 rounded-xl">
              <Calendar className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">주차별 가이드</h3>
              <p className="text-sm text-gray-600">임신 주수에 맞는 정보와 체크리스트</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">예비맘 커뮤니티</h3>
              <p className="text-sm text-gray-600">같은 예정일 엄마들과 정보 공유</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/community">
              <Button size="lg" className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700">
                <Users className="w-5 h-5 mr-2" />
                커뮤니티에서 대화하기
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
          <p className="text-gray-500 text-sm mb-4">임시로 다른 페이지들도 둘러보세요</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newborn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              🍼 신생아
            </Link>
            <Link href="/baby-food" className="text-green-600 hover:text-green-700 text-sm font-medium">
              🥄 이유식
            </Link>
            <Link href="/development" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              📈 발달정보
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}