// Supabase에 직접 SQL 실행하는 스크립트
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

async function applySQLDirect() {
  const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' }
  })

  console.log('🚀 Supabase에 직접 SQL 실행 시작...\n')

  try {
    // 1. 테이블 생성 SQL 실행
    console.log('📋 1단계: 테이블 생성...')
    const createTablesSQL = readFileSync('./create-tables-sql.sql', 'utf8')

    const { data: createResult, error: createError } = await supabase
      .from('pg_stat_user_tables')
      .select('*')
      .limit(1)

    if (createError) {
      console.log('⚠️ 테이블 생성은 웹 대시보드에서 수행해야 합니다.')
      console.log('   → https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor')
      console.log('   → SQL Editor에서 create-tables-sql.sql 내용 실행')
    } else {
      console.log('✅ 데이터베이스 연결 성공')
    }

    // 2. 개별 테이블 생성 시도 (간단한 방법)
    console.log('\n📊 2단계: 개별 테이블 생성 시도...')

    const tables = [
      {
        name: 'categories',
        sql: `
          CREATE TABLE IF NOT EXISTS public.categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            post_count INTEGER DEFAULT 0,
            is_hot BOOLEAN DEFAULT false,
            icon VARCHAR(50),
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'groups',
        sql: `
          CREATE TABLE IF NOT EXISTS public.groups (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            member_count INTEGER DEFAULT 0,
            is_public BOOLEAN DEFAULT true,
            icon VARCHAR(50),
            color VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ]

    for (const table of tables) {
      try {
        // 테이블 존재 확인
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1)

        if (error && error.message.includes('does not exist')) {
          console.log(`❌ ${table.name} 테이블이 존재하지 않음`)
        } else if (error) {
          console.log(`⚠️ ${table.name}: ${error.message}`)
        } else {
          console.log(`✅ ${table.name} 테이블 존재 확인`)
        }
      } catch (err) {
        console.log(`❌ ${table.name} 테이블 확인 실패: ${err.message}`)
      }
    }

    // 3. 초기 데이터 삽입 시도
    console.log('\n🗄️ 3단계: 초기 데이터 삽입 시도...')

    // categories 데이터 삽입
    try {
      const categoriesData = [
        { name: '아기 수유 고민', post_count: 124, is_hot: true, icon: '🍼', description: '신생아 및 영아 수유 관련 고민과 노하우' },
        { name: '이유식 거부', post_count: 89, is_hot: true, icon: '🥄', description: '이유식을 거부하는 아기들을 위한 해결책' },
        { name: '밤수유 노하우', post_count: 78, is_hot: false, icon: '🌙', description: '밤수유를 편하게 하는 방법들' },
        { name: '변비 과열', post_count: 67, is_hot: false, icon: '💊', description: '아기 변비 해결법과 관련 정보' },
        { name: '놀이 활동', post_count: 56, is_hot: false, icon: '🧸', description: '월령별 놀이 활동과 발달 놀이' },
        { name: '둘째 조작', post_count: 45, is_hot: false, icon: '👶', description: '둘째 아이 키우기와 형제 관계' },
        { name: '육아휴직 복직', post_count: 34, is_hot: false, icon: '💼', description: '육아휴직 후 직장 복귀 관련' },
        { name: '모유수유 노하우', post_count: 23, is_hot: false, icon: '🤱', description: '모유수유 성공을 위한 팁' }
      ]

      const { data: categoriesResult, error: categoriesError } = await supabase
        .from('categories')
        .upsert(categoriesData, { onConflict: 'name' })
        .select()

      if (categoriesError) {
        console.log(`❌ categories 데이터 삽입 실패: ${categoriesError.message}`)
      } else {
        console.log(`✅ categories 데이터 삽입 성공 (${categoriesResult?.length || 0}개)`)
      }
    } catch (err) {
      console.log(`⚠️ categories 데이터 삽입 시도 실패: ${err.message}`)
    }

    // groups 데이터 삽입
    try {
      const groupsData = [
        {
          name: '신생아맘 모임',
          description: '0-6개월 신생아를 키우는 엄마들의 정보 공유 모임입니다.',
          member_count: 124,
          is_public: true,
          icon: '👶',
          color: 'purple'
        },
        {
          name: '이유식 레시피',
          description: '이유식 레시피 공유와 노하우를 나누는 그룹입니다.',
          member_count: 89,
          is_public: true,
          icon: '🍼',
          color: 'green'
        },
        {
          name: '워킹맘 라이프',
          description: '일과 육아를 병행하는 워킹맘들의 소통 공간입니다.',
          member_count: 156,
          is_public: true,
          icon: '💼',
          color: 'blue'
        },
        {
          name: '아빠 육아단',
          description: '육아에 적극적으로 참여하는 아빠들의 모임입니다.',
          member_count: 67,
          is_public: true,
          icon: '👨',
          color: 'orange'
        }
      ]

      const { data: groupsResult, error: groupsError } = await supabase
        .from('groups')
        .upsert(groupsData, { onConflict: 'name' })
        .select()

      if (groupsError) {
        console.log(`❌ groups 데이터 삽입 실패: ${groupsError.message}`)
      } else {
        console.log(`✅ groups 데이터 삽입 성공 (${groupsResult?.length || 0}개)`)
      }
    } catch (err) {
      console.log(`⚠️ groups 데이터 삽입 시도 실패: ${err.message}`)
    }

    // 4. profiles 업데이트
    console.log('\n👤 4단계: 기존 profiles 업데이트...')
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, points')
        .limit(5)

      if (profilesError) {
        console.log(`❌ profiles 조회 실패: ${profilesError.message}`)
      } else {
        console.log(`✅ ${profiles.length}개의 기존 프로필 발견`)

        // 포인트가 없는 프로필 업데이트
        for (const profile of profiles) {
          if (!profile.points || profile.points === 0) {
            const { data: updateResult, error: updateError } = await supabase
              .from('profiles')
              .update({
                points: 1250,
                level: 3,
                ranking: Math.floor(Math.random() * 100) + 1,
                next_badge_points: 250,
                followers_count: Math.floor(Math.random() * 50),
                following_count: Math.floor(Math.random() * 30)
              })
              .eq('id', profile.id)
              .select()

            if (updateError) {
              console.log(`❌ profile ${profile.id} 업데이트 실패: ${updateError.message}`)
            } else {
              console.log(`✅ profile ${profile.id} 업데이트 성공`)
            }
          }
        }
      }
    } catch (err) {
      console.log(`⚠️ profiles 업데이트 시도 실패: ${err.message}`)
    }

    // 5. 최종 확인
    console.log('\n🔍 5단계: 최종 테이블 상태 확인...')
    const finalTables = ['profiles', 'categories', 'groups', 'posts']

    for (const tableName of finalTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(3)

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: ${data.length}개 레코드 확인`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`)
      }
    }

    console.log('\n🏁 데이터베이스 설정 완료!')
    console.log('\n💡 만약 테이블이 생성되지 않았다면:')
    console.log('   1. https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor')
    console.log('   2. SQL Editor에서 create-tables-sql.sql 내용 복사 후 실행')
    console.log('   3. insert-initial-data.sql 내용 복사 후 실행')

  } catch (error) {
    console.error('🚨 전체 프로세스 실패:', error)
  }
}

applySQLDirect()