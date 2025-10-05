/**
 * Supabase에 리뷰 테이블 생성
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function setupTables() {
  console.log('🔧 리뷰 테이블 생성 시작...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // SQL 파일 읽기
  const sqlPath = join(__dirname, '../supabase/migrations/create_reviews_table.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  console.log('📝 SQL 실행 중...\n')
  console.log('='.repeat(60))
  console.log(sql)
  console.log('='.repeat(60))
  console.log()

  // Supabase RPC로 실행 시도
  try {
    // 테이블 생성은 직접 SQL로 실행해야 함
    console.log('⚠️  Supabase API로는 DDL 실행이 제한됩니다.')
    console.log('📋 다음 단계를 따라주세요:\n')
    console.log('1. https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor/sql 접속')
    console.log('2. "New query" 클릭')
    console.log('3. 위의 SQL을 복사해서 붙여넣기')
    console.log('4. "Run" 클릭\n')
    console.log('또는 아래 명령어로 직접 실행:')
    console.log('pbcopy < supabase/migrations/create_reviews_table.sql')
    console.log('(SQL이 클립보드에 복사됩니다)')

  } catch (error: any) {
    console.error('❌ 에러:', error.message)
  }
}

setupTables()
