'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const message = searchParams.get('message') || '결제에 실패했습니다'
  const code = searchParams.get('code') || 'UNKNOWN_ERROR'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>오류 코드:</strong> {code}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            문제가 계속되면{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              고객센터
            </a>
            로 문의해주세요
          </p>
        </div>
      </div>
    </div>
  )
}
