#!/usr/bin/env node
/**
 * Supabase 스키마 조회 시스템
 * 테이블, 컬럼, 인덱스, RLS 정책 등 모든 스키마 정보 조회
 * 사용법: node scripts/db-schema.js [table_name]
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수 오류: SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * 모든 테이블 목록 조회
 */
async function getAllTables() {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_type')
    .eq('table_schema', 'public')
    .order('table_name')

  if (error) {
    console.error('❌ 테이블 목록 조회 오류:', error)
    return []
  }

  return data || []
}

/**
 * 특정 테이블의 컬럼 정보 조회
 */
async function getTableColumns(tableName) {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select(`
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    `)
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .order('ordinal_position')

  if (error) {
    console.error(`❌ ${tableName} 컬럼 조회 오류:`, error)
    return []
  }

  return data || []
}

/**
 * 테이블의 인덱스 정보 조회
 */
async function getTableIndexes(tableName) {
  const query = `
    SELECT 
      indexname,
      indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = '${tableName}'
    ORDER BY indexname;
  `

  try {
    // 직접 SQL 실행
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ sql_query: query })
    })

    if (response.ok) {
      return await response.json()
    } else {
      // 대안 방법: pg_stat_user_indexes 뷰 사용
      const { data, error } = await supabase
        .from('pg_stat_user_indexes')
        .select('indexrelname, schemaname, relname')
        .eq('schemaname', 'public')
        .eq('relname', tableName)

      return data || []
    }
  } catch (err) {
    console.log(`⚠️ ${tableName} 인덱스 조회 실패:`, err.message)
    return []
  }
}

/**
 * RLS 정책 조회
 */
async function getRLSPolicies(tableName) {
  const query = `
    SELECT 
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = '${tableName}'
    ORDER BY policyname;
  `

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ sql_query: query })
    })

    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (err) {
    console.log(`⚠️ ${tableName} RLS 정책 조회 실패:`, err.message)
    return []
  }
}

/**
 * 외래키 관계 조회
 */
async function getForeignKeys(tableName) {
  const query = `
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = '${tableName}';
  `

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ sql_query: query })
    })

    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (err) {
    console.log(`⚠️ ${tableName} 외래키 조회 실패:`, err.message)
    return []
  }
}

/**
 * 테이블 상세 정보 출력
 */
async function displayTableDetails(tableName) {
  console.log(`\n📋 테이블: ${tableName}`)
  console.log('='.repeat(50))

  // 컬럼 정보
  const columns = await getTableColumns(tableName)
  if (columns.length > 0) {
    console.log('\n🏗️  컬럼 정보:')
    console.table(columns.map(col => ({
      컬럼명: col.column_name,
      타입: col.data_type,
      널허용: col.is_nullable,
      기본값: col.column_default || '-',
      최대길이: col.character_maximum_length || '-'
    })))
  }

  // 외래키 관계
  const foreignKeys = await getForeignKeys(tableName)
  if (foreignKeys.length > 0) {
    console.log('\n🔗 외래키 관계:')
    console.table(foreignKeys.map(fk => ({
      제약명: fk.constraint_name,
      컬럼: fk.column_name,
      참조테이블: fk.foreign_table_name,
      참조컬럼: fk.foreign_column_name
    })))
  }

  // 인덱스 정보
  const indexes = await getTableIndexes(tableName)
  if (indexes.length > 0) {
    console.log('\n📊 인덱스:')
    indexes.forEach(idx => {
      console.log(`  • ${idx.indexname || idx.indexrelname}`)
      if (idx.indexdef) {
        console.log(`    ${idx.indexdef}`)
      }
    })
  }

  // RLS 정책
  const policies = await getRLSPolicies(tableName)
  if (policies.length > 0) {
    console.log('\n🛡️  RLS 정책:')
    policies.forEach(policy => {
      console.log(`  • ${policy.policyname} (${policy.cmd})`)
      if (policy.qual) {
        console.log(`    조건: ${policy.qual}`)
      }
      if (policy.with_check) {
        console.log(`    체크: ${policy.with_check}`)
      }
    })
  }
}

/**
 * 전체 데이터베이스 개요
 */
async function displayDatabaseOverview() {
  console.log('🗄️  데이터베이스 스키마 개요')
  console.log('='.repeat(50))

  const tables = await getAllTables()
  
  if (tables.length === 0) {
    console.log('❌ 테이블을 찾을 수 없습니다.')
    return
  }

  console.log(`\n📊 총 ${tables.length}개 테이블:`)
  
  for (const table of tables) {
    const columns = await getTableColumns(table.table_name)
    console.log(`  📋 ${table.table_name} (${columns.length}개 컬럼)`)
  }

  console.log('\n상세 정보를 보려면:')
  console.log('node scripts/db-schema.js <table_name>')
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    await displayDatabaseOverview()
  } else {
    const tableName = args[0]
    await displayTableDetails(tableName)
  }
}

// 스크립트 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { getAllTables, getTableColumns, getTableIndexes, getRLSPolicies }