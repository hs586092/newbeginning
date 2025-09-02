import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          {/* 404 Animation */}
          <div className="relative mb-6">
            <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 text-gray-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                홈으로 이동
              </Button>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지
            </button>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500 mb-4">다른 페이지를 찾아보세요</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/jobs">
                <Button variant="ghost" size="sm">구인구직</Button>
              </Link>
              <Link href="/community">
                <Button variant="ghost" size="sm">커뮤니티</Button>
              </Link>
              <Link href="/write">
                <Button variant="ghost" size="sm">글쓰기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}