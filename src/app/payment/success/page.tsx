'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const approvePayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount)
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '결제 승인 실패')
        }

        setPayment(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    approvePayment()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료</h1>
          <p className="text-gray-600">결제가 성공적으로 완료되었습니다</p>
        </div>

        {payment && (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">주문번호</span>
              <span className="font-medium">{payment.orderId}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">결제 금액</span>
              <span className="font-bold text-lg">{payment.totalAmount?.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">결제 방법</span>
              <span className="font-medium">{payment.method === '카드' ? '신용카드' : payment.method}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">승인 시각</span>
              <span className="font-medium">
                {payment.approvedAt ? new Date(payment.approvedAt).toLocaleString('ko-KR') : '-'}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}
