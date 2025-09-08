import { getUser } from '@/lib/supabase/server'
import { CustomerCentricPage } from '@/components/landing/customer-centric-page'
import { HybridAuthWrapper } from '@/components/auth/hybrid-auth-wrapper'

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { user } = await getUser()
  const resolvedSearchParams = await searchParams
  
  // 하이브리드 인증 래퍼를 사용하여 서버/클라이언트 인증 상태 모두 확인
  return (
    <HybridAuthWrapper 
      serverUser={user} 
      searchParams={resolvedSearchParams}
      fallbackComponent={<CustomerCentricPage />}
    />
  )
}
