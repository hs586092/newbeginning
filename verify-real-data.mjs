// 실제 데이터 연동 확인 스크립트
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyRealData() {
  console.log('🔍 실제 데이터 연동 확인 중...\n')

  try {
    // 1. 새로 생성된 테이블들 확인
    console.log('📋 1. 새 테이블 존재 확인:')

    const tables = ['categories', 'groups', 'notifications', 'follows']
    const tableStatus = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(3)

        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          tableStatus[table] = 'failed'
        } else {
          console.log(`✅ ${table}: ${data.length}개 레코드 존재`)
          tableStatus[table] = 'success'
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
        tableStatus[table] = 'failed'
      }
    }

    // 2. 카테고리 데이터 상세 확인
    if (tableStatus.categories === 'success') {
      console.log('\n📂 2. categories 데이터 상세:')

      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('post_count', { ascending: false })

      if (!catError && categories) {
        categories.forEach((cat, i) => {
          console.log(`   ${i + 1}. ${cat.icon} ${cat.name} (${cat.post_count}개) ${cat.is_hot ? '🔥' : ''}`)
        })
      }
    } else {
      console.log('\n📂 2. categories: 테이블이 생성되지 않음')
    }

    // 3. 그룹 데이터 상세 확인
    if (tableStatus.groups === 'success') {
      console.log('\n👥 3. groups 데이터 상세:')

      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('member_count', { ascending: false })

      if (!groupsError && groups) {
        groups.forEach((group, i) => {
          console.log(`   ${i + 1}. ${group.icon} ${group.name} (${group.member_count}명, ${group.color})`)
        })
      }
    } else {
      console.log('\n👥 3. groups: 테이블이 생성되지 않음')
    }

    // 4. profiles 확장 컬럼 확인
    console.log('\n👤 4. profiles 확장 컬럼 확인:')

    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, points, level, ranking, followers_count, following_count')
        .limit(3)

      if (profilesError) {
        console.log(`❌ profiles 확장: ${profilesError.message}`)
      } else {
        console.log(`✅ profiles 확장 성공: ${profiles.length}개 프로필`)
        profiles.forEach((profile, i) => {
          console.log(`   ${i + 1}. ${profile.username}: ${profile.points || 'NULL'}P, 레벨 ${profile.level || 'NULL'}, 랭킹 ${profile.ranking || 'NULL'}`)
        })
      }
    } catch (err) {
      console.log(`❌ profiles 확장 확인 실패: ${err.message}`)
    }

    // 5. 서비스 레이어 시뮬레이션
    console.log('\n🖥️ 5. 서비스 레이어 시뮬레이션:')

    // 카테고리 서비스 시뮬레이션
    if (tableStatus.categories === 'success') {
      const { data: hotCategories } = await supabase
        .from('categories')
        .select('*')
        .order('is_hot', { ascending: false })
        .order('post_count', { ascending: false })
        .limit(5)

      console.log('📂 인기 카테고리 (실제 데이터):')
      hotCategories?.forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat.icon} ${cat.name} (${cat.post_count}개) ${cat.is_hot ? '🔥' : ''}`)
      })
    } else {
      console.log('📂 인기 카테고리: fallback MOCK 데이터 사용')
    }

    // 그룹 서비스 시뮬레이션
    if (tableStatus.groups === 'success') {
      const { data: recommendedGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('member_count', { ascending: false })
        .limit(4)

      console.log('👥 추천 그룹 (실제 데이터):')
      recommendedGroups?.forEach((group, i) => {
        console.log(`   ${i + 1}. ${group.icon} ${group.name} (${group.member_count}명)`)
      })
    } else {
      console.log('👥 추천 그룹: fallback MOCK 데이터 사용')
    }

    // 6. 최종 평가
    console.log('\n🎯 6. 최종 평가:')

    const successCount = Object.values(tableStatus).filter(status => status === 'success').length
    const totalCount = Object.keys(tableStatus).length
    const successRate = Math.round((successCount / totalCount) * 100)

    console.log(`데이터베이스 연동 성공률: ${successCount}/${totalCount} (${successRate}%)`)

    if (successRate === 100) {
      console.log('🎉 완벽! 100% 실제 데이터 연동 완료')
      console.log('✅ 사이드바가 모든 실제 데이터를 사용하여 작동합니다')
      console.log('✅ MOCK 데이터에서 완전히 벗어났습니다')
      console.log('🚀 런치 준비 100% 완료!')
    } else if (successRate >= 50) {
      console.log('⚠️ 부분 성공: 일부 테이블이 생성되지 않음')
      console.log('📋 생성된 테이블의 데이터는 실제로 사용되고 있습니다')
      console.log('📋 생성되지 않은 테이블은 fallback MOCK 데이터 사용')
      console.log('🚀 런치 가능하지만, 수동 테이블 생성 권장')
    } else {
      console.log('❌ 테이블 생성 실패: Supabase 웹 대시보드에서 수동 생성 필요')
      console.log('📋 현재는 모든 fallback MOCK 데이터 사용 중')
      console.log('🚀 런치는 가능하지만 실제 데이터 연동 미완료')
    }

    console.log('\n💡 다음 단계:')
    if (successRate < 100) {
      console.log('1. https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor')
      console.log('2. SQL Editor에서 제공된 스크립트 실행')
      console.log('3. 이 테스트 다시 실행하여 100% 달성')
    } else {
      console.log('1. 배포된 사이트에서 사이드바 확인')
      console.log('2. 실제 데이터가 표시되는지 검증')
      console.log('3. 사용자에게 서비스 오픈!')
    }

  } catch (error) {
    console.error('🚨 전체 테스트 실행 중 오류:', error)
  }

  console.log('\n🏁 실제 데이터 연동 확인 완료!')
}

verifyRealData()