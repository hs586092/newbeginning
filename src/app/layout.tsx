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
    default: '첫돌까지 - 0-12개월 육아맘 커뮤니티 | 신생아부터 첫돌까지',
    template: '%s | 첫돌까지'
  },
  description: '신생아부터 첫돌까지 월령별 육아 정보와 선배맘들의 따뜻한 조언. 수유, 이유식, 수면교육, 발달 등 초보맘을 위한 모든 정보를 나누는 커뮤니티입니다.',
  keywords: [
    '신생아', '육아', '첫돌', '이유식', '수면교육', '월령별발달',
    '육아커뮤니티', '맘카페', '육아맘', '초보맘', '육아정보',
    '수유', '신생아관리', '육아상담', '베이비', '유아',
    '육아일기', '발달', '예방접종', '육아용품', '맘스', '0-12개월'
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
