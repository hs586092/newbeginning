#!/usr/bin/env node
/**
 * 간단한 SQL 쿼리 실행 도구
 * 사용법: node scripts/db-query.js "SELECT * FROM comments LIMIT 5;"
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수 오류')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeQuery(query) {
  try {
    console.log(`🚀 쿼리 실행: ${query}`)
    
    const { data, error } = await supabase.rpc('execute_migration', {
      migration_sql: query
    })

    if (error) {
      console.error(`❌ 쿼리 실행 오류:`, error.message)
      return
    }

    if (data && data.status === 'success') {
      console.log(`✅ 쿼리 완료`)
      console.log(`📊 실행 시간: ${data.timestamp}`)
    } else if (data && data.status === 'error') {
      console.error(`❌ 쿼리 오류: ${data.message}`)
      console.error(`🔍 상세 정보: ${data.detail}`)
    }
  } catch (err) {
    console.error(`❌ 실행 오류: ${err.message}`)
  }
}

// 스크립트 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv[2]
  if (!query) {
    console.log('사용법: node scripts/db-query.js "SELECT * FROM comments LIMIT 5;"')
    process.exit(1)
  }
  executeQuery(query).catch(console.error)
}