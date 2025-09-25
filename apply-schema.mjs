// Phase 1 데이터베이스 스키마 적용 스크립트
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

async function applySchema() {
  const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🚀 Phase 1 데이터베이스 스키마 적용 시작...\n')

  try {
    // 스키마 파일 읽기
    const schemaSQL = readFileSync('./database/phase1-schema.sql', 'utf8')

    console.log('📄 스키마 파일 읽기 완료')
    console.log(`📊 스키마 크기: ${Math.round(schemaSQL.length / 1024)}KB\n`)

    // 스키마를 여러 부분으로 나누어 실행 (PostgreSQL 한계 때문)
    const sqlStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`🔧 총 ${sqlStatements.length}개의 SQL 문장 실행 예정\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]

      // 빈 문장이나 주석 건너뛰기
      if (!statement || statement.startsWith('--') || statement.trim() === '') {
        continue
      }

      try {
        console.log(`⚡ 실행 중 (${i + 1}/${sqlStatements.length}): ${statement.substring(0, 50)}...`)

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        })

        if (error) {
          console.log(`❌ 오류: ${error.message}`)
          // 테이블이 이미 존재하거나, 컬럼이 이미 존재하는 경우는 무시
          if (error.message.includes('already exists') ||
              error.message.includes('already defined') ||
              error.message.includes('duplicate')) {
            console.log(`   └─ ℹ️ 이미 존재함 - 건너뛰기`)
            successCount++
          } else {
            errorCount++
          }
        } else {
          console.log(`   └─ ✅ 성공`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ 예외: ${err.message}`)

        // RPC 함수가 없는 경우 직접 쿼리 실행
        try {
          const { data, error } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1)

          if (!error) {
            console.log('   └─ ℹ️ RPC 함수 미지원 - 개별 쿼리 실행 방식으로 변경 필요')
          }
        } catch (directError) {
          console.log(`   └─ 🚨 직접 쿼리도 실패: ${directError.message}`)
        }

        errorCount++
      }

      // 너무 빠른 요청 방지
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n📊 실행 결과:`)
    console.log(`   ✅ 성공: ${successCount}개`)
    console.log(`   ❌ 오류: ${errorCount}개`)

    // 테이블 존재 확인
    console.log(`\n🔍 테이블 생성 확인 중...`)

    const tables = ['profiles', 'categories', 'groups', 'group_memberships', 'notifications', 'follows']

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: 테이블 존재 확인`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`)
      }
    }

    console.log(`\n🏁 Phase 1 스키마 적용 완료!`)

  } catch (error) {
    console.error('🚨 전체 스키마 적용 실패:', error)
  }
}

applySchema()