'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // 헤더를 숨길 페이지들
  const hideHeaderPaths = ['/login', '/signup']
  
  // 현재 경로가 헤더를 숨길 페이지인지 확인
  const shouldHideHeader = hideHeaderPaths.includes(pathname)
  
  if (shouldHideHeader) {
    return null
  }
  
  return <Header />
}