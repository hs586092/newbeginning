/**
 * TossPayments 결제 승인 API
 *
 * POST /api/payments/approve
 * Body: { paymentKey, orderId, amount }
 */

import { NextRequest, NextResponse } from 'next/server'

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      )
    }

    // TossPayments API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || '결제 승인 실패' },
        { status: response.status }
      )
    }

    // 결제 성공 - DB에 저장하거나 추가 로직 수행
    console.log('결제 승인 성공:', {
      orderId: data.orderId,
      amount: data.totalAmount,
      method: data.method
    })

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('결제 승인 오류:', error)
    return NextResponse.json(
      { error: error.message || '결제 승인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
