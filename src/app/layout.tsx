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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://moree.ai'),
  manifest: '/manifest.json',
  title: {
    default: 'moree.ai - AI가 요약하는 모든 리뷰',
    template: '%s | moree.ai'
  },
  description: '카페, 식당, 병원 등 어떤 장소든 검색하면 네이버 리뷰를 AI가 한눈에 요약해드립니다. 장점, 단점, 전체 평가를 빠르게 확인하세요.',
  keywords: [
    '리뷰요약', 'AI리뷰', '네이버리뷰', '장소검색', '맛집추천',
    '카페추천', '병원추천', '리뷰분석', 'AI요약', '스마트리뷰',
    '장점단점', '리뷰한눈에', '빠른리뷰', '리뷰검색', '장소추천',
    'moree', 'moree.ai', '모든리뷰', 'review summary', 'AI review'
  ],
  authors: [{ name: 'moree.ai Team' }],
  creator: 'moree.ai',
  publisher: 'moree.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'moree.ai',
    title: 'moree.ai - AI가 요약하는 모든 리뷰',
    description: '카페, 식당, 병원 등 어떤 장소든 검색하면 네이버 리뷰를 AI가 한눈에 요약해드립니다.',
    images: [
      {
        url: '/og-moree.png',
        width: 1200,
        height: 630,
        alt: 'moree.ai - AI 리뷰 요약 서비스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@moree_ai',
    creator: '@moree_ai',
    title: 'moree.ai - AI Review Summary Service',
    description: 'Get AI-powered summaries of any place reviews in seconds.',
    images: ['/og-moree.png'],
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
