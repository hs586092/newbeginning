import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalHeader } from '@/components/layout/conditional-header'
import { WebsiteStructuredData } from '@/components/seo/structured-data'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { CommentProvider } from '@/contexts/comment-context'
import { LikeProvider } from '@/contexts/like-context'
import { Toaster } from 'sonner'
import { PerformanceMonitor } from '@/components/performance-monitor'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app'),
  title: {
    default: 'ParentWise - Global Parenting Community',
    template: '%s | ParentWise'
  },
  description: 'Connect with parents worldwide. From pregnancy to parenting, share experiences, get advice, and support each other through every stage of raising children.',
  keywords: [
    'parenting', 'pregnancy', 'newborn', 'baby', 'toddler', 'child development', 
    'parenting tips', 'mom community', 'dad community', 'parenting advice', 
    'child care', 'baby feeding', 'sleep training', 'parenting support', 
    'family life', 'parenting community', 'child health', 'parenting journey'
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
    locale: 'en_US',
    url: '/',
    siteName: 'ParentWise',
    title: 'ParentWise - Global Parenting Community',
    description: 'Connect with parents worldwide. From pregnancy to parenting, share experiences, get advice, and support each other through every stage of raising children.',
    images: [
      {
        url: '/og-baby.png',
        width: 1200,
        height: 630,
        alt: 'ParentWise - Global Parenting Community',
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
              <CommentProvider>
                <LikeProvider>
                  <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 dark:from-pink-900/10 dark:via-gray-900 dark:to-blue-900/10 transition-colors">
                    <ConditionalHeader />
                    <main>{children}</main>
                  </div>
                </LikeProvider>
                <Toaster 
                  position="top-right"
                  richColors
                  theme="system"
                />
                <PerformanceMonitor />
              </CommentProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
