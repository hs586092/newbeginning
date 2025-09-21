'use client'

import { useRealtimeSubscription } from '@/lib/hooks/use-realtime-improved'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSubscription()
  
  return <>{children}</>
}