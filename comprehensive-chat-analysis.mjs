/**
 * 🔍 채팅 시스템 A to Z 완전 분석 스크립트
 * 모든 에러의 근본 원인을 철저히 분석
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
const anonClient = createClient(supabaseUrl, supabaseAnonKey)

async function comprehensiveAnalysis() {
  console.log('🔍 A to Z 채팅 시스템 완전 분석\n')
  console.log('=' .repeat(80))

  const analysis = {
    infrastructure: {},
    authentication: {},
    database: {},
    permissions: {},
    application: {},
    recommendations: []
  }

  try {
    // ===========================
    // A. 인프라스트럭처 분석
    // ===========================
    console.log('\n🏗️ A. 인프라스트럭처 분석')
    console.log('-'.repeat(40))

    // API 연결 테스트
    const { data: healthCheck, error: healthError } = await serviceClient
      .from('profiles')
      .select('id')
      .limit(1)

    analysis.infrastructure.supabase_connection = !healthError
    analysis.infrastructure.api_endpoint = supabaseUrl
    console.log(`📡 Supabase 연결: ${!healthError ? '✅ 정상' : '❌ 실패'}`)

    if (healthError) {
      console.log(`   오류: ${healthError.message}`)
      analysis.infrastructure.connection_error = healthError.message
    }

    // ===========================
    // B. 인증 시스템 분석
    // ===========================
    console.log('\n🔐 B. 인증 시스템 분석')
    console.log('-'.repeat(40))

    // Service role 테스트
    const { data: serviceTest } = await serviceClient.auth.getSession()
    console.log(`🔑 Service Role: ${serviceTest ? '✅ 정상' : '❌ 실패'}`)
    analysis.authentication.service_role = !!serviceTest

    // Anon role 테스트
    try {
      const { data: anonTest, error: anonError } = await anonClient
        .from('profiles')
        .select('id')
        .limit(1)

      analysis.authentication.anon_role = !anonError
      console.log(`👤 Anon Role: ${!anonError ? '✅ 정상' : '❌ 실패'}`)
      if (anonError) {
        console.log(`   오류: ${anonError.message}`)
        analysis.authentication.anon_error = anonError.message
      }
    } catch (error) {
      analysis.authentication.anon_role = false
      analysis.authentication.anon_error = error.message
      console.log(`👤 Anon Role: ❌ 실패 - ${error.message}`)
    }

    // ===========================
    // C. 데이터베이스 스키마 분석
    // ===========================
    console.log('\n🗄️ C. 데이터베이스 스키마 분석')
    console.log('-'.repeat(40))

    const tables = ['profiles', 'chat_rooms', 'chat_messages', 'chat_participants', 'chat_room_members']
    analysis.database.tables = {}

    for (const table of tables) {
      try {
        const { data, error, count } = await serviceClient
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1)

        analysis.database.tables[table] = {
          exists: !error,
          row_count: count || 0,
          sample_columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          error: error?.message
        }

        console.log(`📋 ${table}: ${!error ? '✅' : '❌'} (${count || 0} rows)`)
        if (error) console.log(`   오류: ${error.message}`)
      } catch (err) {
        analysis.database.tables[table] = {
          exists: false,
          error: err.message
        }
        console.log(`📋 ${table}: ❌ ${err.message}`)
      }
    }

    // ===========================
    // D. RLS 정책 상태 분석
    // ===========================
    console.log('\n🛡️ D. RLS 정책 상태 분석')
    console.log('-'.repeat(40))

    for (const table of tables) {
      try {
        // RLS 활성화 상태 확인
        const { data: rlsStatus } = await serviceClient.rpc('sql', {
          query: `
            SELECT tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = '${table}'
          `
        })

        if (rlsStatus && rlsStatus.length > 0) {
          const isEnabled = rlsStatus[0].rowsecurity
          analysis.database.tables[table].rls_enabled = isEnabled
          console.log(`🔒 ${table} RLS: ${isEnabled ? '🟡 활성화됨' : '🟢 비활성화됨'}`)
        }
      } catch (error) {
        console.log(`🔒 ${table} RLS: ❓ 확인 불가`)
      }
    }

    // ===========================
    // E. 실제 쿼리 테스트
    // ===========================
    console.log('\n🧪 E. 실제 쿼리 테스트')
    console.log('-'.repeat(40))

    const testQueries = [
      {
        name: '채팅방 목록 조회',
        client: 'service',
        query: async () => await serviceClient
          .from('chat_rooms')
          .select('*')
          .limit(5)
      },
      {
        name: '채팅 메시지 조회',
        client: 'service',
        query: async () => await serviceClient
          .from('chat_messages')
          .select('*')
          .limit(5)
      },
      {
        name: '멤버십 조회',
        client: 'service',
        query: async () => await serviceClient
          .from('chat_room_members')
          .select('*')
          .limit(5)
      },
      {
        name: 'Anon 채팅 메시지 조회',
        client: 'anon',
        query: async () => await anonClient
          .from('chat_messages')
          .select('*')
          .limit(1)
      }
    ]

    analysis.database.query_tests = {}

    for (const test of testQueries) {
      try {
        const result = await test.query()
        const success = !result.error
        analysis.database.query_tests[test.name] = {
          success,
          client: test.client,
          row_count: result.data?.length || 0,
          error: result.error?.message
        }

        console.log(`🧪 ${test.name} (${test.client}): ${success ? '✅' : '❌'}`)
        if (result.error) {
          console.log(`   오류: ${result.error.message}`)
        } else {
          console.log(`   결과: ${result.data?.length || 0}개 행`)
        }
      } catch (error) {
        analysis.database.query_tests[test.name] = {
          success: false,
          client: test.client,
          error: error.message
        }
        console.log(`🧪 ${test.name} (${test.client}): ❌ ${error.message}`)
      }
    }

    // ===========================
    // F. 프론트엔드 애플리케이션 분석
    // ===========================
    console.log('\n💻 F. 프론트엔드 애플리케이션 분석')
    console.log('-'.repeat(40))

    // 환경 변수 확인
    console.log('🌍 환경 변수 상태:')
    console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
    console.log(`   ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}`)

    // ===========================
    // G. 종합 진단 및 권장사항
    // ===========================
    console.log('\n📊 G. 종합 진단')
    console.log('='.repeat(80))

    // 문제점 식별
    const issues = []

    if (!analysis.authentication.anon_role) {
      issues.push({
        severity: 'HIGH',
        category: 'Authentication',
        issue: 'Anon role 접근 실패',
        description: analysis.authentication.anon_error || '알 수 없는 오류',
        impact: '프론트엔드에서 데이터베이스 접근 불가'
      })
    }

    // RLS 정책 문제 확인
    const rlsIssues = Object.entries(analysis.database.tables)
      .filter(([table, info]) => info.rls_enabled)
      .map(([table]) => table)

    if (rlsIssues.length > 0) {
      issues.push({
        severity: 'HIGH',
        category: 'Security',
        issue: 'RLS 정책이 여전히 활성화됨',
        description: `활성화된 테이블: ${rlsIssues.join(', ')}`,
        impact: '권한 없는 사용자의 데이터 접근 차단'
      })
    }

    // 테이블 존재성 문제
    const missingTables = Object.entries(analysis.database.tables)
      .filter(([table, info]) => !info.exists)
      .map(([table]) => table)

    if (missingTables.length > 0) {
      issues.push({
        severity: 'CRITICAL',
        category: 'Database',
        issue: '필수 테이블 누락',
        description: `누락된 테이블: ${missingTables.join(', ')}`,
        impact: '채팅 기능 완전 불가'
      })
    }

    // 결과 출력
    console.log(`\n🔍 발견된 문제: ${issues.length}개`)
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.severity}] ${issue.issue}`)
      console.log(`   분류: ${issue.category}`)
      console.log(`   설명: ${issue.description}`)
      console.log(`   영향: ${issue.impact}`)
    })

    analysis.issues = issues

    // 권장 해결 순서
    console.log('\n🎯 권장 해결 순서:')
    console.log('1. 데이터베이스 RLS 정책 완전 비활성화')
    console.log('2. 테이블 권한 설정 (anon, authenticated 역할)')
    console.log('3. 기본 CRUD 쿼리 테스트')
    console.log('4. 프론트엔드 연결 테스트')
    console.log('5. 실시간 기능 단계별 활성화')

    return analysis

  } catch (error) {
    console.error('❌ 분석 중 치명적 오류:', error)
    analysis.critical_error = error.message
    return analysis
  }
}

// 실행
comprehensiveAnalysis().then(result => {
  console.log('\n📁 분석 완료!')
  console.log('상세 결과는 위 출력을 참조하세요.')
})