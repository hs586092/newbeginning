import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ✅ 지연 로딩: 클라이언트 캐싱
let _supabaseClient: SupabaseClient<Database> | null = null
let _realtimeClient: SupabaseClient<Database> | null = null

// ✅ 기본 클라이언트 - 필요시에만 로드
export async function createClient(): Promise<SupabaseClient<Database>> {
  if (_supabaseClient) return _supabaseClient

  // 동적 import로 번들 크기 최적화
  const { createBrowserClient } = await import('@supabase/ssr')

  _supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      realtime: {
        disabled: true // 기본 클라이언트는 Realtime 비활성화
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  return _supabaseClient
}

// ✅ Realtime 클라이언트 - 채팅/알림 시에만 로드
export async function getRealtimeClient(): Promise<SupabaseClient<Database>> {
  if (_realtimeClient) return _realtimeClient

  const { createBrowserClient } = await import('@supabase/ssr')

  _realtimeClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      realtime: {
        disabled: false,
        heartbeatIntervalMs: 30000,
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
        logger: (level: string, message: string, details?: any) => {
          if (level === 'error') {
            console.error('Supabase Realtime error:', message, details)
          }
        }
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  return _realtimeClient
}

// ✅ 레거시 호환성을 위한 export (점진적 마이그레이션)
export const supabase = {
  get client() {
    console.warn('⚠️  Direct supabase access deprecated. Use createClient() or getRealtimeClient()')
    return createClient()
  }
}