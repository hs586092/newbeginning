/**
 * Supabase 테이블 생성 스크립트
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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function createTables() {
  console.log('🔨 Supabase 테이블 생성 시작...\n')

  // SQL 파일 읽기
  const sqlPath = join(__dirname, '../supabase/migrations/create_hospitals_simple.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  // SQL을 여러 개의 명령어로 분리
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0)

  console.log(`📝 총 ${commands.length}개의 SQL 명령 실행\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i] + ';'

    // 주석이나 빈 명령 건너뛰기
    if (command.startsWith('--') || command.trim() === ';') {
      continue
    }

    console.log(`[${i + 1}/${commands.length}] 실행 중...`)

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: command })

      if (error) {
        // 직접 SQL 실행 시도
        console.log('  ⚠️  RPC 실패, 직접 실행 시도...')

        // Supabase는 직접 SQL 실행을 지원하지 않으므로
        // 수동으로 실행해야 합니다
        console.log('  ℹ️  다음 SQL을 Supabase Dashboard에서 실행하세요:')
        console.log('  ---')
        console.log(command.substring(0, 100) + '...')
        console.log('  ---\n')
        errorCount++
      } else {
        console.log('  ✅ 성공\n')
        successCount++
      }
    } catch (error: any) {
      console.error('  ❌ 에러:', error.message)
      console.log('  ℹ️  다음 SQL을 Supabase Dashboard에서 수동 실행하세요:\n')
      errorCount++
    }

    // API 레이트 리밋 방지
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n📊 결과:')
  console.log(`  ✅ 성공: ${successCount}개`)
  console.log(`  ❌ 실패: ${errorCount}개`)

  if (errorCount > 0) {
    console.log('\n⚠️  일부 SQL이 실패했습니다.')
    console.log('📋 해결 방법:')
    console.log('1. https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor/sql 접속')
    console.log('2. "New query" 클릭')
    console.log('3. supabase/migrations/create_hospitals_simple.sql 파일 내용 복사')
    console.log('4. 붙여넣기 후 "Run" 클릭')
  }
}

createTables().catch(console.error)
