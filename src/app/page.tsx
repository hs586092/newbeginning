import { getUser } from '@/lib/supabase/server'
import { CustomerCentricPage } from '@/components/landing/customer-centric-page'
import PersonalizedDashboard from '@/components/dashboard/personalized-dashboard'

interface HomePageProps {
  searchParams: { [key: string]: string | undefined }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { user } = await getUser()
  const searchParamsObj = await searchParams
  const hasSearchParams = Object.keys(searchParamsObj).length > 0
  
  // 새 방문자나 검색 파라미터가 없을 때는 Customer-Centric 랜딩페이지 표시
  const showLandingPage = !user && !hasSearchParams

  if (showLandingPage) {
    return <CustomerCentricPage />
  }

  // 로그인 사용자용 개인화된 대시보드
  return <PersonalizedDashboard searchParams={searchParams} user={user!} />
}
