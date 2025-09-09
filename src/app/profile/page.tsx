import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <ProfileClient 
      user={user} 
      initialProfile={profile}
    />
  )
}