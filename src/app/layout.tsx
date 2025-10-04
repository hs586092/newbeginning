import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalHeader } from '@/components/layout/conditional-header'
import { Footer } from '@/components/layout/footer'
// LAUNCH READY: ServiceReadyBanner removed to activate full site
import { WebsiteStructuredData } from '@/components/seo/structured-data'
import { ResilientAuthProvider } from '@/contexts/resilient-auth-context'
import { CommentProvider } from '@/contexts/comment-context'
import { LikeProvider } from '@/contexts/like-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { ResilientNotificationSystem } from '@/components/notifications/resilient-notification-system'
import { QueryProvider } from '@/components/providers/query-provider'
import { ToastContainer } from '@/components/notifications/toast-container'
import { Toaster } from 'sonner'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { WebVitalsMonitor } from '@/components/performance/web-vitals'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import '@/lib/service-worker'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fortheorlingas.com'),
  manifest: '/manifest.json',
  title: {
    default: '우리동네 육아병원 - 소아과 찾기, 리뷰, 예약 | 엄마들의 진짜 후기',
    template: '%s | 우리동네 육아병원'
  },
  description: '우리 동네 소아과를 찾고 실제 엄마들의 리뷰를 확인하세요. 위치 기반 검색, 진료시간, 주차 정보, 야간진료까지. 아이를 위한 믿을 수 있는 병원 정보.',
  keywords: [
    '소아과', '소아청소년과', '병원찾기', '소아과추천', '동네병원',
    '소아과리뷰', '병원후기', '야간진료', '응급실', '예방접종',
    '영유아검진', '육아병원', '아기병원', '신생아병원', '소아과예약',
    '병원정보', '진료시간', '주차가능병원', '주말진료', '공휴일진료',
    '육아', '육아커뮤니티', '맘카페', '육아맘', '육아정보'
  ],
  authors: [{ name: 'ParentWise Team' }],
  creator: 'ParentWise',
  publisher: 'ParentWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '첫돌까지',
    title: '첫돌까지 - 0-12개월 육아맘 커뮤니티',
    description: '신생아부터 첫돌까지 월령별 육아 정보와 선배맘들의 따뜻한 조언. 함께 성장하는 육아 커뮤니티입니다.',
    images: [
      {
        url: '/og-baby.png',
        width: 1200,
        height: 630,
        alt: '첫돌까지 - 육아맘 커뮤니티',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ParentWise',
    creator: '@ParentWise',
    title: 'ParentWise - Global Parenting Community',
    description: 'Connect with parents worldwide. Share experiences, get advice, and support each other.',
    images: ['/og-baby.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-site-verification',
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <WebsiteStructuredData />
        {/* Critical Resource Preloading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.com" />
        <link rel="dns-prefetch" href="https://fortheorlingas.com" />
        <link rel="preload" href="/og-baby.png" as="image" type="image/png" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <ResilientAuthProvider>
            <NotificationProvider>
              <CommentProvider>
                <LikeProvider>
                  <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 transition-colors flex flex-col">
                    <ConditionalHeader />
                    {/* 🚀 LAUNCH READY: ServiceReadyBanner removed for full site functionality */}
                    <main id="main-content" role="main" tabIndex={-1} className="flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>

                  {/* 토스트 알림 컨테이너 */}
                  <ToastContainer />
                  {/* 🛡️ Resilient Realtime System with WebSocket + Polling Fallback */}
                  <ResilientNotificationSystem />
                </LikeProvider>
                <Toaster
                  position="top-right"
                  richColors
                />
                <InstallPrompt />
                <PerformanceMonitor />
                <WebVitalsMonitor />
                <Analytics />
                <SpeedInsights />
              </CommentProvider>
            </NotificationProvider>
          </ResilientAuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
