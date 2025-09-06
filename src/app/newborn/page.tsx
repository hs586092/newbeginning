import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Baby, Heart, Clock, Users } from 'lucide-react'

export default function NewbornPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 font-medium mb-6">
            <Baby className="w-5 h-5" />
            <span>🍼 신생아 케어</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            생애 첫 육아,
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-teal-500 text-transparent bg-clip-text">
              혼자가 아니에요
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            신생아와의 첫 만남부터 3개월까지, 수유・수면・건강관리 등 
            초보맘들의 모든 궁금증을 함께 해결해나가요.
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            신생아 케어 가이드를 준비하고 있어요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            수유 방법과 텀 조절, 기저귀 갈기, 목욕시키기, 수면 패턴 만들기 등
            <br />
            신생아 돌봄의 모든 것을 단계별로 알려드릴 예정입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-xl">
              <Clock className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">일일 케어 체크리스트</h3>
              <p className="text-sm text-gray-600">신생아 돌봄 필수 체크포인트</p>
            </div>
            <div className="p-6 bg-teal-50 rounded-xl">
              <Users className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">신생아맘 네트워킹</h3>
              <p className="text-sm text-gray-600">같은 시기 출산한 엄마들과 소통</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/community">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Users className="w-5 h-5 mr-2" />
                신생아맘들과 대화하기
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
          <p className="text-gray-500 text-sm mb-4">다른 단계의 정보도 미리 둘러보세요</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pregnancy" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              🤰 임신
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