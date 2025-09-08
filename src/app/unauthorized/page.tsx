import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          접근 권한이 없습니다
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          이 페이지에 접근할 수 있는 권한이 없습니다.
          로그인하시거나 관리자에게 문의해 주세요.
        </p>
        
        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">
              로그인하기
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: '접근 권한 없음',
  description: '이 페이지에 접근할 수 있는 권한이 없습니다.'
}