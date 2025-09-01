import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { WebsiteStructuredData } from '@/components/seo/structured-data'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app'),
  title: {
    default: '뉴비기닝 - 구인구직 & 커뮤니티 플랫폼',
    template: '%s | 뉴비기닝'
  },
  description: '개발자와 IT 전문가를 위한 구인구직 및 커뮤니티 플랫폼. 최신 기술 트렌드와 채용 정보를 실시간으로 공유하세요.',
  keywords: [
    '구인구직', '개발자 채용', 'IT 채용', '프로그래머 구인', 
    '개발자 커뮤니티', '기술 블로그', '개발 정보', '프론트엔드', 
    '백엔드', '풀스택', 'React', 'Next.js', 'TypeScript'
  ],
  authors: [{ name: '뉴비기닝 팀' }],
  creator: '뉴비기닝',
  publisher: '뉴비기닝',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '뉴비기닝',
    title: '뉴비기닝 - 개발자를 위한 구인구직 & 커뮤니티',
    description: '개발자와 IT 전문가를 위한 구인구직 및 커뮤니티 플랫폼. 최신 기술 트렌드와 채용 정보를 실시간으로 공유하세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '뉴비기닝 - 구인구직 & 커뮤니티 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@newbeginning_dev',
    creator: '@newbeginning_dev',
    title: '뉴비기닝 - 개발자를 위한 구인구직 & 커뮤니티',
    description: '개발자와 IT 전문가를 위한 구인구직 및 커뮤니티 플랫폼',
    images: ['/og-image.png'],
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
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>{children}</main>
        </div>
        <Toaster 
          position="top-right"
          richColors
          theme="light"
        />
      </body>
    </html>
  )
}
