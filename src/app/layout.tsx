import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { WebsiteStructuredData } from '@/components/seo/structured-data'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { PerformanceMonitor } from '@/components/performance-monitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app'),
  title: {
    default: '첫돌까지 - 임신부터 첫돌까지 함께하는 엄마들의 여정',
    template: '%s | 첫돌까지'
  },
  description: '임신 순간부터 아기 첫돌까지, 21개월의 소중한 여정을 함께합니다. 예비맘과 초보맘들의 든든한 동반자.',
  keywords: [
    '첫돌까지', '임신', '출산', '육아', '신생아', '이유식', '태교', 
    '산후조리', '모유수유', '아기발달', '예방접종', '육아커뮤니티', 
    '임신커뮤니티', '예비맘', '초보맘', '임신정보', '육아정보', 
    '월령별발달', '임신관리', '신생아케어', '육아상담', '엄마커뮤니티'
  ],
  authors: [{ name: '첫돌까지 팀' }],
  creator: '첫돌까지',
  publisher: '첫돌까지',
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
    title: '첫돌까지 - 임신부터 첫돌까지 함께하는 엄마들의 여정',
    description: '임신 순간부터 아기 첫돌까지, 21개월의 소중한 여정을 함께합니다. 예비맘과 초보맘들의 든든한 동반자.',
    images: [
      {
        url: '/og-baby.png',
        width: 1200,
        height: 630,
        alt: '첫돌까지 - 임신부터 첫돌까지 함께하는 엄마들의 여정',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@첫돌까지',
    creator: '@첫돌까지',
    title: '첫돌까지 - 임신부터 첫돌까지 함께하는 엄마들의 여정',
    description: '임신 순간부터 아기 첫돌까지, 21개월의 소중한 여정을 함께합니다',
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
    <html lang="ko">
      <head>
        <WebsiteStructuredData />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider 
            config={{
              redirectOnSignIn: '/',
              redirectOnSignOut: '/',
              enableDebugMode: process.env.NODE_ENV === 'development',
              autoRefreshProfile: true
            }}
          >
            <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 dark:from-pink-900/10 dark:via-gray-900 dark:to-blue-900/10 transition-colors">
              <Header />
              <main>{children}</main>
            </div>
            <Toaster 
              position="top-right"
              richColors
              theme="system"
            />
            <PerformanceMonitor />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
