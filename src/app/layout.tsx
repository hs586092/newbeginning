import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '구인구직 & 커뮤니티',
  description: '구인구직과 커뮤니티가 함께하는 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
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
