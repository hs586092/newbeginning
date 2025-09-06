import { getUser } from '@/lib/supabase/server'
import { CustomerCentricPage } from '@/components/landing/customer-centric-page'
import PersonalizedDashboard from '@/components/dashboard/personalized-dashboard'

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { user } = await getUser()
  const resolvedSearchParams = await searchParams
  
  // 사용자가 로그인하지 않은 경우 항상 랜딩 페이지 표시
  if (!user) {
    return <CustomerCentricPage />
  }

  // 로그인 사용자용 개인화된 대시보드
  return <PersonalizedDashboard searchParams={resolvedSearchParams} user={user} />
}
