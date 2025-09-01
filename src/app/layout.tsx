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
    default: 'BUDICONNECTS - 불자들의 커뮤니티',
    template: '%s | BUDICONNECTS'
  },
  description: '불자들의 커뮤니티 BUDICONNECTS. 구인, 구직부터 커뮤니티 서비스까지 모든 것을 한곳에서 경험하세요.',
  keywords: [
    'BUDICONNECTS', '불자들의커뮤니티', '구인구직', '불자채용', 
    '불교커뮤니티', '불자네트워킹', '구인', '구직', '커뮤니티서비스',
    '불교도구인구직', '불자취업', '불교인커리어'
  ],
  authors: [{ name: 'BUDICONNECTS 팀' }],
  creator: 'BUDICONNECTS',
  publisher: 'BUDICONNECTS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'BUDICONNECTS',
    title: 'BUDICONNECTS - 불자들의 커뮤니티',
    description: '불자들의 커뮤니티 BUDICONNECTS. 구인, 구직부터 커뮤니티 서비스까지 모든 것을 한곳에서 경험하세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BUDICONNECTS - 불자들의 커뮤니티',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@budiconnects',
    creator: '@budiconnects',
    title: 'BUDICONNECTS - 불자들의 커뮤니티',
    description: '불자들의 커뮤니티 BUDICONNECTS. 구인, 구직부터 커뮤니티 서비스까지',
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
