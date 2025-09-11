#!/usr/bin/env node
/**
 * Supabase SQL 직접 실행 시스템
 * SQL Editor를 완전 대체하는 CLI 도구
 * 사용법: node scripts/db-execute.js "SELECT * FROM posts"
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경변수 로드
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수 오류: SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다')
  console.log('📝 .env.local에 다음을 추가하세요:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

// Supabase 클라이언트 생성 (Service Role 사용)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * SQL 쿼리 직접 실행
 * @param {string} query - 실행할 SQL 쿼리
 * @returns {Promise<{data: any, error: any}>}
 */
async function executeSQL(query) {
  console.log(`🚀 SQL 실행: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`)
  
  try {
    // Supabase RPC를 사용한 raw SQL 실행
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query 
    })
    
    if (error) {
      // RPC 함수가 없는 경우 다른 방법 시도
      if (error.code === '42883') {
        console.log('📝 execute_sql RPC 함수가 없습니다. 대안 방법을 사용합니다.')
        return await executeWithRest(query)
      }
      throw error
    }
    
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * REST API를 통한 쿼리 실행 (대안)
 */
async function executeWithRest(query) {
  try {
    // SELECT 쿼리인 경우
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      const tableName = extractTableName(query)
      if (tableName) {
        const { data, error } = await supabase.from(tableName).select('*')
        return { data, error }
      }
    }
    
    // 다른 쿼리의 경우 직접 실행 시도
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ sql_query: query })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { data: null, error: result }
    }
    
    return { data: result, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * 쿼리에서 테이블명 추출 (간단한 파서)
 */
function extractTableName(query) {
  const match = query.match(/FROM\s+(\w+)/i)
  return match ? match[1] : null
}

/**
 * SQL 파일 실행
 * @param {string} filePath - SQL 파일 경로
 */
async function executeSQLFile(filePath) {
  try {
    const fullPath = path.resolve(filePath)
    const sqlContent = fs.readFileSync(fullPath, 'utf8')
    
    console.log(`📄 SQL 파일 실행: ${filePath}`)
    return await executeSQL(sqlContent)
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * 결과 출력 포맷팅
 */
function formatResult(data, error) {
  if (error) {
    console.error('❌ 실행 오류:')
    console.error(JSON.stringify(error, null, 2))
    return
  }
  
  if (!data) {
    console.log('✅ 실행 완료 (반환 데이터 없음)')
    return
  }
  
  if (Array.isArray(data)) {
    console.log(`✅ 실행 완료: ${data.length}개 결과`)
    
    if (data.length > 0) {
      // 테이블 형태로 출력
      console.table(data.slice(0, 10)) // 처음 10개만
      
      if (data.length > 10) {
        console.log(`... 총 ${data.length}개 중 처음 10개만 표시`)
      }
    }
  } else {
    console.log('✅ 실행 완료:')
    console.log(JSON.stringify(data, null, 2))
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
🔧 Supabase SQL 실행기

사용법:
  node scripts/db-execute.js "SELECT * FROM posts"
  node scripts/db-execute.js --file path/to/query.sql

예시:
  node scripts/db-execute.js "SELECT COUNT(*) FROM posts"
  node scripts/db-execute.js --file upgrade-comments-table.sql
`)
    return
  }
  
  let result
  
  if (args[0] === '--file' || args[0] === '-f') {
    if (args.length < 2) {
      console.error('❌ 파일 경로가 필요합니다')
      return
    }
    result = await executeSQLFile(args[1])
  } else {
    const query = args.join(' ')
    result = await executeSQL(query)
  }
  
  formatResult(result.data, result.error)
}

// 스크립트 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { executeSQL, executeSQLFile }