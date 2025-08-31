import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6">프로필</h1>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-700">
                {((profile as any)?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{(profile as any)?.username}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">계정 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">닉네임</label>
                <p className="mt-1 text-sm text-gray-900">{(profile as any)?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">가입일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              프로필 수정 기능은 추후 업데이트 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}