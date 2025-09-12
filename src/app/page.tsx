import { getUser } from '@/lib/supabase/server'
import { HybridAuthWrapper } from '@/components/auth/hybrid-auth-wrapper'

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { user } = await getUser()
  const resolvedSearchParams = await searchParams
  
  // 통합된 홈페이지를 통해 로그인 상태와 무관하게 일관된 UI 제공
  return (
    <HybridAuthWrapper 
      serverUser={user} 
      searchParams={resolvedSearchParams}
    />
  )
}
